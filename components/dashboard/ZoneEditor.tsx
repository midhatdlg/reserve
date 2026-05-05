'use client';

import { useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { resolveZoneContent } from '@/lib/resolve-zone';
import type { DesignZone, Invite } from '@/types';

/* ── Constants ────────────────────────────────────────────────────────── */

const DESIGN_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Montserrat:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Yeseva+One&display=swap';

const FONT_OPTIONS = [
  { value: 'Cormorant Garamond', label: 'Cormorant Garamond' },
  { value: 'NewYork', label: 'NewYork' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Yeseva One', label: 'Yeseva One' },
  { value: 'Lora', label: 'Lora' },
  { value: 'Libre Caslon Text', label: 'Libre Caslon' },
  { value: 'Great Vibes', label: 'Great Vibes' },
  { value: 'Raleway', label: 'Raleway' },
];

const ZONE_TYPE_LABELS: Record<DesignZone['type'], string> = {
  couple_names: 'Couple Names',
  date: 'Wedding Date',
  venue: 'Venue Name',
  guest_name: 'Guest Name',
  custom: 'Custom Text',
};

const ZONE_TYPE_DEFAULTS: Record<DesignZone['type'], { content: string; fontSize: number; fontWeight: string }> = {
  couple_names: { content: '{{name_1}} & {{name_2}}', fontSize: 36, fontWeight: '400' },
  date:         { content: '{{wedding_date}}',         fontSize: 16, fontWeight: '400' },
  venue:        { content: '{{venue_name}}',           fontSize: 14, fontWeight: '400' },
  guest_name:   { content: '{{guest_name}}',           fontSize: 18, fontWeight: '400' },
  custom:       { content: 'Custom text',              fontSize: 16, fontWeight: '400' },
};

const WEIGHT_OPTIONS = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi-bold' },
  { value: '700', label: 'Bold' },
];

/* ── CustomDesignPreview ──────────────────────────────────────────────── */

interface PreviewProps {
  weddingId: string;
  customDesignUrl: string | null;
  designZones: DesignZone[];
  onDesignUrlChange: (url: string | null) => void;
  onZonesChange: (zones: DesignZone[]) => void;
  wedding: { title: string | null; wedding_date: string | null; venue_name: string | null };
  sampleInvite: Invite | null;
  selectedZoneId: string | null;
  onSelectZone: (id: string | null) => void;
}

export function CustomDesignPreview({
  weddingId, customDesignUrl, designZones,
  onDesignUrlChange, onZonesChange,
  wedding, sampleInvite,
  selectedZoneId, onSelectZone,
}: PreviewProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [typePickerPos, setTypePickerPos] = useState<{ x: number; y: number; pctX: number; pctY: number } | null>(null);
  const supabase = createClient();

  /* Upload handler */
  const handleUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be under 10MB');
      return;
    }

    setUploading(true);
    const ext = file.name.split('.').pop() ?? 'png';
    const path = `designs/${weddingId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // Delete old image if replacing
    if (customDesignUrl) {
      const oldPath = customDesignUrl.split('/photos/')[1];
      if (oldPath) await supabase.storage.from('photos').remove([oldPath]);
    }

    const { error } = await supabase.storage.from('photos').upload(path, file, { cacheControl: '3600', upsert: false });
    if (error) {
      alert(`Upload failed: ${error.message}`);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('photos').getPublicUrl(path);
    onDesignUrlChange(urlData.publicUrl);
    setUploading(false);
  }, [weddingId, customDesignUrl, supabase, onDesignUrlChange]);

  /* Canvas click — add zone */
  function handleCanvasClick(e: React.MouseEvent) {
    if (!canvasRef.current) return;
    // Don't add zone if clicking on an existing zone
    if ((e.target as HTMLElement).closest('[data-zone]')) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const pctX = ((e.clientX - rect.left) / rect.width) * 100;
    const pctY = ((e.clientY - rect.top) / rect.height) * 100;

    setTypePickerPos({ x: e.clientX - rect.left, y: e.clientY - rect.top, pctX, pctY });
    onSelectZone(null);
  }

  function addZone(type: DesignZone['type']) {
    if (!typePickerPos) return;
    const defaults = ZONE_TYPE_DEFAULTS[type];
    const newZone: DesignZone = {
      id: crypto.randomUUID(),
      type,
      x: Math.max(0, typePickerPos.pctX - 30), // center the 60% width zone on click
      y: typePickerPos.pctY,
      width: 60,
      fontFamily: 'Cormorant Garamond',
      fontSize: defaults.fontSize,
      fontColor: '#FFFFFF',
      fontWeight: defaults.fontWeight,
      textAlign: 'center',
      content: defaults.content,
    };
    onZonesChange([...designZones, newZone]);
    onSelectZone(newZone.id);
    setTypePickerPos(null);
  }

  function updateZone(id: string, patch: Partial<DesignZone>) {
    onZonesChange(designZones.map((z) => z.id === id ? { ...z, ...patch } : z));
  }

  /* No image — upload area */
  if (!customDesignUrl) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <link rel="stylesheet" href={DESIGN_FONTS_URL} />
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUpload(f);
          }}
        />
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files[0];
            if (f) handleUpload(f);
          }}
          style={{
            aspectRatio: '9 / 16',
            maxHeight: 500,
            margin: '0 auto',
            border: `2px dashed ${dragOver ? 'var(--sage)' : 'var(--border)'}`,
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            cursor: 'pointer',
            background: dragOver ? 'rgba(121,157,127,0.05)' : 'transparent',
            transition: 'all 0.15s',
          }}
        >
          {uploading ? (
            <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: 'var(--text-secondary)' }}>
              Uploading...
            </p>
          ) : (
            <>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5">
                <rect x="4" y="4" width="32" height="32" rx="4" />
                <path d="M4 28l10-10 6 6 4-4 12 12" />
                <circle cx="28" cy="12" r="3" />
              </svg>
              <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                Drop your Canva export here
              </p>
              <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'var(--text-tertiary)', margin: 0 }}>
                PNG or JPG, max 10MB
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  /* Has image — interactive zone editor */
  return (
    <>
      <link rel="stylesheet" href={DESIGN_FONTS_URL} />
      <div style={{ position: 'relative' }}>
        {/* Canvas */}
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '9 / 16',
            overflow: 'hidden',
            cursor: 'crosshair',
            containerType: 'inline-size',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={customDesignUrl}
            alt="Custom design"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />

          {/* Zones */}
          {designZones.map((zone) => (
            <DraggableZone
              key={zone.id}
              zone={zone}
              isSelected={selectedZoneId === zone.id}
              onSelect={() => { onSelectZone(zone.id); setTypePickerPos(null); }}
              onMove={(x, y) => updateZone(zone.id, { x, y })}
              onResize={(width) => updateZone(zone.id, { width })}
              canvasRef={canvasRef}
              resolvedContent={resolveZoneContent(zone.content, wedding, sampleInvite)}
            />
          ))}

          {/* Type picker popover */}
          {typePickerPos && (
            <>
              {/* Backdrop to close */}
              <div
                onClick={(e) => { e.stopPropagation(); setTypePickerPos(null); }}
                style={{ position: 'absolute', inset: 0, zIndex: 10 }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: typePickerPos.x,
                  top: typePickerPos.y,
                  zIndex: 11,
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  padding: 4,
                  minWidth: 160,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {(Object.keys(ZONE_TYPE_LABELS) as DesignZone['type'][]).map((type) => (
                  <button
                    key={type}
                    onClick={() => addZone(type)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '8px 12px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'var(--font-montserrat)',
                      fontSize: 12,
                      color: 'var(--text)',
                      borderRadius: 4,
                    }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'rgba(121,157,127,0.1)'; }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'transparent'; }}
                  >
                    {ZONE_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Replace image button */}
        <div style={{ padding: '8px 0', textAlign: 'center' }}>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: 11,
              color: 'var(--text-tertiary)',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '5px 14px',
              cursor: 'pointer',
            }}
          >
            {uploading ? 'Uploading...' : 'Replace image'}
          </button>
        </div>
      </div>
    </>
  );
}

/* ── DraggableZone ────────────────────────────────────────────────────── */

interface DraggableZoneProps {
  zone: DesignZone;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (width: number) => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  resolvedContent: string;
}

function DraggableZone({ zone, isSelected, onSelect, onMove, onResize, canvasRef, resolvedContent }: DraggableZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const dragStart = useRef({ startX: 0, startY: 0, zoneX: 0, zoneY: 0, zoneW: 0 });

  function handlePointerDown(e: React.PointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    onSelect();

    const rect = canvasRef.current!.getBoundingClientRect();
    dragStart.current = {
      startX: e.clientX,
      startY: e.clientY,
      zoneX: zone.x,
      zoneY: zone.y,
      zoneW: zone.width,
    };
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging && !resizing) return;
    const rect = canvasRef.current!.getBoundingClientRect();

    if (resizing) {
      const dx = ((e.clientX - dragStart.current.startX) / rect.width) * 100;
      const newWidth = Math.max(10, Math.min(100, dragStart.current.zoneW + dx));
      onResize(newWidth);
      return;
    }

    const dx = ((e.clientX - dragStart.current.startX) / rect.width) * 100;
    const dy = ((e.clientY - dragStart.current.startY) / rect.height) * 100;
    onMove(
      Math.max(0, Math.min(100 - zone.width, dragStart.current.zoneX + dx)),
      Math.max(0, Math.min(95, dragStart.current.zoneY + dy))
    );
  }

  function handlePointerUp() {
    setDragging(false);
    setResizing(false);
  }

  function handleResizeDown(e: React.PointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    onSelect();

    dragStart.current = {
      startX: e.clientX,
      startY: e.clientY,
      zoneX: zone.x,
      zoneY: zone.y,
      zoneW: zone.width,
    };
    setResizing(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  return (
    <div
      data-zone
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: 'absolute',
        left: `${zone.x}%`,
        top: `${zone.y}%`,
        width: `${zone.width}%`,
        textAlign: zone.textAlign,
        cursor: dragging ? 'grabbing' : 'grab',
        outline: isSelected
          ? '2px solid #4A90D9'
          : '1px dashed rgba(255,255,255,0.3)',
        outlineOffset: 2,
        borderRadius: 2,
        padding: '2px 4px',
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      <span style={{
        fontFamily: `"${zone.fontFamily}", serif`,
        fontSize: `${zone.fontSize * 0.125}cqi`,
        color: zone.fontColor,
        fontWeight: zone.fontWeight,
        display: 'block',
        lineHeight: 1.2,
        pointerEvents: 'none',
      }}>
        {resolvedContent}
      </span>

      {/* Resize handle — right edge */}
      {isSelected && (
        <div
          onPointerDown={handleResizeDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{
            position: 'absolute',
            right: -5,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 10,
            height: 24,
            background: '#4A90D9',
            borderRadius: 3,
            cursor: 'ew-resize',
            touchAction: 'none',
          }}
        />
      )}
    </div>
  );
}

/* ── ZoneEditorSidebar ────────────────────────────────────────────────── */

interface SidebarProps {
  zones: DesignZone[];
  onZonesChange: (zones: DesignZone[]) => void;
  selectedZoneId: string | null;
  onSelectZone: (id: string | null) => void;
  hasDesignImage: boolean;
}

export function ZoneEditorSidebar({ zones, onZonesChange, selectedZoneId, onSelectZone, hasDesignImage }: SidebarProps) {
  const selectedZone = zones.find((z) => z.id === selectedZoneId) ?? null;

  function updateZone(id: string, patch: Partial<DesignZone>) {
    onZonesChange(zones.map((z) => z.id === id ? { ...z, ...patch } : z));
  }

  function deleteZone(id: string) {
    onZonesChange(zones.filter((z) => z.id !== id));
    if (selectedZoneId === id) onSelectZone(null);
  }

  function addZone(type: DesignZone['type']) {
    const defaults = ZONE_TYPE_DEFAULTS[type];
    const newZone: DesignZone = {
      id: crypto.randomUUID(),
      type,
      x: 20,
      y: 40,
      width: 60,
      fontFamily: 'Cormorant Garamond',
      fontSize: defaults.fontSize,
      fontColor: '#FFFFFF',
      fontWeight: defaults.fontWeight,
      textAlign: 'center',
      content: defaults.content,
    };
    onZonesChange([...zones, newZone]);
    onSelectZone(newZone.id);
  }

  return (
    <div>
      {/* Section: Text Zones */}
      <SidebarSection label="Text Zones">
        {!hasDesignImage ? (
          <p style={{
            fontFamily: 'var(--font-montserrat)', fontSize: 11,
            color: 'var(--text-tertiary)', margin: 0, fontStyle: 'italic',
          }}>
            Upload a design image first
          </p>
        ) : (
          <>
            {/* Zone list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 8 }}>
              {zones.map((z) => (
                <div
                  key={z.id}
                  onClick={() => onSelectZone(z.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    background: selectedZoneId === z.id ? 'rgba(74,144,217,0.1)' : 'transparent',
                    border: selectedZoneId === z.id ? '1px solid rgba(74,144,217,0.3)' : '1px solid transparent',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-montserrat)', fontSize: 12,
                    color: 'var(--text)', fontWeight: selectedZoneId === z.id ? 500 : 400,
                  }}>
                    {ZONE_TYPE_LABELS[z.type]}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteZone(z.id); }}
                    title="Delete zone"
                    style={{
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      fontFamily: 'var(--font-montserrat)', fontSize: 14,
                      color: 'var(--text-tertiary)', padding: '0 4px',
                      lineHeight: 1,
                    }}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>

            {/* Add zone button */}
            <div style={{ position: 'relative' }}>
              <AddZoneDropdown onAdd={addZone} />
            </div>
          </>
        )}
      </SidebarSection>

      {/* Section: Selected zone properties */}
      {selectedZone && (
        <SidebarSection label="Zone Properties">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Type */}
            <div>
              <SidebarLabel>Type</SidebarLabel>
              <select
                value={selectedZone.type}
                onChange={(e) => {
                  const type = e.target.value as DesignZone['type'];
                  const defaults = ZONE_TYPE_DEFAULTS[type];
                  updateZone(selectedZone.id, {
                    type,
                    content: defaults.content,
                  });
                }}
                style={selectStyle}
              >
                {(Object.keys(ZONE_TYPE_LABELS) as DesignZone['type'][]).map((t) => (
                  <option key={t} value={t}>{ZONE_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>

            {/* Content (editable only for custom) */}
            {selectedZone.type === 'custom' && (
              <div>
                <SidebarLabel>Text</SidebarLabel>
                <input
                  type="text"
                  value={selectedZone.content}
                  onChange={(e) => updateZone(selectedZone.id, { content: e.target.value })}
                  style={inputStyle}
                />
              </div>
            )}

            {/* Font family */}
            <div>
              <SidebarLabel>Font</SidebarLabel>
              <select
                value={selectedZone.fontFamily}
                onChange={(e) => updateZone(selectedZone.id, { fontFamily: e.target.value })}
                style={{ ...selectStyle, fontFamily: `"${selectedZone.fontFamily}", serif` }}
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value} style={{ fontFamily: `"${f.value}", serif` }}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Font size */}
            <div>
              <SidebarLabel>Size — {selectedZone.fontSize}px</SidebarLabel>
              <input
                type="range"
                min={8}
                max={72}
                value={selectedZone.fontSize}
                onChange={(e) => updateZone(selectedZone.id, { fontSize: Number(e.target.value) })}
                style={{ width: '100%', accentColor: '#4A90D9' }}
              />
            </div>

            {/* Font color + weight row */}
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <SidebarLabel>Weight</SidebarLabel>
                <select
                  value={selectedZone.fontWeight}
                  onChange={(e) => updateZone(selectedZone.id, { fontWeight: e.target.value })}
                  style={selectStyle}
                >
                  {WEIGHT_OPTIONS.map((w) => (
                    <option key={w.value} value={w.value}>{w.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <SidebarLabel>Color</SidebarLabel>
                <input
                  type="color"
                  value={selectedZone.fontColor}
                  onChange={(e) => updateZone(selectedZone.id, { fontColor: e.target.value })}
                  style={{
                    width: 36, height: 28, border: '1px solid var(--border)',
                    borderRadius: 4, cursor: 'pointer', padding: 0, background: 'transparent',
                  }}
                />
              </div>
            </div>

            {/* Text align */}
            <div>
              <SidebarLabel>Alignment</SidebarLabel>
              <div style={{ display: 'flex', gap: 4 }}>
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => updateZone(selectedZone.id, { textAlign: align })}
                    style={{
                      flex: 1,
                      padding: '5px 0',
                      borderRadius: 5,
                      cursor: 'pointer',
                      border: selectedZone.textAlign === align ? '1px solid #4A90D9' : '1px solid var(--border)',
                      background: selectedZone.textAlign === align ? 'rgba(74,144,217,0.1)' : 'transparent',
                      color: selectedZone.textAlign === align ? '#4A90D9' : 'var(--text-tertiary)',
                      fontFamily: 'var(--font-montserrat)',
                      fontSize: 11,
                      fontWeight: 500,
                      textTransform: 'capitalize',
                    }}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>

            {/* Width */}
            <div>
              <SidebarLabel>Width — {Math.round(selectedZone.width)}%</SidebarLabel>
              <input
                type="range"
                min={10}
                max={100}
                value={selectedZone.width}
                onChange={(e) => updateZone(selectedZone.id, { width: Number(e.target.value) })}
                style={{ width: '100%', accentColor: '#4A90D9' }}
              />
            </div>
          </div>
        </SidebarSection>
      )}
    </div>
  );
}

/* ── Add Zone Dropdown ────────────────────────────────────────────────── */

function AddZoneDropdown({ onAdd }: { onAdd: (type: DesignZone['type']) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '7px 12px',
          borderRadius: 6,
          border: '1px dashed var(--border)',
          background: 'transparent',
          cursor: 'pointer',
          fontFamily: 'var(--font-montserrat)',
          fontSize: 11,
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <span style={{ fontSize: 14, lineHeight: 1 }}>+</span> Add text zone
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '100%',
          marginTop: 4,
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          padding: 4,
          zIndex: 10,
        }}>
          {(Object.keys(ZONE_TYPE_LABELS) as DesignZone['type'][]).map((type) => (
            <button
              key={type}
              onClick={() => { onAdd(type); setOpen(false); }}
              style={{
                display: 'block',
                width: '100%',
                padding: '7px 12px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--font-montserrat)',
                fontSize: 12,
                color: 'var(--text)',
                borderRadius: 4,
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'rgba(74,144,217,0.08)'; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'transparent'; }}
            >
              {ZONE_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

/* ── Sidebar Helpers ──────────────────────────────────────────────────── */

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

const selectStyle: React.CSSProperties = {
  width: '100%', padding: '6px 10px', borderRadius: 6,
  border: '1px solid var(--border)', background: 'var(--bg)',
  fontSize: 13, color: 'var(--text)', cursor: 'pointer',
  fontFamily: 'var(--font-montserrat)',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '6px 10px', borderRadius: 6,
  border: '1px solid var(--border)', background: 'var(--bg)',
  fontFamily: 'var(--font-montserrat)', fontSize: 12, color: 'var(--text)',
  boxSizing: 'border-box',
};
