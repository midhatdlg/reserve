import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { GuestTableV2 } from '@/components/dashboard/GuestTableV2';

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

  const settings = (wedding.settings as Record<string, unknown>) ?? {};
  const togetherSets = Array.isArray(settings.auto_seat_together_sets)
    ? (settings.auto_seat_together_sets as unknown[]).filter(
      (set): set is string[] => Array.isArray(set) && set.every((g) => typeof g === 'string'),
    )
    : [];

  return (
    <GuestTableV2
      weddingId={wedding.id}
      weddingSlug={wedding.slug}
      initialInvites={invites ?? []}
      initialMealOptions={wedding.meal_options ?? ['Chicken', 'Fish', 'Vegetarian', 'Vegan']}
      initialMealEnabled={settings.meal_selection_enabled !== false}
      initialTogetherSets={togetherSets}
    />
  );
}
