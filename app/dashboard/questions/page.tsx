import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { QuestionsManager } from '@/components/dashboard/QuestionsManager';

export default async function QuestionsPage() {
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

  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: false });

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-montserrat)', fontSize: 22, fontWeight: 600, color: 'var(--text)', margin: '0 0 4px' }}>
          Q&amp;A
        </h1>
        <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
          Answer guest questions and pin FAQs to your invite
        </p>
      </div>
      <QuestionsManager weddingId={wedding.id} initialQuestions={questions ?? []} />
    </div>
  );
}
