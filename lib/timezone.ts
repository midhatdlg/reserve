/**
 * Tiny timezone helpers. We deliberately avoid `date-fns-tz`/`luxon` because
 * wedding pages are highly latency-sensitive and every kB matters on the
 * RSVP critical path. `Intl.DateTimeFormat` with a `timeZone` option is
 * enough to do the two conversions we actually need:
 *
 *   1. Given a "civil" wall-clock time (YYYY-MM-DD [HH:MM]) in an IANA
 *      timezone, compute the corresponding UTC `Date`. Used by the
 *      countdown and by the .ics generator.
 *   2. Validate that a string looks like an IANA timezone so we fail
 *      loudly when the couple's settings become corrupt.
 */

const IANA_PATTERN = /^[A-Za-z]+(?:[_\-/][A-Za-z0-9_+-]+)*$/;

/**
 * Returns true if Node/browser Intl recognises the string as a valid IANA
 * time zone. We memoize because `Intl.DateTimeFormat` is surprisingly slow
 * to construct when called per render.
 */
const validTzCache = new Map<string, boolean>();
export function isValidTimeZone(tz: string): boolean {
  if (typeof tz !== 'string' || !IANA_PATTERN.test(tz)) return false;
  const cached = validTzCache.get(tz);
  if (cached !== undefined) return cached;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    validTzCache.set(tz, true);
    return true;
  } catch {
    validTzCache.set(tz, false);
    return false;
  }
}

/**
 * Number of milliseconds that you'd add to a UTC instant to get the wall
 * clock in `tz` at that moment. i.e. `localMs - utcMs = offset(tz, utcMs)`.
 */
function tzOffsetMs(utcMs: number, tz: string): number {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date(utcMs));
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  const hour = Number(map.hour) === 24 ? 0 : Number(map.hour);
  const asUtc = Date.UTC(
    Number(map.year), Number(map.month) - 1, Number(map.day),
    hour, Number(map.minute), Number(map.second)
  );
  return asUtc - utcMs;
}

/**
 * Convert a civil date+time in `tz` into the equivalent UTC `Date`.
 *
 * We compute the offset twice to handle DST fall-back correctly: the first
 * guess may land inside a "spring forward" gap or "fall back" overlap, and
 * re-reading the offset at the guessed instant converges.
 */
export function civilToUtc(
  year: number,
  month: number, // 1-12
  day: number,
  hour: number,
  minute: number,
  tz: string
): Date {
  const naiveUtc = Date.UTC(year, month - 1, day, hour, minute);
  const off1 = tzOffsetMs(naiveUtc, tz);
  const off2 = tzOffsetMs(naiveUtc - off1, tz);
  return new Date(naiveUtc - off2);
}

/**
 * Parse a "YYYY-MM-DD" + optional "HH:MM[:SS]" pair in the given timezone
 * and return the UTC `Date`. `timeStr` may be null, in which case we
 * default to 00:00 local.
 */
export function parseCivilInTz(
  dateStr: string,
  timeStr: string | null | undefined,
  tz: string
): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new Error(`Invalid wedding date: ${dateStr}`);
  }
  const [y, m, d] = dateStr.split('-').map(Number);
  let h = 0;
  let mi = 0;
  if (timeStr) {
    const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(timeStr);
    if (!match) throw new Error(`Invalid time: ${timeStr}`);
    h = Number(match[1]);
    mi = Number(match[2]);
  }
  const safeTz = isValidTimeZone(tz) ? tz : 'UTC';
  return civilToUtc(y, m, d, h, mi, safeTz);
}

/**
 * Whole-unit breakdown of a positive duration. Clamps to zero when the
 * target has passed so UIs never display negative counters.
 */
export function timeUntil(target: Date, now: Date = new Date()): {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const totalMs = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(totalMs / 86_400_000);
  const hours = Math.floor((totalMs / 3_600_000) % 24);
  const minutes = Math.floor((totalMs / 60_000) % 60);
  const seconds = Math.floor((totalMs / 1000) % 60);
  return { totalMs, days, hours, minutes, seconds };
}
