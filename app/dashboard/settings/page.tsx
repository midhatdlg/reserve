import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SettingsForm } from '@/components/dashboard/SettingsForm';

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ upgraded?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: wedding }, { data: couple }] = await Promise.all([
    supabase.from('weddings').select('*').eq('couple_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('couples').select('*').eq('id', user.id).maybeSingle(),
  ]);

  if (!wedding || !couple) redirect('/setup');

  const { upgraded } = await searchParams;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-montserrat)', fontSize: 22, fontWeight: 600, color: 'var(--text)', margin: '0 0 4px' }}>
          Settings
        </h1>
        <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
          Manage your wedding and account
        </p>
      </div>
      <SettingsForm wedding={wedding} couple={couple} upgraded={upgraded === '1'} />
    </div>
  );
}
