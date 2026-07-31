import { createAdminClient } from '@/lib/supabase/admin';
import { buildIcs } from '@/lib/ics';
import { pickEventWindow } from '@/lib/pick-event-window';

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
