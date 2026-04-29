import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

function freshModule() {
  vi.resetModules();
  return import('./rate-limit');
}

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
    vi.stubEnv('RATE_LIMIT_FAIL_OPEN', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('no-ops (allows) in non-production when credentials are missing', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const { checkRateLimit } = await freshModule();
    const res = await checkRateLimit('k');
    expect(res.allowed).toBe(true);
  });

  it('FAILS CLOSED in production when credentials are missing', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { checkRateLimit } = await freshModule();
    const res = await checkRateLimit('k');
    expect(res.allowed).toBe(false);
  });

  it('honors RATE_LIMIT_FAIL_OPEN=1 override in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('RATE_LIMIT_FAIL_OPEN', '1');
    const { checkRateLimit } = await freshModule();
    const res = await checkRateLimit('k');
    expect(res.allowed).toBe(true);
  });

  it('honors RATE_LIMIT_FAIL_OPEN=0 override in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('RATE_LIMIT_FAIL_OPEN', '0');
    const { checkRateLimit } = await freshModule();
    const res = await checkRateLimit('k');
    expect(res.allowed).toBe(false);
  });

  it('returns backend success when credentials are present', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://example.upstash.io');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'abc');
    vi.stubEnv('NODE_ENV', 'production');

    vi.doMock('@upstash/redis', () => ({
      Redis: class { constructor() {} },
    }));
    const limitSpy = vi.fn(async () => ({ success: true }));
    class FakeRatelimit {
      static slidingWindow() { return {}; }
      limit = limitSpy;
    }
    vi.doMock('@upstash/ratelimit', () => ({
      Ratelimit: FakeRatelimit,
    }));

    const { checkRateLimit } = await freshModule();
    const res = await checkRateLimit('k');
    expect(res.allowed).toBe(true);
    expect(limitSpy).toHaveBeenCalledWith('k');
  });

  it('FAILS CLOSED in production when the backend throws', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://example.upstash.io');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'abc');
    vi.stubEnv('NODE_ENV', 'production');

    vi.doMock('@upstash/redis', () => ({ Redis: class { constructor() {} } }));
    class FakeRatelimit {
      static slidingWindow() { return {}; }
      limit = vi.fn(async () => { throw new Error('redis down'); });
    }
    vi.doMock('@upstash/ratelimit', () => ({ Ratelimit: FakeRatelimit }));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { checkRateLimit } = await freshModule();
    const res = await checkRateLimit('k');
    expect(res.allowed).toBe(false);
  });

  it('caches the limiter across calls within a module instance', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://example.upstash.io');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'abc');
    vi.stubEnv('NODE_ENV', 'production');

    const ctorSpy = vi.fn();
    vi.doMock('@upstash/redis', () => ({
      Redis: class { constructor(..._args: unknown[]) { ctorSpy(); } },
    }));
    const limitSpy = vi.fn(async () => ({ success: true }));
    class FakeRatelimit {
      static slidingWindow() { return {}; }
      limit = limitSpy;
    }
    vi.doMock('@upstash/ratelimit', () => ({ Ratelimit: FakeRatelimit }));

    const { checkRateLimit } = await freshModule();
    await checkRateLimit('one');
    await checkRateLimit('two');
    expect(limitSpy).toHaveBeenCalledTimes(2);
    // The Redis client should only be constructed once — second call hits the cache.
    expect(ctorSpy).toHaveBeenCalledTimes(1);
  });

  it('_resetLimiterForTests clears the cached limiter between tests', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://example.upstash.io');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'abc');
    vi.stubEnv('NODE_ENV', 'production');
    vi.doMock('@upstash/redis', () => ({ Redis: class { constructor() {} } }));
    class FakeRatelimit {
      static slidingWindow() { return {}; }
      limit = vi.fn(async () => ({ success: true }));
    }
    vi.doMock('@upstash/ratelimit', () => ({ Ratelimit: FakeRatelimit }));

    const mod = await freshModule();
    await mod.checkRateLimit('k');
    expect(() => mod._resetLimiterForTests()).not.toThrow();
  });

  it('opens on backend error in dev (legacy convenience)', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://example.upstash.io');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'abc');
    vi.stubEnv('NODE_ENV', 'development');

    vi.doMock('@upstash/redis', () => ({ Redis: class { constructor() {} } }));
    class FakeRatelimit {
      static slidingWindow() { return {}; }
      limit = vi.fn(async () => { throw new Error('redis down'); });
    }
    vi.doMock('@upstash/ratelimit', () => ({ Ratelimit: FakeRatelimit }));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { checkRateLimit } = await freshModule();
    const res = await checkRateLimit('k');
    expect(res.allowed).toBe(true);
  });
});
