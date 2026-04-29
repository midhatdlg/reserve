import { createAdminClient } from '@/lib/supabase/admin';
import { buildIcs } from '@/lib/ics';
import { parseCivilInTz } from '@/lib/timezone';

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, title, wedding_date, venue_name, venue_address, timezone, is_published, updated_at')
    .eq('slug', slug)
    .maybeSingle();

  if (!wedding || !wedding.is_published) return new Response('Not found', { status: 404 });
  if (!wedding.wedding_date) return new Response('Wedding date not set', { status: 404 });

  const { data: events } = await supabase
    .from('events')
    .select('start_time, end_time')
    .eq('wedding_id', wedding.id)
    .order('sort_order', { ascending: true });

  const tz = (wedding.timezone as string | null) ?? 'UTC';
  const { start, end } = pickEventWindow(
    wedding.wedding_date as string,
    (events ?? []) as { start_time: string | null; end_time: string | null }[],
    tz
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://thelovelist.app';
  const location = [wedding.venue_name, wedding.venue_address].filter(Boolean).join(', ');
  const ics = buildIcs({
    uid: `${wedding.id}@thelovelist`,
    sequence: wedding.updated_at ? Math.floor(new Date(wedding.updated_at as string).getTime() / 1000) : 0,
    title: wedding.title ?? 'Wedding',
    description: 'See full details and your table assignment in your invite.',
    ...(location ? { location } : {}),
    start,
    end,
    url: `${appUrl}/invite/${slug}`,
  });

  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="wedding.ics"`,
    },
  });
}

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
