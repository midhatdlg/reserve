import { parseCivilInTz } from '@/lib/timezone';

/**
 * Choose the calendar event window, anchored in the wedding's timezone.
 *
 *   - If any events have a `start_time`, use the earliest start and the
 *     latest `end_time` (or latest start + 1h if no ends are set). Event
 *     timestamps are already absolute (`timestamptz`), so `new Date(s)`
 *     gives the correct UTC instant — no tz conversion needed.
 *   - Otherwise fall back to a 4-hour block anchored at 14:00 local time
 *     on the wedding date. `weddingDate` is `YYYY-MM-DD`, and `tz` is an
 *     IANA name (`Europe/London`, `America/New_York`, …).
 */
export function pickEventWindow(
  weddingDate: string,
  events: { start_time: string | null; end_time: string | null }[],
  tz: string = 'UTC'
): { start: Date; end: Date } {
  const withStart = events.filter((e) => e.start_time);
  if (withStart.length > 0) {
    const starts = withStart.map((e) => new Date(e.start_time as string).getTime());
    const ends = events
      .filter((e) => e.end_time)
      .map((e) => new Date(e.end_time as string).getTime());
    const min = Math.min(...starts);
    const max = ends.length > 0 ? Math.max(...ends) : Math.max(...starts) + 60 * 60 * 1000;
    return { start: new Date(min), end: new Date(max) };
  }

  const start = parseCivilInTz(weddingDate, '14:00', tz);
  const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
  return { start, end };
}
