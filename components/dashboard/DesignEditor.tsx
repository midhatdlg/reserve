'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { CountdownTimer } from '@/components/invite/CountdownTimer';
import { ItineraryTimeline } from '@/components/invite/ItineraryTimeline';
import { TableReveal } from '@/components/invite/TableReveal';
import { PhotoGallery } from '@/components/invite/PhotoGallery';
import type { TemplateOverrides, TemplateContent, ZoneOverride, Event, Photo, Question, Invite } from '@/types';

/* ── Font options ──────────────────────────────────────────────────────── */
const FONT_OPTIONS = [
  { value: 'Cormorant Garamond', label: 'Cormorant Garamond' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Lora', label: 'Lora' },
  { value: 'Libre Caslon Text', label: 'Libre Caslon' },
  { value: 'Great Vibes', label: 'Great Vibes' },
  { value: 'Josefin Sans', label: 'Josefin Sans' },
  { value: 'Raleway', label: 'Raleway' },
];

const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@300;400;500;600&family=Lora:ital,wght@0,400;0,700;1,400&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Great+Vibes&family=Josefin+Sans:wght@300;400;600&family=Raleway:wght@300;400;600&display=swap';

const BG_PRESETS = [
  { value: '#F5F0E8', label: 'Ivory' },
  { value: '#EDE4D3', label: 'Sand' },
  { value: '#E8D9C4', label: 'Champagne' },
  { value: '#F5E6E8', label: 'Blush' },
  { value: '#DDE5D6', label: 'Sage' },
  { value: '#C7D3C0', label: 'Eucalyptus' },
  { value: '#2C3E2D', label: 'Forest' },
  { value: '#2C3E50', label: 'Midnight' },
  { value: '#1A1816', label: 'Ink' },
  { value: '#FFFFFF', label: 'White' },
];

/* ── Template definitions ─────────────────────────────────────────────── */
const TEMPLATE_LIST = [
  { id: 'heritage',         name: 'Classic',          bg: '#F5F0E8', accent: '#8B7355' },
  { id: 'beige-watercolor',  name: 'Beige Watercolor', bg: '#EDE4D3', accent: '#C4A882' },
  { id: 'minimal-serif',     name: 'Minimal Serif',    bg: '#FAFAFA', accent: '#2C2C2C' },
  { id: 'sage-garden',       name: 'Sage Garden',      bg: '#DDE5D6', accent: '#6B7F5E' },
  { id: 'midnight-gold',     name: 'Midnight Gold',    bg: '#1E2A3A', accent: '#C5A55A' },
  { id: 'canva-wedding',     name: 'Website',          bg: '#1A1816', accent: '#C4A882' },
];

/* ── Default font styles per template ─────────────────────────────────── */
const TEMPLATE_DEFAULTS: Record<string, { couple_names: ZoneOverride; date: ZoneOverride; venue: ZoneOverride }> = {
  heritage: {
    couple_names: { fontFamily: 'Cormorant Garamond', fontSize: 48, fontColor: '#2C2C2C' },
    date:         { fontFamily: 'Cormorant Garamond', fontSize: 15, fontColor: '#6B6560' },
    venue:        { fontFamily: 'Cormorant Garamond', fontSize: 12, fontColor: '#8B7355' },
  },
  'beige-watercolor': {
    couple_names: { fontFamily: 'Cormorant Garamond', fontSize: 48, fontColor: '#5C4033' },
    date:         { fontFamily: 'Montserrat',         fontSize: 13, fontColor: '#7A6B5D' },
    venue:        { fontFamily: 'Montserrat',         fontSize: 12, fontColor: '#7A6B5D' },
  },
  'minimal-serif': {
    couple_names: { fontFamily: 'Playfair Display', fontSize: 56, fontColor: '#1A1A1A' },
    date:         { fontFamily: 'Montserrat',       fontSize: 14, fontColor: '#666666' },
    venue:        { fontFamily: 'Montserrat',       fontSize: 12, fontColor: '#666666' },
  },
  'sage-garden': {
    couple_names: { fontFamily: 'Cormorant Garamond', fontSize: 48, fontColor: '#2C3E2D' },
    date:         { fontFamily: 'Cormorant Garamond', fontSize: 40, fontColor: '#2C3E2D' },
    venue:        { fontFamily: 'Montserrat',         fontSize: 11, fontColor: '#4A5D4B' },
  },
  'midnight-gold': {
    couple_names: { fontFamily: 'Cormorant Garamond', fontSize: 48, fontColor: '#C5A55A' },
    date:         { fontFamily: 'Montserrat',         fontSize: 13, fontColor: '#D4C8A8' },
    venue:        { fontFamily: 'Montserrat',         fontSize: 12, fontColor: '#D4C8A8' },
  },
};

/* ── All available sections ───────────────────────────────────────────── */
const ALL_SECTIONS = [
  { key: 'countdown',  label: 'Countdown' },
  { key: 'rsvp',       label: 'RSVP',         locked: true },
  { key: 'table',      label: 'Table Seating' },
  { key: 'itinerary',  label: 'Itinerary' },
  { key: 'venue',      label: 'Venue Map' },
  { key: 'photos',     label: 'Photos' },
  { key: 'qna',        label: 'Q&A' },
];

type ViewMode = 'mobile' | 'desktop';

/* ── Props ─────────────────────────────────────────────────────────────── */
interface Props {
  wedding: {
    id: string;
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
  };
  events: Event[];
  photos: Photo[];
  questions: Question[];
  sampleInvite: Invite | null;
}

type ZoneKey = 'couple_names' | 'date' | 'venue';

/* ── Component ─────────────────────────────────────────────────────────── */
export function DesignEditor({ wedding, events, photos, questions, sampleInvite }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState(wedding.template_id);
  const [bgColor, setBgColor] = useState(wedding.invite_bg_color ?? '#F5F0E8');
  const [overrides, setOverrides] = useState<TemplateOverrides>(wedding.template_overrides ?? {});
  const [content, setContent] = useState<TemplateContent>(wedding.template_content ?? {});
  const [blocks, setBlocks] = useState<string[]>(wedding.selected_blocks ?? ['rsvp', 'countdown', 'itinerary', 'qna']);
  const [activeZone, setActiveZone] = useState<ZoneKey | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('mobile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  function updateContent(patch: Partial<TemplateContent>) {
    setContent((prev) => ({ ...prev, ...patch }));
  }

  function toggleBlock(key: string) {
    setBlocks((prev) =>
      prev.includes(key) ? prev.filter((b) => b !== key) : [...prev, key]
    );
  }

  function getZoneStyle(zone: ZoneKey): Required<ZoneOverride> {
    const defaults = TEMPLATE_DEFAULTS[selectedTemplate] ?? TEMPLATE_DEFAULTS.heritage;
    const d = defaults[zone];
    const o = overrides[zone];
    return {
      fontFamily: o?.fontFamily ?? d.fontFamily!,
      fontSize:   o?.fontSize   ?? d.fontSize!,
      fontColor:  o?.fontColor  ?? d.fontColor!,
    };
  }

  function updateZone(zone: ZoneKey, patch: Partial<ZoneOverride>) {
    setOverrides((prev) => ({
      ...prev,
      [zone]: { ...prev[zone], ...patch },
    }));
  }

  const hasChanges =
    selectedTemplate !== wedding.template_id ||
    bgColor !== (wedding.invite_bg_color ?? '#F5F0E8') ||
    JSON.stringify(overrides) !== JSON.stringify(wedding.template_overrides ?? {}) ||
    JSON.stringify(content) !== JSON.stringify(wedding.template_content ?? {}) ||
    JSON.stringify(blocks) !== JSON.stringify(wedding.selected_blocks ?? ['rsvp', 'countdown', 'itinerary', 'qna']);

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from('weddings')
      .update({
        template_id: selectedTemplate,
        invite_bg_color: bgColor,
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

  // Wedding data for preview
  const [n1, n2] = (wedding.title ?? 'Partner & Partner').split(' & ');
  const name1 = n1?.trim() ?? 'Partner';
  const name2 = n2?.trim() ?? 'Partner';
  const dateObj = wedding.wedding_date ? new Date(wedding.wedding_date + 'T12:00:00') : null;
  const dateStr = dateObj
    ? dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : 'Saturday, June 14, 2025';
  const venue = wedding.venue_name ?? '';
  const guestName = sampleInvite?.guest_name ?? 'Guest';

  const namesStyle = getZoneStyle('couple_names');
  const dateStyle = getZoneStyle('date');
  const venueStyle = getZoneStyle('venue');

  const greetingText = content.greeting || `Dear ${guestName}, you are warmly invited to celebrate with us`;
  const footerText = content.footer || 'We can\'t wait to celebrate with you';

  // Preview dimensions
  const previewWidth = viewMode === 'mobile' ? 375 : 1024;
  const frameRadius = viewMode === 'mobile' ? 32 : 12;
  const frameBorder = viewMode === 'mobile' ? 3 : 2;

  return (
    <>
      <link rel="stylesheet" href={FONTS_URL} />

      {/* ── Full-width canvas layout ──────────────────────────────────── */}
      <div style={{
        display: 'flex',
        height: 'calc(100vh - 120px)',
        gap: 0,
        margin: '0 -24px',
        overflow: 'hidden',
      }}>

        {/* ── Left sidebar: Controls ──────────────────────────────────── */}
        <div style={{
          width: 300,
          flexShrink: 0,
          borderRight: '1px solid var(--border)',
          overflowY: 'auto',
          padding: '16px 20px',
          background: 'var(--bg)',
        }}>
          {/* Template picker */}
          <SidebarSection label="Template">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TEMPLATE_LIST.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTemplate(t.id);
                    setOverrides({});
                    setActiveZone(null);
                  }}
                  style={{
                    width: 56, height: 78, borderRadius: 6, cursor: 'pointer',
                    background: t.bg,
                    border: selectedTemplate === t.id ? `2px solid ${t.accent}` : '1px solid var(--border)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 2, padding: 3,
                  }}
                  title={t.name}
                >
                  <span style={{ fontSize: 6, fontFamily: 'Cormorant Garamond, serif', color: t.accent, fontWeight: 400 }}>
                    A &amp; B
                  </span>
                  <span style={{ fontSize: 5, fontFamily: 'var(--font-montserrat)', color: t.accent, opacity: 0.6 }}>
                    {t.name}
                  </span>
                </button>
              ))}
            </div>
          </SidebarSection>

          {/* Page background */}
          <SidebarSection label="Background">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                style={{ width: 30, height: 24, border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer', padding: 0, background: 'transparent' }}
              />
              {BG_PRESETS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setBgColor(p.value)}
                  title={p.label}
                  style={{
                    width: 20, height: 20, borderRadius: '50%', background: p.value, cursor: 'pointer',
                    border: bgColor.toLowerCase() === p.value.toLowerCase() ? '2px solid var(--sage)' : '1px solid var(--border)',
                  }}
                />
              ))}
            </div>
          </SidebarSection>

          {/* Typography */}
          <SidebarSection label="Typography">
            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
              {(['couple_names', 'date', 'venue'] as ZoneKey[]).map((z) => (
                <button
                  key={z}
                  onClick={() => setActiveZone(activeZone === z ? null : z)}
                  style={{
                    padding: '5px 10px', borderRadius: 5, cursor: 'pointer',
                    border: activeZone === z ? '1px solid var(--sage)' : '1px solid var(--border)',
                    background: activeZone === z ? 'var(--sage)' : 'transparent',
                    color: activeZone === z ? 'white' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-montserrat)', fontSize: 11, fontWeight: 500,
                  }}
                >
                  {z === 'couple_names' ? 'Names' : z === 'date' ? 'Date' : 'Venue'}
                </button>
              ))}
            </div>

            {activeZone ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <SidebarLabel>Font</SidebarLabel>
                  <select
                    value={getZoneStyle(activeZone).fontFamily}
                    onChange={(e) => updateZone(activeZone, { fontFamily: e.target.value })}
                    style={{
                      width: '100%', padding: '6px 10px', borderRadius: 6,
                      border: '1px solid var(--border)', background: 'var(--bg)',
                      fontFamily: `"${getZoneStyle(activeZone).fontFamily}", serif`,
                      fontSize: 13, color: 'var(--text)', cursor: 'pointer',
                    }}
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value} style={{ fontFamily: `"${f.value}", serif` }}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <SidebarLabel>Size — {getZoneStyle(activeZone).fontSize}px</SidebarLabel>
                    <input
                      type="range"
                      min={activeZone === 'couple_names' ? 24 : 8}
                      max={activeZone === 'couple_names' ? 72 : 32}
                      value={getZoneStyle(activeZone).fontSize}
                      onChange={(e) => updateZone(activeZone, { fontSize: Number(e.target.value) })}
                      style={{ width: '100%', accentColor: 'var(--sage)' }}
                    />
                  </div>
                  <div>
                    <SidebarLabel>Color</SidebarLabel>
                    <input
                      type="color"
                      value={getZoneStyle(activeZone).fontColor}
                      onChange={(e) => updateZone(activeZone, { fontColor: e.target.value })}
                      style={{ width: 36, height: 28, border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer', padding: 0, background: 'transparent' }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'var(--text-tertiary)', margin: 0, fontStyle: 'italic' }}>
                Click Names, Date, or Venue to edit
              </p>
            )}
          </SidebarSection>

          {/* Sections toggle */}
          <SidebarSection label="Sections">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {ALL_SECTIONS.map((s) => {
                const active = blocks.includes(s.key);
                return (
                  <label
                    key={s.key}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 8px', borderRadius: 6, cursor: s.locked ? 'default' : 'pointer',
                      background: active ? 'rgba(121,157,127,0.06)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      disabled={s.locked}
                      onChange={() => toggleBlock(s.key)}
                      style={{ accentColor: 'var(--sage)', width: 14, height: 14 }}
                    />
                    <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 12, color: 'var(--text)', fontWeight: active ? 500 : 400 }}>
                      {s.label}
                    </span>
                    {s.locked && (
                      <span style={{
                        fontFamily: 'var(--font-montserrat)', fontSize: 8, color: 'var(--sage)',
                        background: 'rgba(121,157,127,0.1)', padding: '1px 5px', borderRadius: 3,
                        fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px',
                      }}>
                        Always on
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </SidebarSection>

          {/* Content editing */}
          <SidebarSection label="Content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <SidebarLabel>Greeting</SidebarLabel>
                <textarea
                  value={content.greeting ?? ''}
                  onChange={(e) => updateContent({ greeting: e.target.value })}
                  placeholder={`Dear ${guestName}, you are warmly invited...`}
                  rows={2}
                  style={{
                    width: '100%', padding: '6px 10px', borderRadius: 6,
                    border: '1px solid var(--border)', background: 'var(--bg)',
                    fontFamily: 'var(--font-montserrat)', fontSize: 12, color: 'var(--text)',
                    resize: 'vertical', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <SidebarLabel>Footer</SidebarLabel>
                <input
                  type="text"
                  value={content.footer ?? ''}
                  onChange={(e) => updateContent({ footer: e.target.value })}
                  placeholder="We can't wait to celebrate with you"
                  style={{
                    width: '100%', padding: '6px 10px', borderRadius: 6,
                    border: '1px solid var(--border)', background: 'var(--bg)',
                    fontFamily: 'var(--font-montserrat)', fontSize: 12, color: 'var(--text)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          </SidebarSection>

          {/* Save */}
          <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
            {saved && (
              <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 12, color: 'var(--sage)' }}>
                Saved
              </span>
            )}
            <Button onClick={handleSave} disabled={saving || !hasChanges}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* ── Center: Preview canvas ──────────────────────────────────── */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--surface)',
          overflow: 'hidden',
        }}>
          {/* Toolbar bar */}
          <div style={{
            height: 48,
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: '0 20px',
            flexShrink: 0,
          }}>
            {/* View mode toggle */}
            <div style={{
              display: 'flex',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 2,
            }}>
              <button
                onClick={() => setViewMode('mobile')}
                title="Mobile view"
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === 'mobile' ? 'var(--sage)' : 'transparent',
                  color: viewMode === 'mobile' ? 'white' : 'var(--text-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontFamily: 'var(--font-montserrat)',
                  fontSize: 11,
                  fontWeight: 500,
                }}
              >
                {/* Phone icon */}
                <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
                  <rect x="0.5" y="0.5" width="11" height="15" rx="2" stroke="currentColor" strokeWidth="1" />
                  <circle cx="6" cy="13" r="1" fill="currentColor" />
                </svg>
                Mobile
              </button>
              <button
                onClick={() => setViewMode('desktop')}
                title="Desktop view"
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === 'desktop' ? 'var(--sage)' : 'transparent',
                  color: viewMode === 'desktop' ? 'white' : 'var(--text-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontFamily: 'var(--font-montserrat)',
                  fontSize: 11,
                  fontWeight: 500,
                }}
              >
                {/* Monitor icon */}
                <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                  <rect x="0.5" y="0.5" width="15" height="10" rx="1.5" stroke="currentColor" strokeWidth="1" />
                  <path d="M5 12h6M8 11v1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                </svg>
                Desktop
              </button>
            </div>
          </div>

          {/* Canvas area with centered preview */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: viewMode === 'mobile' ? 'flex-start' : 'flex-start',
            padding: '32px 24px',
            background: 'repeating-conic-gradient(var(--border) 0% 25%, transparent 0% 50%) 50% / 16px 16px',
          }}>
            {/* Device frame */}
            <div style={{
              width: previewWidth,
              maxWidth: '100%',
              flexShrink: 0,
              borderRadius: frameRadius,
              border: `${frameBorder}px solid #1A1A1A`,
              overflow: 'hidden',
              boxShadow: '0 12px 48px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)',
              background: '#1A1A1A',
              display: 'flex',
              flexDirection: 'column',
              ...(viewMode === 'desktop' ? { transform: 'scale(0.7)', transformOrigin: 'top center' } : {}),
            }}>
              {/* Status bar / browser chrome */}
              {viewMode === 'mobile' ? (
                <div style={{
                  height: 44,
                  background: bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  position: 'relative',
                }}>
                  <div style={{ width: 80, height: 22, background: '#1A1A1A', borderRadius: 20 }} />
                  <span style={{
                    position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
                    fontFamily: 'var(--font-montserrat)', fontSize: 12, fontWeight: 600,
                    color: isDarkBg(bgColor) ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                  }}>
                    9:41
                  </span>
                  <StatusBarIcons bgColor={bgColor} />
                </div>
              ) : (
                <div style={{
                  height: 36,
                  background: '#2A2A2A',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 12px',
                  gap: 8,
                  flexShrink: 0,
                }}>
                  {/* Window dots */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }} />
                  </div>
                  {/* URL bar */}
                  <div style={{
                    flex: 1,
                    background: '#1A1A1A',
                    borderRadius: 5,
                    padding: '4px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M5 1v4M3 3l2-2 2 2M1 6h8v2.5a.5.5 0 01-.5.5h-7a.5.5 0 01-.5-.5V6z" stroke="#666" strokeWidth="0.8" />
                    </svg>
                    <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: '#888' }}>
                      reserve.love/invite/...
                    </span>
                  </div>
                </div>
              )}

              {/* Scrollable invite content */}
              <div style={{
                overflowY: 'auto',
                background: bgColor,
                scrollBehavior: 'smooth',
                ...(viewMode === 'mobile'
                  ? { maxHeight: 'calc(100vh - 280px)' }
                  : { maxHeight: 700 }
                ),
              }}>
                {/* Invite content wrapper — centered on desktop */}
                <div style={{
                  ...(viewMode === 'desktop' ? {
                    maxWidth: 520,
                    margin: '0 auto',
                  } : {}),
                }}>
                  {/* Hero */}
                  <LivePreview
                    templateId={selectedTemplate}
                    name1={name1}
                    name2={name2}
                    dateStr={dateStr}
                    dateObj={dateObj}
                    venue={venue}
                    namesStyle={namesStyle}
                    dateStyle={dateStyle}
                    venueStyle={venueStyle}
                    activeZone={activeZone}
                    onSelectZone={setActiveZone}
                    scale={1}
                  />

                  {/* Guest greeting */}
                  <div style={{ padding: '20px 24px 0', textAlign: 'center' }}>
                    <p style={{
                      fontFamily: 'Libre Caslon Text, Georgia, serif',
                      fontSize: viewMode === 'desktop' ? 16 : 14,
                      fontStyle: 'italic',
                      color: isDarkBg(bgColor) ? 'rgba(255,255,255,0.6)' : '#6B6560',
                      margin: 0, lineHeight: 1.6,
                    }}>
                      {greetingText.replace(/\{guest_name\}/gi, guestName)}
                    </p>
                  </div>

                  {/* Sections */}
                  <div style={{ padding: '28px 24px 0', display: 'flex', flexDirection: 'column', gap: 32 }}>
                    {blocks.includes('countdown') && wedding.wedding_date && (
                      <CountdownTimer targetDate={wedding.wedding_date} timezone={wedding.timezone ?? 'UTC'} />
                    )}

                    {blocks.includes('rsvp') && (
                      <RsvpPreview guestName={guestName} bgColor={bgColor} />
                    )}

                    {blocks.includes('table') && (
                      <TableReveal invite={{
                        id: 'preview', wedding_id: wedding.id, token: 'preview',
                        guest_name: guestName, max_guests: 2,
                        table_number: sampleInvite?.table_number ?? 7,
                        table_name: sampleInvite?.table_name ?? 'The Willow Table',
                        email: null, phone: null, status: 'pending', responded_at: null, created_at: '',
                      }} />
                    )}

                    {blocks.includes('itinerary') && events.length > 0 && (
                      <ItineraryTimeline events={events} />
                    )}
                    {blocks.includes('itinerary') && events.length === 0 && (
                      <PreviewPlaceholder label="Itinerary" message="Add events in the Itinerary tab" />
                    )}

                    {blocks.includes('venue') && (
                      <VenuePreview venue={venue} bgColor={bgColor} />
                    )}

                    {blocks.includes('photos') && photos.length > 0 && (
                      <PhotoGallery photos={photos} />
                    )}
                    {blocks.includes('photos') && photos.length === 0 && (
                      <PreviewPlaceholder label="Photos" message="Upload photos in the Photos tab" />
                    )}

                    {blocks.includes('qna') && (
                      <QnaPreview questions={questions} bgColor={bgColor} />
                    )}
                  </div>

                  {/* Footer */}
                  <div style={{ padding: '40px 24px 20px', textAlign: 'center' }}>
                    <p style={{
                      fontFamily: 'Libre Caslon Text, Georgia, serif',
                      fontSize: 13, fontStyle: 'italic',
                      color: isDarkBg(bgColor) ? 'rgba(255,255,255,0.35)' : '#9E9890',
                      margin: '0 0 16px', lineHeight: 1.6,
                    }}>
                      {footerText}
                    </p>
                    <p style={{
                      fontFamily: 'Libre Caslon Text, Georgia, serif',
                      fontSize: 9, fontStyle: 'italic',
                      color: isDarkBg(bgColor) ? 'rgba(255,255,255,0.2)' : '#C4BFB8',
                      letterSpacing: '0.5px',
                    }}>
                      Powered by Reserve
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom chrome */}
              {viewMode === 'mobile' && (
                <div style={{
                  height: 24, background: bgColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <div style={{
                    width: 120, height: 4,
                    background: isDarkBg(bgColor) ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)',
                    borderRadius: 2,
                  }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Helpers ───────────────────────────────────────────────────────────── */

function isDarkBg(hex: string): boolean {
  const c = hex.replace('#', '');
  if (c.length < 6) return false;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

function StatusBarIcons({ bgColor }: { bgColor: string }) {
  const c = isDarkBg(bgColor) ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
  return (
    <div style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 5, alignItems: 'center' }}>
      <svg width="15" height="10" viewBox="0 0 15 10">
        <rect x="0" y="6" width="3" height="4" rx="0.5" fill={c} />
        <rect x="4" y="4" width="3" height="6" rx="0.5" fill={c} />
        <rect x="8" y="2" width="3" height="8" rx="0.5" fill={c} />
        <rect x="12" y="0" width="3" height="10" rx="0.5" fill={c} />
      </svg>
      <svg width="22" height="10" viewBox="0 0 22 10">
        <rect x="0" y="0" width="19" height="10" rx="2" stroke={isDarkBg(bgColor) ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'} strokeWidth="1" fill="none" />
        <rect x="2" y="2" width="14" height="6" rx="1" fill={c} />
        <rect x="20" y="3" width="2" height="4" rx="0.5" fill={isDarkBg(bgColor) ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'} />
      </svg>
    </div>
  );
}

/* ── Sidebar building blocks ───────────────────────────────────────────── */

function SidebarSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{
        fontFamily: 'var(--font-montserrat)', fontSize: 10, color: 'var(--text-tertiary)',
        margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600,
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
      display: 'block', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.3px',
    }}>
      {children}
    </label>
  );
}

/* ── RSVP Visual Preview ───────────────────────────────────────────────── */
function RsvpPreview({ guestName, bgColor }: { guestName: string; bgColor: string }) {
  const dark = isDarkBg(bgColor);
  return (
    <div>
      <p style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: 13, letterSpacing: '3px',
        color: dark ? 'rgba(255,255,255,0.5)' : '#1A1A1A',
        textTransform: 'uppercase', textAlign: 'center', margin: '0 0 16px',
      }}>
        RSVP
      </p>
      <div style={{
        padding: '10px 14px', borderRadius: 8, marginBottom: 10,
        border: `1px solid ${dark ? 'rgba(255,255,255,0.15)' : 'rgba(26,26,26,0.12)'}`,
        background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)',
      }}>
        <p style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 15, color: dark ? 'rgba(255,255,255,0.8)' : '#1A1A1A', margin: 0,
        }}>
          {guestName}
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{
          flex: 1, padding: '11px 16px', borderRadius: 8,
          background: '#2C3A2E', textAlign: 'center',
          fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 14, color: '#F2F0EC',
          letterSpacing: '1px',
        }}>
          Joyfully accepts
        </div>
        <div style={{
          flex: 1, padding: '11px 16px', borderRadius: 8,
          border: `1px solid ${dark ? 'rgba(255,255,255,0.2)' : '#ccc'}`, textAlign: 'center',
          fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 14,
          color: dark ? 'rgba(255,255,255,0.5)' : '#666', letterSpacing: '1px',
        }}>
          Regretfully declines
        </div>
      </div>
    </div>
  );
}

/* ── Venue Preview ─────────────────────────────────────────────────────── */
function VenuePreview({ venue, bgColor }: { venue: string; bgColor: string }) {
  const dark = isDarkBg(bgColor);
  return (
    <div>
      <p style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: 13, letterSpacing: '3px',
        color: dark ? 'rgba(255,255,255,0.5)' : '#B8965A',
        textTransform: 'uppercase', textAlign: 'center', margin: '0 0 16px',
      }}>
        Getting There
      </p>
      <div style={{
        borderRadius: 12, overflow: 'hidden',
        border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(184,150,90,0.2)'}`,
        height: 120, background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(44,62,45,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>📍</div>
          <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 13, color: dark ? 'rgba(255,255,255,0.5)' : '#8A9E8A', margin: 0 }}>
            {venue || 'Venue'}
          </p>
        </div>
      </div>
      <div style={{
        display: 'block', textAlign: 'center', padding: '10px',
        borderRadius: 8, border: `1.5px solid ${dark ? 'rgba(255,255,255,0.2)' : 'rgba(44,62,45,0.3)'}`,
        fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 14, letterSpacing: '1px',
        color: dark ? 'rgba(255,255,255,0.7)' : '#2C3E2D', marginTop: 10,
      }}>
        Get Directions →
      </div>
    </div>
  );
}

/* ── Q&A Preview ───────────────────────────────────────────────────────── */
function QnaPreview({ questions, bgColor }: { questions: Question[]; bgColor: string }) {
  const dark = isDarkBg(bgColor);
  const pinned = questions.filter((q) => q.is_pinned && q.answer_text);

  return (
    <div>
      <p style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: 13, letterSpacing: '3px',
        color: dark ? 'rgba(255,255,255,0.5)' : '#1A1A1A',
        textTransform: 'uppercase', textAlign: 'center', margin: '0 0 16px',
      }}>
        Questions &amp; Answers
      </p>
      {pinned.length > 0 ? (
        pinned.map((q) => (
          <div key={q.id} style={{ borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(26,26,26,0.1)'}`, marginBottom: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11 }}>📌</span>
                <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 15, color: dark ? 'rgba(255,255,255,0.8)' : '#1A1A1A', lineHeight: 1.4 }}>
                  {q.question_text}
                </span>
              </span>
              <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 16, color: dark ? 'rgba(255,255,255,0.4)' : '#1A1A1A' }}>∨</span>
            </div>
          </div>
        ))
      ) : (
        <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 14, color: dark ? 'rgba(255,255,255,0.4)' : '#9E9E9E', textAlign: 'center', margin: 0, fontStyle: 'italic' }}>
          Pin questions in the Questions tab to show FAQs
        </p>
      )}
      <div style={{
        marginTop: 12, padding: '10px 12px', borderRadius: 8,
        border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(26,26,26,0.15)'}`,
        background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)',
      }}>
        <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 14, color: dark ? 'rgba(255,255,255,0.25)' : '#BFBFBF', margin: 0 }}>
          Ask the couple anything…
        </p>
      </div>
    </div>
  );
}

/* ── Empty section placeholder ─────────────────────────────────────────── */
function PreviewPlaceholder({ label, message }: { label: string; message: string }) {
  return (
    <div style={{
      border: '1.5px dashed rgba(0,0,0,0.1)',
      borderRadius: 12, padding: '20px 16px', textAlign: 'center',
    }}>
      <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 13, letterSpacing: '3px', color: '#999', textTransform: 'uppercase', margin: '0 0 6px' }}>
        {label}
      </p>
      <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: '#BFBFBF', margin: 0 }}>
        {message}
      </p>
    </div>
  );
}

/* ── Live Preview (Hero) ───────────────────────────────────────────────── */
function LivePreview({
  templateId, name1, name2, dateStr, dateObj, venue,
  namesStyle, dateStyle, venueStyle,
  activeZone, onSelectZone, scale,
}: {
  templateId: string;
  name1: string; name2: string;
  dateStr: string; dateObj: Date | null; venue: string;
  namesStyle: Required<ZoneOverride>;
  dateStyle: Required<ZoneOverride>;
  venueStyle: Required<ZoneOverride>;
  activeZone: ZoneKey | null;
  onSelectZone: (z: ZoneKey) => void;
  scale: number;
}) {
  const tmpl = TEMPLATE_LIST.find((t) => t.id === templateId);
  const accent = tmpl?.accent ?? '#8B7355';

  function zoneWrap(zone: ZoneKey, children: React.ReactNode) {
    const isActive = activeZone === zone;
    return (
      <div
        onClick={(e) => { e.stopPropagation(); onSelectZone(zone); }}
        style={{
          cursor: 'pointer',
          outline: isActive ? `2px solid ${accent}` : '2px solid transparent',
          outlineOffset: 4, borderRadius: 4,
          transition: 'outline-color 0.15s',
        }}
      >
        {children}
      </div>
    );
  }

  if (templateId === 'minimal-serif') {
    return (
      <div style={{ aspectRatio: '5 / 7', display: 'flex', flexDirection: 'column', padding: `${36 * scale}px ${28 * scale}px ${24 * scale}px`, position: 'relative' }}
        onClick={() => onSelectZone(activeZone!)}
      >
        {zoneWrap('couple_names', (
          <>
            <p style={{ fontFamily: `"${namesStyle.fontFamily}", serif`, fontSize: namesStyle.fontSize * scale, color: namesStyle.fontColor, margin: 0, fontWeight: 400, lineHeight: 0.95, letterSpacing: '3px' }}>
              {name1.toUpperCase()}
            </p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18 * scale, color: namesStyle.fontColor, margin: `${3 * scale}px 0 0 ${40 * scale}px`, fontStyle: 'italic', fontWeight: 400 }}>
              and
            </p>
            <p style={{ fontFamily: `"${namesStyle.fontFamily}", serif`, fontSize: namesStyle.fontSize * scale, color: namesStyle.fontColor, margin: `0 0 ${20 * scale}px`, fontWeight: 400, lineHeight: 0.95, letterSpacing: '3px' }}>
              {name2.toUpperCase()}
            </p>
          </>
        ))}
        <div style={{ width: 1, height: 28 * scale, background: '#1A1A1A', margin: `0 auto ${20 * scale}px` }} />
        <div style={{ textAlign: 'center', marginTop: 'auto' }}>
          <p style={{ fontFamily: `"${dateStyle.fontFamily}", sans-serif`, fontSize: 9 * scale, color: dateStyle.fontColor, margin: `0 0 ${4 * scale}px` }}>
            Invite you to their wedding on
          </p>
          {zoneWrap('date', (
            <p style={{ fontFamily: `"${dateStyle.fontFamily}", sans-serif`, fontSize: dateStyle.fontSize * scale, color: dateStyle.fontColor, margin: `0 0 ${4 * scale}px`, fontWeight: 500 }}>
              {dateStr}
            </p>
          ))}
          {venue && zoneWrap('venue', (
            <p style={{ fontFamily: `"${venueStyle.fontFamily}", sans-serif`, fontSize: venueStyle.fontSize * scale, color: venueStyle.fontColor, margin: 0 }}>
              {venue}
            </p>
          ))}
        </div>
        {dateObj && (
          <div style={{ position: 'absolute', bottom: 18 * scale, left: 28 * scale }}>
            <p style={{ fontFamily: `"${namesStyle.fontFamily}", serif`, fontSize: 18 * scale, color: '#1A1A1A', margin: 0, fontWeight: 400, letterSpacing: '2px' }}>
              {String(dateObj.getMonth() + 1).padStart(2, '0')}.{String(dateObj.getDate()).padStart(2, '0')}.{String(dateObj.getFullYear()).slice(2)}
            </p>
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 18 * scale, right: 28 * scale, width: 40 * scale, borderTop: '1px solid #1A1A1A' }} />
      </div>
    );
  }

  if (templateId === 'sage-garden') {
    return (
      <div style={{ aspectRatio: '5 / 7', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', padding: 24 * scale }}
        onClick={() => onSelectZone(activeZone!)}
      >
        {zoneWrap('couple_names', (
          <>
            <p style={{ fontFamily: `"${namesStyle.fontFamily}", serif`, fontSize: namesStyle.fontSize * scale, color: namesStyle.fontColor, margin: 0, fontWeight: 400, fontStyle: 'italic', lineHeight: 1.1 }}>
              {name1}
            </p>
            <p style={{ fontFamily: `"${namesStyle.fontFamily}", serif`, fontSize: namesStyle.fontSize * scale, color: namesStyle.fontColor, margin: `0 0 ${12 * scale}px`, fontWeight: 400, fontStyle: 'italic', lineHeight: 1.1 }}>
              &amp; {name2}
            </p>
          </>
        ))}
        <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 8 * scale, color: '#4A5D4B', margin: `0 0 ${6 * scale}px`, textTransform: 'uppercase', letterSpacing: '2.5px', lineHeight: 1.6 }}>
          Request your company<br />at their wedding
        </p>
        {dateObj && zoneWrap('date', (
          <p style={{ fontFamily: `"${dateStyle.fontFamily}", serif`, fontSize: dateStyle.fontSize * scale, color: dateStyle.fontColor, margin: `${6 * scale}px 0`, fontWeight: 400 }}>
            {String(dateObj.getMonth() + 1).padStart(2, '0')}.{String(dateObj.getDate()).padStart(2, '0')}.{dateObj.getFullYear()}
          </p>
        ))}
        {venue && zoneWrap('venue', (
          <p style={{ fontFamily: `"${venueStyle.fontFamily}", sans-serif`, fontSize: venueStyle.fontSize * scale, color: venueStyle.fontColor, margin: `0 0 ${12 * scale}px`, textTransform: 'uppercase', letterSpacing: '2px', lineHeight: 1.6 }}>
            {venue}
          </p>
        ))}
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 12 * scale, color: '#4A5D4B', margin: 0, fontStyle: 'italic' }}>
          Reception to follow
        </p>
      </div>
    );
  }

  if (templateId === 'midnight-gold') {
    return (
      <div style={{ aspectRatio: '5 / 7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: `${36 * scale}px ${24 * scale}px` }}
        onClick={() => onSelectZone(activeZone!)}
      >
        <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 8 * scale, color: '#D4C8A8', margin: `0 0 ${18 * scale}px`, textTransform: 'uppercase', letterSpacing: '4px' }}>
          Together with their families
        </p>
        {zoneWrap('couple_names', (
          <>
            <p style={{ fontFamily: `"${namesStyle.fontFamily}", serif`, fontSize: namesStyle.fontSize * scale, color: namesStyle.fontColor, margin: 0, fontWeight: 400, textTransform: 'uppercase', letterSpacing: '5px', lineHeight: 1.1, textAlign: 'center' }}>
              {name1.toUpperCase()}
            </p>
            <p style={{ fontFamily: `"${namesStyle.fontFamily}", serif`, fontSize: 20 * scale, color: namesStyle.fontColor, margin: `${4 * scale}px 0`, fontStyle: 'italic', textAlign: 'center' }}>
              &amp;
            </p>
            <p style={{ fontFamily: `"${namesStyle.fontFamily}", serif`, fontSize: namesStyle.fontSize * scale, color: namesStyle.fontColor, margin: `0 0 ${18 * scale}px`, fontWeight: 400, textTransform: 'uppercase', letterSpacing: '5px', lineHeight: 1.1, textAlign: 'center' }}>
              {name2.toUpperCase()}
            </p>
          </>
        ))}
        <div style={{ width: 40 * scale, height: 1, background: accent, margin: `0 0 ${18 * scale}px` }} />
        {zoneWrap('date', (
          <p style={{ fontFamily: `"${dateStyle.fontFamily}", sans-serif`, fontSize: dateStyle.fontSize * scale, color: dateStyle.fontColor, margin: `0 0 ${4 * scale}px`, textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center' }}>
            {dateStr}
          </p>
        ))}
        {venue && zoneWrap('venue', (
          <p style={{ fontFamily: `"${venueStyle.fontFamily}", sans-serif`, fontSize: venueStyle.fontSize * scale, color: venueStyle.fontColor, margin: `0 0 ${18 * scale}px`, letterSpacing: '1px', textAlign: 'center' }}>
            {venue}
          </p>
        ))}
        <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 8 * scale, color: '#8A7F6A', margin: 0, letterSpacing: '1.5px' }}>
          Dinner &amp; Dancing to follow
        </p>
      </div>
    );
  }

  // Default: heritage + beige-watercolor
  return (
    <div style={{ aspectRatio: '5 / 7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: `${36 * scale}px ${24 * scale}px` }}
      onClick={() => onSelectZone(activeZone!)}
    >
      {zoneWrap('couple_names', (
        <>
          <p style={{ fontFamily: `"${namesStyle.fontFamily}", serif`, fontSize: namesStyle.fontSize * scale, color: namesStyle.fontColor, margin: 0, fontWeight: 400, textTransform: 'uppercase', letterSpacing: '4px', lineHeight: 1.1, textAlign: 'center' }}>
            {name1.toUpperCase()}
          </p>
          <p style={{ fontFamily: `"${namesStyle.fontFamily}", serif`, fontSize: 20 * scale, color: accent, margin: `${6 * scale}px 0`, fontStyle: 'italic', textAlign: 'center' }}>
            &amp;
          </p>
          <p style={{ fontFamily: `"${namesStyle.fontFamily}", serif`, fontSize: namesStyle.fontSize * scale, color: namesStyle.fontColor, margin: `0 0 ${24 * scale}px`, fontWeight: 400, textTransform: 'uppercase', letterSpacing: '4px', lineHeight: 1.1, textAlign: 'center' }}>
            {name2.toUpperCase()}
          </p>
        </>
      ))}
      <div style={{ width: 32 * scale, height: 1, background: accent, margin: `0 0 ${20 * scale}px` }} />
      {zoneWrap('date', (
        <p style={{ fontFamily: `"${dateStyle.fontFamily}", sans-serif`, fontSize: dateStyle.fontSize * scale, color: dateStyle.fontColor, margin: `0 0 ${4 * scale}px`, textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center' }}>
          {dateStr}
        </p>
      ))}
      {venue && zoneWrap('venue', (
        <p style={{ fontFamily: `"${venueStyle.fontFamily}", sans-serif`, fontSize: venueStyle.fontSize * scale, color: venueStyle.fontColor, margin: `0 0 ${24 * scale}px`, letterSpacing: '1px', textAlign: 'center' }}>
          {venue}
        </p>
      ))}
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 10 * scale, color: accent, margin: 0, fontStyle: 'italic' }}>
        {templateId === 'heritage' ? 'formal invitation to follow' : 'reception to follow'}
      </p>
    </div>
  );
}
