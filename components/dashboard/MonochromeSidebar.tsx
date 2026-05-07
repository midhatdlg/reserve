'use client';

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Photo, TemplateContent, HeroLayoutOverride } from '@/types';

const PHOTO_SLOTS: { role: string; label: string; description: string }[] = [
  { role: 'hero',       label: 'Hero',       description: 'Cover photo behind the names' },
  { role: 'love_story', label: 'Love Story', description: 'Square photo next to your story' },
  {
    role: 'story_ceremony_1',
    label: 'Before ceremony (1)',
    description: 'First photo between Love Story and Ceremony',
  },
  {
    role: 'story_ceremony_2',
    label: 'Before ceremony (2)',
    description: 'Second photo between Love Story and Ceremony',
  },
  { role: 'ceremony',   label: 'Ceremony',   description: 'Wide banner above ceremony details' },
  { role: 'schedule',   label: 'Schedule',   description: 'Photo beside the schedule of events' },
  { role: 'faq',        label: 'FAQ',        description: 'Banner below the questions section' },
];

const CONTENT_FIELDS: {
  key: keyof TemplateContent;
  label: string;
  placeholder: string;
  multiline?: boolean;
  rows?: number;
}[] = [
  { key: 'hashtag',             label: 'Hashtag',                placeholder: '#YourCoupleHashtag' },
  { key: 'love_story_heading',  label: 'Love Story heading',     placeholder: 'OUR LOVE STORY' },
  { key: 'love_story_text',     label: 'Love Story text',        placeholder: 'Write a paragraph that tells your story…', multiline: true, rows: 5 },
  { key: 'ceremony_dress_code', label: 'Dress code',             placeholder: 'Smart casual, preferably dresses or polos and pants.', multiline: true, rows: 2 },
  { key: 'ceremony_post_text',  label: 'Post-ceremony note',     placeholder: 'We\'re having lunch at our favorite restaurant…', multiline: true, rows: 2 },
  { key: 'gift_text',           label: 'Registry / gift note',   placeholder: 'But if you feel called to give a little something…', multiline: true, rows: 4 },
  { key: 'gift_qr_url',         label: 'Registry QR image URL',  placeholder: 'https://…' },
  { key: 'contact_email',       label: 'Contact email',          placeholder: 'hello@example.com' },
  { key: 'contact_phone',       label: 'Contact phone',          placeholder: '(123) 456-7890' },
];

interface Props {
  weddingId: string;
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
  content: TemplateContent;
  onContentChange: (patch: Partial<TemplateContent>) => void;
  /** When `sage`, shows “line under names” in Hero Layout (saved in `hero_tagline`). */
  templateId?: string;
  heroLayout: HeroLayoutOverride;
  onHeroLayoutChange: (patch: Partial<HeroLayoutOverride>) => void;
  heroFontSize: number;
  onHeroFontSizeChange: (size: number) => void;
}

export function MonochromeSidebar({
  weddingId,
  photos,
  onPhotosChange,
  content,
  onContentChange,
  templateId = 'monochrome',
  heroLayout,
  onHeroLayoutChange,
  heroFontSize,
  onHeroFontSizeChange,
}: Props) {
  const isSageTemplate = templateId === 'sage';

  return (
    <>
      <SidebarSection label="Photos">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {PHOTO_SLOTS.map((slot) => (
            <PhotoSlot
              key={slot.role}
              weddingId={weddingId}
              role={slot.role}
              label={slot.label}
              description={slot.description}
              photo={photos.find((p) => p.role === slot.role)}
              onPhotosChange={onPhotosChange}
              allPhotos={photos}
            />
          ))}
        </div>
      </SidebarSection>

      <SidebarSection label="Hero Layout">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {isSageTemplate && (
            <div>
              <SidebarLabel>Line under names</SidebarLabel>
              <textarea
                value={content.hero_tagline ?? ''}
                onChange={(e) => onContentChange({ hero_tagline: e.target.value })}
                placeholder="Renewing our vows after 25 years"
                rows={3}
                style={textareaStyle}
              />
              <p style={{
                fontFamily: 'var(--font-montserrat)',
                fontSize: 10,
                color: 'var(--text-tertiary)',
                margin: '6px 0 0',
                lineHeight: 1.45,
              }}>
                Script text directly under the couple names on the Sage hero. Line breaks are kept.
              </p>
            </div>
          )}
          {!isSageTemplate && (
            <div>
              <SidebarLabel>Names position</SidebarLabel>
              <div style={{ display: 'flex', gap: 4 }}>
                {(['top', 'center', 'bottom'] as const).map((pos) => {
                  const active = (heroLayout.textPosition ?? 'top') === pos;
                  return (
                    <button
                      key={pos}
                      onClick={() => onHeroLayoutChange({ textPosition: pos })}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        borderRadius: 6,
                        cursor: 'pointer',
                        border: active ? '1px solid var(--sage)' : '1px solid var(--border)',
                        background: active ? 'var(--sage)' : 'transparent',
                        color: active ? 'white' : 'var(--text-secondary)',
                        fontFamily: 'var(--font-montserrat)',
                        fontSize: 11,
                        fontWeight: 500,
                        textTransform: 'capitalize',
                      }}
                    >
                      {pos}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div>
            <SidebarLabel>
              Overlay darkness — {Math.round((heroLayout.overlayOpacity ?? 0.6) * 100)}%
            </SidebarLabel>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round((heroLayout.overlayOpacity ?? 0.6) * 100)}
              onChange={(e) => onHeroLayoutChange({ overlayOpacity: Number(e.target.value) / 100 })}
              style={{ width: '100%', accentColor: 'var(--sage)' }}
            />
          </div>
          <div>
            <SidebarLabel>Names size — {heroFontSize}px</SidebarLabel>
            <input
              type="range"
              min={44}
              max={92}
              value={heroFontSize}
              onChange={(e) => onHeroFontSizeChange(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--sage)' }}
            />
          </div>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 10px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: '#F7F7F5',
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={heroLayout.fadeInText ?? false}
              onChange={(e) => onHeroLayoutChange({ fadeInText: e.target.checked })}
              style={{ accentColor: 'var(--sage)', width: 14, height: 14 }}
            />
            <span style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: 11,
              color: 'var(--text-secondary)',
              fontWeight: 500,
            }}>
              {isSageTemplate
                ? 'Fade-in hero text (names, line under names)'
                : 'Fade-in hero text (names, date, hashtag)'}
            </span>
          </label>
        </div>
      </SidebarSection>

      <SidebarSection label="Content">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {CONTENT_FIELDS.map((f) => (
            <div key={f.key}>
              <SidebarLabel>{f.label}</SidebarLabel>
              {f.multiline ? (
                <textarea
                  value={(content[f.key] as string) ?? ''}
                  onChange={(e) => onContentChange({ [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  rows={f.rows ?? 3}
                  style={textareaStyle}
                />
              ) : (
                <input
                  type="text"
                  value={(content[f.key] as string) ?? ''}
                  onChange={(e) => onContentChange({ [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  style={inputStyle}
                />
              )}
            </div>
          ))}
        </div>
      </SidebarSection>
    </>
  );
}

/* ── PhotoSlot ────────────────────────────────────────────────────────── */

interface PhotoSlotProps {
  weddingId: string;
  role: string;
  label: string;
  description: string;
  photo: Photo | undefined;
  allPhotos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
}

function PhotoSlot({ weddingId, role, label, description, photo, allPhotos, onPhotosChange }: PhotoSlotProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const supabase = createClient();

  async function handleUpload(file: File) {
    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be under 10MB');
      return;
    }
    setBusy(true);

    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${weddingId}/${role}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('photos')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(path);

      // Replace existing slot photo if any (uniqueness on wedding_id + role)
      if (photo) {
        const oldPath = photo.image_url.split('/photos/')[1];
        if (oldPath) await supabase.storage.from('photos').remove([oldPath]);
        const { data, error } = await supabase
          .from('photos')
          .update({ image_url: publicUrl })
          .eq('id', photo.id)
          .select()
          .single();
        if (error) throw error;
        onPhotosChange(allPhotos.map((p) => (p.id === photo.id ? (data as Photo) : p)));
      } else {
        const { data, error } = await supabase
          .from('photos')
          .insert({
            wedding_id: weddingId,
            image_url: publicUrl,
            role,
            sort_order: allPhotos.length,
          })
          .select()
          .single();
        if (error) throw error;
        onPhotosChange([...allPhotos, data as Photo]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      alert(msg);
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    if (!photo) return;
    if (!confirm(`Remove the ${label.toLowerCase()} photo?`)) return;
    setBusy(true);
    try {
      const oldPath = photo.image_url.split('/photos/')[1];
      if (oldPath) await supabase.storage.from('photos').remove([oldPath]);
      await supabase.from('photos').delete().eq('id', photo.id);
      onPhotosChange(allPhotos.filter((p) => p.id !== photo.id));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not remove photo';
      alert(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{
      display: 'flex',
      gap: 12,
      padding: 10,
      borderRadius: 10,
      background: '#F7F7F5',
      alignItems: 'center',
    }}>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleUpload(f);
          e.target.value = '';
        }}
      />

      <button
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        style={{
          width: 56,
          height: 56,
          borderRadius: 8,
          border: photo ? 'none' : '1px dashed var(--border)',
          background: photo ? 'transparent' : 'var(--bg)',
          padding: 0,
          overflow: 'hidden',
          cursor: busy ? 'wait' : 'pointer',
          flexShrink: 0,
        }}
        title={photo ? 'Replace photo' : 'Upload photo'}
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.image_url}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <span style={{
            display: 'block',
            fontFamily: 'var(--font-montserrat)',
            fontSize: 18,
            color: 'var(--text-tertiary)',
            lineHeight: 1,
          }}>
            +
          </span>
        )}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'var(--font-montserrat)',
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--text)',
          margin: 0,
          lineHeight: 1.2,
        }}>
          {label}
        </p>
        <p style={{
          fontFamily: 'var(--font-montserrat)',
          fontSize: 11,
          color: 'var(--text-tertiary)',
          margin: '2px 0 0',
          lineHeight: 1.3,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {description}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          style={miniButton}
        >
          {busy ? '…' : photo ? 'Replace' : 'Upload'}
        </button>
        {photo && (
          <button onClick={handleRemove} disabled={busy} style={{ ...miniButton, color: 'var(--text-tertiary)' }}>
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Sidebar building blocks (mirrors DesignEditor) ───────────────────── */

function SidebarSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
      <p style={{
        fontFamily: 'var(--font-montserrat)', fontSize: 13, color: 'var(--text)',
        margin: '0 0 14px', fontWeight: 600,
      }}>
        {label}
      </p>
      {children}
    </div>
  );
}

function SidebarLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{
      fontFamily: 'var(--font-montserrat)', fontSize: 10, color: 'var(--text-tertiary)',
      display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600,
    }}>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: '#F7F7F5',
  fontFamily: 'var(--font-montserrat)',
  fontSize: 13,
  color: 'var(--text)',
  boxSizing: 'border-box',
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'vertical',
  lineHeight: 1.6,
};

const miniButton: React.CSSProperties = {
  fontFamily: 'var(--font-montserrat)',
  fontSize: 10,
  fontWeight: 500,
  padding: '4px 10px',
  borderRadius: 6,
  border: '1px solid var(--border)',
  background: 'var(--bg)',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};
