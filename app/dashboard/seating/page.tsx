import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SeatingChart } from '@/components/dashboard/SeatingChart';

export default async function SeatingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id')
    .eq('couple_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!wedding) redirect('/setup');

  const [{ data: invites }, { data: rsvps }] = await Promise.all([
    supabase
      .from('invites')
      .select('id, guest_name, max_guests, table_number, table_name, group_name, side, status')
      .eq('wedding_id', wedding.id)
      .order('guest_name'),
    supabase
      .from('rsvps')
      .select('id, invite_id, person_name, attending, table_number, table_name')
      .eq('wedding_id', wedding.id),
  ]);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-montserrat)', fontSize: 22, fontWeight: 600, color: 'var(--text)', margin: '0 0 4px' }}>
          Seating
        </h1>
        <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
          Assign guests to tables
        </p>
      </div>
      <SeatingChart weddingId={wedding.id} initialInvites={invites ?? []} initialRsvps={rsvps ?? []} />
    </div>
  );
}
