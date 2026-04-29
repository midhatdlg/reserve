import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ItineraryBuilder } from '@/components/dashboard/ItineraryBuilder';

const DEFAULT_EVENTS = [
  { name: 'Pre-wedding Photoshoot', event_type: 'photoshoot', sort_order: 0 },
  { name: 'Cocktail Hour',          event_type: 'cocktail',   sort_order: 1 },
  { name: 'Couple Entrance',        event_type: 'entrance',   sort_order: 2 },
  { name: 'Dinner',                 event_type: 'dinner',     sort_order: 3 },
  { name: 'Dance Floor',            event_type: 'dancing',    sort_order: 4 },
];

export default async function ItineraryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, slug')
    .eq('couple_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!wedding) redirect('/setup');

  let { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('sort_order');

  // Seed defaults if no events exist yet
  if (!events || events.length === 0) {
    const rows = DEFAULT_EVENTS.map((e) => ({ ...e, wedding_id: wedding.id }));
    const { data: inserted } = await supabase
      .from('events')
      .insert(rows)
      .select('*');
    events = inserted ?? [];
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-montserrat)', fontSize: 22, fontWeight: 600, color: 'var(--text)', margin: '0 0 4px' }}>
          Itinerary
        </h1>
        <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
          Build the timeline for your day
        </p>
      </div>
      <ItineraryBuilder weddingId={wedding.id} initialEvents={events ?? []} />
    </div>
  );
}
