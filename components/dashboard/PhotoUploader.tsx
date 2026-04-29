'use client';

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

interface Photo {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
}

interface Props {
  weddingId: string;
  initialPhotos: Photo[];
}

export function PhotoUploader({ weddingId, initialPhotos }: Props) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${weddingId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('photos')
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (uploadErr) continue;

      const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(path);

      const { data, error } = await supabase
        .from('photos')
        .insert({ wedding_id: weddingId, image_url: publicUrl, sort_order: photos.length })
        .select()
        .single();

      if (!error && data) setPhotos((prev) => [...prev, data]);
    }

    setUploading(false);
  }

  async function updateCaption(id: string, caption: string) {
    await supabase.from('photos').update({ caption: caption || null }).eq('id', id);
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, caption: caption || null } : p)));
  }

  async function deletePhoto(id: string, imageUrl: string) {
    if (!confirm('Delete this photo?')) return;
    // Extract storage path from URL
    const parts = imageUrl.split('/photos/');
    if (parts[1]) {
      await supabase.storage.from('photos').remove([parts[1]]);
    }
    await supabase.from('photos').delete().eq('id', id);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    if (lightbox !== null) setLightbox(null);
  }

  async function movePhoto(id: string, dir: -1 | 1) {
    const idx = photos.findIndex((p) => p.id === id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= photos.length) return;

    const reordered = [...photos];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
    const updated = reordered.map((p, i) => ({ ...p, sort_order: i }));
    setPhotos(updated);

    await Promise.all(
      updated.map((p) => supabase.from('photos').update({ sort_order: p.sort_order }).eq('id', p.id))
    );
  }

  return (
    <div>
      {/* Upload area */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        style={{
          border: '2px dashed var(--border)', borderRadius: 12, padding: '32px',
          textAlign: 'center', cursor: 'pointer', marginBottom: 24,
          background: 'var(--surface)',
          transition: 'border-color 0.2s',
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 8 }}>📷</div>
        <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 8px' }}>
          {uploading ? 'Uploading…' : 'Drop photos here or click to upload'}
        </p>
        <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'var(--text-tertiary)', margin: 0 }}>
          JPG, PNG, WebP · Multiple files supported
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Photo grid */}
      {photos.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center', margin: '32px 0' }}>
          No photos yet
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {photos.map((photo, i) => (
            <div key={photo.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setLightbox(i)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.image_url}
                  alt={photo.caption ?? ''}
                  style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
                />
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)',
                  transition: 'background 0.2s',
                }} />
              </div>
              <div style={{ padding: '10px 12px' }}>
                <input
                  type="text"
                  value={photo.caption ?? ''}
                  onChange={(e) => setPhotos((prev) => prev.map((p) => p.id === photo.id ? { ...p, caption: e.target.value } : p))}
                  onBlur={(e) => updateCaption(photo.id, e.target.value)}
                  placeholder="Add caption…"
                  style={{
                    width: '100%', border: 'none', background: 'transparent',
                    fontFamily: 'var(--font-montserrat)', fontSize: 12,
                    color: 'var(--text-secondary)', outline: 'none', boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                  <button onClick={() => movePhoto(photo.id, -1)} disabled={i === 0} style={miniBtn}>◀</button>
                  <button onClick={() => movePhoto(photo.id, 1)} disabled={i === photos.length - 1} style={miniBtn}>▶</button>
                  <button onClick={() => deletePhoto(photo.id, photo.image_url)} style={{ ...miniBtn, marginLeft: 'auto', color: 'var(--text-tertiary)' }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 20,
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox((prev) => prev !== null && prev > 0 ? prev - 1 : prev); }}
            style={{ ...navBtn, left: 16 }}
          >‹</button>
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '80vw', maxHeight: '80vh', textAlign: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[lightbox].image_url}
              alt={photos[lightbox].caption ?? ''}
              style={{ maxWidth: '80vw', maxHeight: '75vh', objectFit: 'contain', borderRadius: 8 }}
            />
            {photos[lightbox].caption && (
              <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '12px 0 0' }}>
                {photos[lightbox].caption}
              </p>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox((prev) => prev !== null && prev < photos.length - 1 ? prev + 1 : prev); }}
            style={{ ...navBtn, right: 16 }}
          >›</button>
          <button
            onClick={() => setLightbox(null)}
            style={{ position: 'fixed', top: 16, right: 16, background: 'none', border: 'none', color: 'white', fontSize: 28, cursor: 'pointer', lineHeight: 1 }}
          >×</button>
        </div>
      )}
    </div>
  );
}

const miniBtn: React.CSSProperties = {
  background: 'none', border: '1px solid var(--border)', borderRadius: 5,
  padding: '2px 6px', cursor: 'pointer', fontFamily: 'var(--font-montserrat)',
  fontSize: 11, color: 'var(--text-secondary)',
};

const navBtn: React.CSSProperties = {
  position: 'fixed', top: '50%', transform: 'translateY(-50%)',
  background: 'rgba(255,255,255,0.1)', border: 'none',
  color: 'white', fontSize: 40, cursor: 'pointer', padding: '12px 18px',
  borderRadius: 8, lineHeight: 1,
};
