/**
 * Rate limiting via Upstash Redis.
 *
 * Policy:
 *   • Production:  if Upstash credentials are missing OR the backend throws,
 *                  we FAIL CLOSED — the caller should treat the attempt as
 *                  rate-limited. A silent no-op in production would turn
 *                  every public endpoint into an unbounded write amplifier.
 *   • Non-prod:    with no credentials we no-op (allow). This keeps local
 *                  dev and test environments fast and deterministic without
 *                  forcing every contributor to stand up Redis.
 *
 * The policy can be overridden with `RATE_LIMIT_FAIL_OPEN=1` (emergency
 * fail-open switch) or `RATE_LIMIT_FAIL_OPEN=0` (force fail-closed even in
 * dev when you want to exercise the code path).
 */

let limiter: import('@upstash/ratelimit').Ratelimit | null = null;

type LimiterHandle = import('@upstash/ratelimit').Ratelimit;

async function getLimiter(): Promise<LimiterHandle | null> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  if (limiter) return limiter;
  const { Ratelimit } = await import('@upstash/ratelimit');
  const { Redis } = await import('@upstash/redis');
  limiter = new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(10, '1 m'),
  });
  return limiter;
}

function resolveFailOpen(): boolean {
  const override = process.env.RATE_LIMIT_FAIL_OPEN;
  if (override === '1') return true;
  if (override === '0') return false;
  return process.env.NODE_ENV !== 'production';
}

export async function checkRateLimit(identifier: string): Promise<{ allowed: boolean }> {
  try {
    const rl = await getLimiter();
    if (!rl) {
      return { allowed: resolveFailOpen() };
    }
    const { success } = await rl.limit(identifier);
    return { allowed: success };
  } catch (err) {
    console.error('rate-limit backend error', err);
    return { allowed: resolveFailOpen() };
  }
}

// Exported for tests — resets the cached limiter between runs.
export function _resetLimiterForTests() {
  limiter = null;
}
