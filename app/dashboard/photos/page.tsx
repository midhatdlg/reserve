import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PhotoUploader } from '@/components/dashboard/PhotoUploader';

export default async function PhotosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id')
    .eq('couple_id', user.id)
    .limit(1)
    .single();

  if (!wedding) redirect('/dashboard');

  const { data: photos } = await supabase
    .from('photos')
    .select('id, image_url, caption, sort_order')
    .eq('wedding_id', wedding.id)
    .order('sort_order');

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{
          fontFamily: 'var(--font-montserrat)',
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: '3px',
          color: 'var(--accent)',
          textTransform: 'uppercase' as const,
          margin: '0 0 6px',
        }}>
          PHOTOS
        </p>
        <h1 style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: 30,
          fontWeight: 400,
          fontStyle: 'italic',
          color: 'var(--text)',
          margin: '0 0 6px',
        }}>
          Your gallery
        </h1>
        <p style={{
          fontFamily: 'var(--font-montserrat)',
          fontSize: 13,
          color: 'var(--text-secondary)',
          margin: 0,
        }}>
          Upload engagement photos or other images to share with your guests.
        </p>
      </div>

      <PhotoUploader weddingId={wedding.id} initialPhotos={photos ?? []} />
    </div>
  );
}
