import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { GuestTable } from '@/components/dashboard/GuestTable';

export default async function GuestsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, slug, meal_options, settings')
    .eq('couple_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!wedding) redirect('/setup');

  const { data: invites } = await supabase
    .from('invites')
    .select('*, rsvps(*)')
    .eq('wedding_id', wedding.id)
    .order('created_at');

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-montserrat)', fontSize: 22, fontWeight: 600, color: 'var(--text)', margin: '0 0 4px' }}>
          Guests
        </h1>
        <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
          Manage invite links and seat allocations
        </p>
      </div>
      <GuestTable weddingId={wedding.id} weddingSlug={wedding.slug} initialInvites={invites ?? []} initialMealOptions={wedding.meal_options ?? ['Chicken', 'Fish', 'Vegetarian', 'Vegan']} initialMealEnabled={(wedding.settings as Record<string, unknown>)?.meal_selection_enabled !== false} />
    </div>
  );
}
