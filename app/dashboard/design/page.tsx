import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DesignEditor } from '@/components/dashboard/DesignEditor';

export default async function DesignPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, slug, title, wedding_date, venue_name, venue_address, venue_lat, venue_lng, template_id, invite_bg_color, template_overrides, template_content, selected_blocks, timezone, custom_design_url, design_zones')
    .eq('couple_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!wedding) redirect('/setup');

  // Fetch related data for the live preview in parallel
  const [eventsRes, photosRes, questionsRes, inviteRes] = await Promise.all([
    supabase
      .from('events')
      .select('*')
      .eq('wedding_id', wedding.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('photos')
      .select('*')
      .eq('wedding_id', wedding.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('questions')
      .select('*')
      .eq('wedding_id', wedding.id)
      .eq('is_pinned', true)
      .order('created_at', { ascending: true }),
    supabase
      .from('invites')
      .select('*')
      .eq('wedding_id', wedding.id)
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <div>
      <DesignEditor
        wedding={wedding}
        slug={wedding.slug}
        events={eventsRes.data ?? []}
        photos={photosRes.data ?? []}
        questions={questionsRes.data ?? []}
        sampleInvite={inviteRes.data ?? null}
      />
    </div>
  );
}
