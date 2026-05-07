'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MonochromeSidebar } from './MonochromeSidebar';
import { MonochromeInvite } from '@/components/invite/templates/monochrome/MonochromeInvite';
import { theme as monochromeTheme } from '@/components/invite/templates/monochrome/shared';
import { SageInvite } from '@/components/invite/templates/sage/SageInvite';
import { theme as sageTheme, SAGE_DEEP, CREAM_PAPER } from '@/components/invite/templates/sage/shared';
import type { TemplateTheme } from '@/lib/template-theme';
import type { TemplateOverrides, TemplateContent, HeroLayoutOverride, Event, Photo, Question, Invite, Rsvp, Wedding } from '@/types';

/* ── Template registry (rendered in the design editor preview) ─────────── */

type EditorTemplateComponent = React.ComponentType<{
  wedding: Wedding;
  events: Event[];
  invite: Invite | null;
  rsvps: Rsvp[];
  photos: Photo[];
  questions: Question[];
  slug: string;
  showPlaceholders?: boolean;
  previewHeroViewportFill?: boolean;
}>;

interface SectionDef {
  key: string;
  label: string;
  locked?: boolean;
}

interface EditorTemplate {
  id: string;
  name: string;
  description: string;
  Component: EditorTemplateComponent;
  theme: TemplateTheme;
  /** Two-color swatch shown in the picker */
  swatch: { primary: string; accent: string };
  sections: SectionDef[];
}

const MONOCHROME_SECTIONS: SectionDef[] = [
  { key: 'story',     label: 'Our Love Story' },
  { key: 'ceremony',  label: 'The Ceremony' },
  { key: 'itinerary', label: 'Schedule of Events' },
  { key: 'registry',  label: 'Registry / Gifts' },
  { key: 'rsvp',      label: 'RSVP',               locked: true },
  { key: 'qna',       label: 'FAQ' },
  { key: 'footer',    label: 'Get In Touch',        locked: true },
  { key: 'countdown', label: 'Countdown' },
];

const SAGE_SECTIONS: SectionDef[] = [
  { key: 'story',     label: 'Our Love Story' },
  { key: 'itinerary', label: 'Program' },
  { key: 'qna',       label: 'FAQ' },
  { key: 'rsvp',      label: 'RSVP',           locked: true },
  { key: 'footer',    label: 'Get In Touch',   locked: true },
];

const EDITOR_TEMPLATES: EditorTemplate[] = [
  {
    id: 'monochrome',
    name: 'Monochrome',
    description: 'Editorial black & white on warm paper.',
    Component: MonochromeInvite,
    theme: monochromeTheme,
    swatch: { primary: '#000000', accent: '#E8E6E2' },
    sections: MONOCHROME_SECTIONS,
  },
  {
    id: 'sage',
    name: 'Sage',
    description: 'Botanical sage green with cream accents.',
    Component: SageInvite,
    theme: sageTheme,
    swatch: { primary: SAGE_DEEP, accent: CREAM_PAPER },
    sections: SAGE_SECTIONS,
  },
];

function resolveTemplate(id: string): EditorTemplate {
  return EDITOR_TEMPLATES.find((t) => t.id === id) ?? EDITOR_TEMPLATES[0];
}

/* ── Section definitions are per-template (see EDITOR_TEMPLATES above) ── */

type ViewMode = 'mobile' | 'desktop';

/* ── Props ─────────────────────────────────────────────────────────────── */
interface Props {
  wedding: {
    id: string;
    slug: string;
    title: string | null;
    wedding_date: string | null;
    venue_name: string | null;
    venue_address: string | null;
    venue_lat: number | null;
    venue_lng: number | null;
    template_id: string;
    invite_bg_color: string | null;
    template_overrides: TemplateOverrides | null;
    template_content: TemplateContent | null;
    selected_blocks: string[] | null;
    timezone: string | null;
    custom_design_url: string | null;
    design_zones: unknown;
  };
  events: Event[];
  photos: Photo[];
  questions: Question[];
  sampleInvite: Invite | null;
}

/* ── Component ─────────────────────────────────────────────────────────── */
export function DesignEditor({ wedding, events, photos: initialPhotos, questions, sampleInvite }: Props) {
  const [templateId, setTemplateId] = useState<string>(
    EDITOR_TEMPLATES.some((t) => t.id === wedding.template_id) ? wedding.template_id : 'monochrome',
  );
  const template = resolveTemplate(templateId);
  const PreviewComponent = template.Component;
  const previewBg = template.theme.pageBg;

  const [content, setContent] = useState<TemplateContent>(wedding.template_content ?? {});
  const [blocks, setBlocks] = useState<string[]>(
    wedding.selected_blocks ?? ['story', 'ceremony', 'itinerary', 'registry', 'qna', 'footer'],
  );
  const [livePhotos, setLivePhotos] = useState<Photo[]>(initialPhotos);
  const [heroLayout, setHeroLayout] = useState<HeroLayoutOverride>(
    wedding.template_overrides?.hero ?? {},
  );
  const [heroFontSize, setHeroFontSize] = useState(
    wedding.template_overrides?.couple_names?.fontSize ?? 56,
  );
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  function updateContent(patch: Partial<TemplateContent>) {
    setContent((prev) => ({ ...prev, ...patch }));
  }

  function toggleBlock(key: string) {
    setBlocks((prev) =>
      prev.includes(key) ? prev.filter((b) => b !== key) : [...prev, key],
    );
  }

  function updateHeroLayout(patch: Partial<HeroLayoutOverride>) {
    setHeroLayout((prev) => ({ ...prev, ...patch }));
  }

  /* Build overrides for save & preview */
  const overrides: TemplateOverrides = {
    ...wedding.template_overrides,
    hero: heroLayout,
    couple_names: {
      ...wedding.template_overrides?.couple_names,
      fontSize: heroFontSize,
    },
  };

  /* Count unsaved changes */
  const changedFields: string[] = [];
  if (templateId !== wedding.template_id) changedFields.push('template');
  if (JSON.stringify(overrides) !== JSON.stringify(wedding.template_overrides ?? {}))
    changedFields.push('overrides');
  if (JSON.stringify(content) !== JSON.stringify(wedding.template_content ?? {}))
    changedFields.push('content');
  if (JSON.stringify(blocks) !== JSON.stringify(wedding.selected_blocks ?? []))
    changedFields.push('sections');
  const changeCount = changedFields.length;

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from('weddings')
      .update({
        template_id: templateId,
        template_overrides: overrides,
        template_content: content,
        selected_blocks: blocks,
      })
      .eq('id', wedding.id);
    setSaving(false);
    if (error) {
      alert(`Save failed: ${error.message}`);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  /* Build a full Wedding object for the preview */
  const previewWedding: Wedding = {
    id: wedding.id,
    couple_id: '',
    slug: wedding.slug,
    title: wedding.title,
    wedding_date: wedding.wedding_date,
    venue_name: wedding.venue_name,
    venue_address: wedding.venue_address,
    venue_lat: wedding.venue_lat,
    venue_lng: wedding.venue_lng,
    template_id: templateId,
    custom_design_url: wedding.custom_design_url,
    video_embed_url: null,
    design_zones: [],
    selected_blocks: blocks,
    languages: [],
    is_published: false,
    save_the_date_mode: false,
    envelope_enabled: false,
    envelope_wax_color: '#000',
    envelope_initials: null,
    invite_bg_color: wedding.invite_bg_color ?? previewBg,
    meal_options: [],
    strict_name_match: false,
    timezone: wedding.timezone ?? 'UTC',
    template_overrides: overrides,
    template_content: content,
    settings: {},
    created_at: '',
  };

  const previewUrl = `reserve.love/invite/${wedding.slug}`;

  return (
    <div style={{ margin: '-40px -36px -80px', display: 'flex', flexDirection: 'column', height: '100vh', background: '#FFFFFF' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .tl-phone-scroll::-webkit-scrollbar { width: 0; background: transparent; }
        .tl-phone-scroll { scrollbar-width: none; }
        .tl-phone-frame:hover .tl-phone-scroll::-webkit-scrollbar { width: 3px; }
        .tl-phone-frame:hover .tl-phone-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.25); border-radius: 3px; }
        .tl-phone-frame:hover .tl-phone-scroll::-webkit-scrollbar-track { background: transparent; }
        .tl-phone-frame:hover .tl-phone-scroll { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.25) transparent; }
      `}} />

      {/* ── Top header bar ─────────────────────────────────────────────── */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 32px',
        borderBottom: '1px solid var(--border)',
        background: '#FFFFFF',
        flexShrink: 0,
      }}>
        {/* Left: title + description */}
        <div>
          <h1 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 24,
            fontWeight: 400,
            color: 'var(--text)',
            margin: 0,
            lineHeight: 1.2,
          }}>
            Design your invite
          </h1>
          <p style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: 12,
            color: 'var(--text-tertiary)',
            margin: '4px 0 0',
            lineHeight: 1.4,
          }}>
            Pick a template, customize fonts, and toggle which sections your guests will see.
          </p>
        </div>

        {/* Center: preview URL */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: 10,
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Preview
          </span>
          <div style={{
            padding: '6px 16px',
            borderRadius: 20,
            border: '1px solid var(--border)',
            background: 'var(--bg)',
          }}>
            <span style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: 12,
              color: 'var(--text-secondary)',
            }}>
              {previewUrl}
            </span>
          </div>
        </div>

        {/* Right: view toggle + status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            display: 'flex',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: 2,
          }}>
            <button
              onClick={() => setViewMode('mobile')}
              style={{
                padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                background: viewMode === 'mobile' ? 'var(--sage)' : 'transparent',
                color: viewMode === 'mobile' ? 'white' : 'var(--text-tertiary)',
                display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: 'var(--font-montserrat)', fontSize: 12, fontWeight: 500,
              }}
            >
              <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
                <rect x="0.5" y="0.5" width="11" height="15" rx="2" stroke="currentColor" strokeWidth="1" />
                <circle cx="6" cy="13" r="1" fill="currentColor" />
              </svg>
              Mobile
            </button>
            <button
              onClick={() => setViewMode('desktop')}
              style={{
                padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                background: viewMode === 'desktop' ? 'var(--sage)' : 'transparent',
                color: viewMode === 'desktop' ? 'white' : 'var(--text-tertiary)',
                display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: 'var(--font-montserrat)', fontSize: 12, fontWeight: 500,
              }}
            >
              <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                <rect x="0.5" y="0.5" width="15" height="10" rx="1.5" stroke="currentColor" strokeWidth="1" />
                <path d="M5 12h6M8 11v1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              </svg>
              Desktop
            </button>
          </div>
          {/* Online status dot */}
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: '#4CAF50',
            border: '2px solid var(--bg)',
            boxShadow: '0 0 0 1px var(--border)',
          }} />
        </div>
      </header>

      {/* ── Main area: sidebar + preview ──────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Left sidebar ────────────────────────────────────────────── */}
        <div style={{
          width: 360,
          flexShrink: 0,
          borderRight: '1px solid var(--border)',
          background: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
            {/* TEMPLATE */}
            <SidebarSection label="Template">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {EDITOR_TEMPLATES.map((opt) => {
                  const active = opt.id === templateId;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setTemplateId(opt.id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        padding: 10,
                        borderRadius: 10,
                        border: active ? '2px solid var(--sage)' : '1px solid var(--border)',
                        background: active ? 'rgba(121,157,127,0.06)' : '#FFFFFF',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'border-color 0.15s, background 0.15s',
                      }}
                    >
                      <div style={{
                        height: 56,
                        borderRadius: 6,
                        overflow: 'hidden',
                        border: '1px solid var(--border)',
                        display: 'flex',
                      }}>
                        <div style={{ flex: 2, background: opt.swatch.primary }} />
                        <div style={{ flex: 1, background: opt.swatch.accent }} />
                      </div>
                      <div>
                        <p style={{
                          fontFamily: 'var(--font-montserrat)',
                          fontSize: 12,
                          fontWeight: 600,
                          color: 'var(--text)',
                          margin: 0,
                          lineHeight: 1.2,
                        }}>
                          {opt.name}
                        </p>
                        <p style={{
                          fontFamily: 'var(--font-montserrat)',
                          fontSize: 10,
                          color: 'var(--text-tertiary)',
                          margin: '2px 0 0',
                          lineHeight: 1.35,
                        }}>
                          {opt.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </SidebarSection>

            {/* SECTIONS */}
            <SidebarSection label="Sections">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {template.sections.map((s) => {
                  const active = s.locked || blocks.includes(s.key);
                  return (
                    <label
                      key={s.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 8px',
                        borderRadius: 8,
                        cursor: s.locked ? 'default' : 'pointer',
                        background: active ? 'rgba(121,157,127,0.04)' : 'transparent',
                        transition: 'background 0.15s',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        disabled={s.locked}
                        onChange={() => !s.locked && toggleBlock(s.key)}
                        style={{
                          accentColor: 'var(--sage)',
                          width: 16,
                          height: 16,
                          borderRadius: 4,
                        }}
                      />
                      <span style={{
                        fontFamily: 'var(--font-montserrat)',
                        fontSize: 14,
                        color: 'var(--text)',
                        fontWeight: active ? 500 : 400,
                        flex: 1,
                      }}>
                        {s.label}
                      </span>
                      {s.locked && (
                        <span style={{
                          fontFamily: 'var(--font-montserrat)',
                          fontSize: 9,
                          fontWeight: 600,
                          color: 'var(--text-tertiary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.8px',
                        }}>
                          Always on
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </SidebarSection>

            {/* MonochromeSidebar: Photos, Hero Layout, Content fields */}
            <MonochromeSidebar
              weddingId={wedding.id}
              photos={livePhotos}
              onPhotosChange={setLivePhotos}
              content={content}
              onContentChange={updateContent}
              templateId={templateId}
              heroLayout={heroLayout}
              onHeroLayoutChange={updateHeroLayout}
              heroFontSize={heroFontSize}
              onHeroFontSizeChange={setHeroFontSize}
            />
          </div>

          {/* Save bar */}
          <div style={{
            padding: '16px 28px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            background: '#FFFFFF',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {changeCount > 0 && (
                <>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--text-tertiary)',
                  }} />
                  <span style={{
                    fontFamily: 'var(--font-montserrat)',
                    fontSize: 12,
                    color: 'var(--text-tertiary)',
                  }}>
                    {changeCount} unsaved change{changeCount !== 1 ? 's' : ''}
                  </span>
                </>
              )}
              {saved && (
                <span style={{
                  fontFamily: 'var(--font-montserrat)',
                  fontSize: 12,
                  color: 'var(--sage)',
                  fontWeight: 500,
                }}>
                  Saved
                </span>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                fontFamily: 'var(--font-montserrat)',
                fontSize: 13,
                fontWeight: 600,
                padding: '10px 24px',
                borderRadius: 8,
                border: 'none',
                cursor: saving ? 'default' : 'pointer',
                background: saving ? 'var(--border)' : '#2C3A2E',
                color: saving ? 'var(--text-tertiary)' : '#F2F0EC',
                transition: 'background 0.15s',
              }}
            >
              {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* ── Preview canvas ──────────────────────────────────────────── */}
        <div style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '32px 48px',
          background: '#FFFFFF radial-gradient(circle, rgba(0,0,0,0.15) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}>
          {viewMode === 'mobile' ? (
            /* ── iPhone 17 Pro Max frame ──────────────────────────────── */
            <div className="tl-phone-frame" style={{
              width: 320,
              height: '100%',
              maxHeight: 693,
              borderRadius: 40,
              border: '4px solid #1A1A1A',
              overflow: 'hidden',
              boxShadow: '0 12px 48px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)',
              background: '#1A1A1A',
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
              position: 'relative',
            }}>
              {/* Dynamic Island */}
              <div style={{
                position: 'absolute',
                top: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 84,
                height: 22,
                background: '#000',
                borderRadius: 12,
                zIndex: 10,
              }} />
              {/* Status bar */}
              <div style={{
                height: 38,
                background: previewBg,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                padding: '0 20px 3px',
                flexShrink: 0,
              }}>
                <span style={{
                  fontFamily: 'var(--font-montserrat)', fontSize: 11, fontWeight: 600,
                  color: 'rgba(0,0,0,0.7)',
                }}>
                  9:41
                </span>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <svg width="12" height="8" viewBox="0 0 15 10">
                    <rect x="0" y="6" width="3" height="4" rx="0.5" fill="rgba(0,0,0,0.5)" />
                    <rect x="4" y="4" width="3" height="6" rx="0.5" fill="rgba(0,0,0,0.5)" />
                    <rect x="8" y="2" width="3" height="8" rx="0.5" fill="rgba(0,0,0,0.5)" />
                    <rect x="12" y="0" width="3" height="10" rx="0.5" fill="rgba(0,0,0,0.5)" />
                  </svg>
                  <svg width="18" height="8" viewBox="0 0 22 10">
                    <rect x="0" y="0" width="19" height="10" rx="2" stroke="rgba(0,0,0,0.3)" strokeWidth="1" fill="none" />
                    <rect x="2" y="2" width="14" height="6" rx="1" fill="rgba(0,0,0,0.5)" />
                    <rect x="20" y="3" width="2" height="4" rx="0.5" fill="rgba(0,0,0,0.2)" />
                  </svg>
                </div>
              </div>

              {/* Scrollable content */}
              <div className="tl-phone-scroll" style={{
                flex: 1,
                overflowY: 'auto',
                scrollBehavior: 'smooth',
                background: previewBg,
              }}>
                <PreviewComponent
                  wedding={previewWedding}
                  events={events}
                  invite={sampleInvite}
                  rsvps={[]}
                  photos={livePhotos}
                  questions={questions}
                  slug={wedding.slug}
                  showPlaceholders
                  previewHeroViewportFill
                />
              </div>

              {/* Home indicator */}
              <div style={{
                height: 22, background: previewBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <div style={{
                  width: 100, height: 4, background: 'rgba(0,0,0,0.2)', borderRadius: 2,
                }} />
              </div>
            </div>
          ) : (
            /* ── Desktop browser window ──────────────────────────────── */
            <div style={{
              width: '100%',
              maxWidth: 960,
              height: '100%',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.08)',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Browser chrome bar */}
              <div style={{
                height: 36, background: '#E8E6E2',
                display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10, flexShrink: 0,
              }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }} />
                </div>
                <div style={{
                  flex: 1, background: 'rgba(255,255,255,0.7)', borderRadius: 5, padding: '4px 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: '#666' }}>
                    {previewUrl}
                  </span>
                </div>
              </div>

              {/* Scrollable invite preview */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                scrollBehavior: 'smooth',
                background: previewBg,
              }}>
                <PreviewComponent
                  wedding={previewWedding}
                  events={events}
                  invite={sampleInvite}
                  rsvps={[]}
                  photos={livePhotos}
                  questions={questions}
                  slug={wedding.slug}
                  showPlaceholders
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ───────────────────────────────────────────────────────────── */

/* ── Sidebar building blocks ───────────────────────────────────────────── */

function SidebarSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{
        fontFamily: 'var(--font-montserrat)',
        fontSize: 10,
        color: 'var(--text-tertiary)',
        margin: '0 0 12px',
        textTransform: 'uppercase',
        letterSpacing: '1.2px',
        fontWeight: 600,
      }}>
        {label}
      </p>
      {children}
    </div>
  );
}

