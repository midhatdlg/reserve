'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ItineraryTimeline } from '@/components/invite/ItineraryTimeline';
import type { Event } from '@/types';

interface Props {
  weddingId: string;
  initialEvents: Event[];
}

type Preset = {
  label: string;
  emoji: string;
  name: string;
  event_type: string;
};

const PRESETS: Preset[] = [
  { label: 'Pre-wedding Photoshoot', emoji: '📸', name: 'Pre-wedding Photoshoot', event_type: 'photoshoot' },
  { label: 'Cocktail Hour',          emoji: '🥂', name: 'Cocktail Hour',           event_type: 'cocktail'  },
  { label: 'Couple Entrance',        emoji: '💫', name: 'Couple Entrance',         event_type: 'entrance'  },
  { label: 'Dinner',                 emoji: '🍽️', name: 'Dinner',                  event_type: 'dinner'    },
  { label: 'Dance Floor',            emoji: '🎶', name: 'Dance Floor',             event_type: 'dancing'   },
];

// 30-minute interval time options (12h AM/PM)
const TIME_OPTIONS = (() => {
  const opts: { value: string; label: string }[] = [];
  for (let i = 0; i < 48; i++) {
    const h = Math.floor(i / 2);
    const m = i % 2 === 0 ? '00' : '30';
    const value = `${String(h).padStart(2, '0')}:${m}`;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    opts.push({ value, label: `${h12}:${m} ${ampm}` });
  }
  return opts;
})();

function formatTimeDisplay(t: string | null) {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function ItineraryBuilder({ weddingId, initialEvents }: Props) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saveFlash, setSaveFlash] = useState<Record<string, Record<string, 'saved' | 'error'>>>({});
  const [adding, setAdding] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const supabase = createClient();

  async function addCustomEvent() {
    setAdding(true);
    const { data, error } = await supabase
      .from('events')
      .insert({
        wedding_id: weddingId,
        name: 'Custom Event',
        event_type: 'other',
        start_time: null,
        end_time: null,
        sort_order: events.length,
      })
      .select()
      .single();
    if (!error && data) {
      setEvents((prev) => [...prev, data]);
      setExpandedId(data.id);
    }
    setAdding(false);
  }

  async function updateEvent(id: string, patch: Partial<Event>, fieldKey: string) {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
    const { error } = await supabase.from('events').update(patch).eq('id', id);
    const status = error ? 'error' : 'saved';
    setSaveFlash((prev) => ({ ...prev, [id]: { ...prev[id], [fieldKey]: status } }));
    setTimeout(() => {
      setSaveFlash((prev) => {
        const copy = { ...prev };
        const inner = { ...copy[id] };
        delete inner[fieldKey];
        copy[id] = inner;
        return copy;
      });
    }, 1500);
  }

  async function deleteEvent(id: string) {
    await supabase.from('events').delete().eq('id', id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  function handleStartTimeChange(id: string, value: string) {
    const event = events.find((e) => e.id === id);
    const updates: Partial<Event> = { start_time: value || null };
    if (!event?.end_time && value) {
      const [h, m] = value.split(':').map(Number);
      const endH = (h + 1) % 24;
      updates.end_time = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    updateEvent(id, updates, 'start_time');
  }

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const fromIdx = events.findIndex((e) => e.id === dragId);
    const toIdx = events.findIndex((e) => e.id === targetId);
    const reordered = [...events];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const updated = reordered.map((e, i) => ({ ...e, sort_order: i }));
    setEvents(updated);
    setDragId(null);
    setDragOver(null);
    Promise.all(updated.map((e) => supabase.from('events').update({ sort_order: e.sort_order }).eq('id', e.id)));
  }

  const previewEvents = events.map((e) => ({
    ...e,
    start_time: e.start_time
      ? (e.start_time.includes('T') ? e.start_time : `2000-01-01T${e.start_time}:00`)
      : null,
  }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
      {/* Editor */}
      <div>
        {/* Event cards */}
        {events.map((event) => {
          const isExpanded = expandedId === event.id;
          const isDragging = dragId === event.id;
          const isDropTarget = dragOver === event.id && dragId !== event.id;
          const flash = saveFlash[event.id];
          const anyFlash = flash ? Object.values(flash)[0] : null;
          const startDisplay = formatTimeDisplay(event.start_time);
          const endDisplay = formatTimeDisplay(event.end_time);
          const timeLabel = startDisplay
            ? endDisplay ? `${startDisplay} – ${endDisplay}` : startDisplay
            : 'No time set';
          const hasTime = !!event.start_time;

          return (
            <div
              key={event.id}
              draggable
              onDragStart={(e) => {
                setDragId(event.id);
                setDragOver(null);
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragEnd={() => { setDragId(null); setDragOver(null); }}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOver(event.id); }}
              onDrop={(e) => { e.preventDefault(); handleDrop(event.id); }}
              style={{
                background: isDropTarget ? 'var(--surface-alt)' : 'var(--surface)',
                border: `1px solid ${isDropTarget ? 'var(--sage)' : 'var(--border)'}`,
                borderRadius: 12, marginBottom: 8,
                opacity: isDragging ? 0.4 : 1,
                transition: 'all 0.15s',
                cursor: dragId ? 'grabbing' : 'default',
              }}
            >
              {/* Collapsed header */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '13px 14px' }}>
                {/* Drag handle */}
                <div
                  style={{ cursor: 'grab', color: 'var(--text-tertiary)', fontSize: 16, padding: '0 10px 0 0', userSelect: 'none', flexShrink: 0 }}
                >
                  ⠿
                </div>

                {/* Click area to expand */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : event.id)}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', minWidth: 0 }}
                >
                  <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, fontWeight: 600, color: 'var(--text)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {event.name}
                  </span>
                  <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 12, color: hasTime ? 'var(--text-secondary)' : 'var(--text-tertiary)', whiteSpace: 'nowrap', flexShrink: 0, fontStyle: hasTime ? 'normal' : 'italic' }}>
                    {timeLabel}
                  </span>
                  {anyFlash && (
                    <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: anyFlash === 'saved' ? 'var(--sage)' : 'var(--error)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {anyFlash === 'saved' ? 'Saved ✓' : 'Error'}
                    </span>
                  )}
                  <span style={{ color: 'var(--text-tertiary)', fontSize: 11, flexShrink: 0 }}>{isExpanded ? '▾' : '▸'}</span>
                </div>

                {/* Delete */}
                <button
                  onClick={() => deleteEvent(event.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 18, padding: '0 0 0 12px', lineHeight: 1, flexShrink: 0 }}
                >
                  ×
                </button>
              </div>

              {/* Expanded fields */}
              <div style={{
                maxHeight: isExpanded ? 360 : 0,
                overflow: 'hidden',
                transition: 'max-height 0.2s ease',
              }}>
                <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--border)' }}>
                  {/* Event name */}
                  <div style={{ marginTop: 12, marginBottom: 10 }}>
                    <label style={fieldLabel}>EVENT NAME</label>
                    <input
                      type="text"
                      value={event.name}
                      onChange={(e) => setEvents((prev) => prev.map((ev) => ev.id === event.id ? { ...ev, name: e.target.value } : ev))}
                      onBlur={(e) => updateEvent(event.id, { name: e.target.value }, 'name')}
                      style={{ ...fieldInput, width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Location — prominent */}
                  <div style={{ marginBottom: 10 }}>
                    <label style={fieldLabel}>LOCATION</label>
                    <input
                      type="text"
                      value={event.location ?? ''}
                      onChange={(e) => setEvents((prev) => prev.map((ev) => ev.id === event.id ? { ...ev, location: e.target.value } : ev))}
                      onBlur={(e) => updateEvent(event.id, { location: e.target.value || null }, 'location')}
                      placeholder="e.g. The Grand Ballroom, Hyde Park"
                      style={{ ...fieldInput, width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Time selects */}
                  <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                    <div style={{ flex: 1 }}>
                      <label style={fieldLabel}>START TIME</label>
                      <TimePicker
                        value={event.start_time ?? ''}
                        onChange={(v) => handleStartTimeChange(event.id, v)}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={fieldLabel}>END TIME</label>
                      <TimePicker
                        value={event.end_time ?? ''}
                        onChange={(v) => updateEvent(event.id, { end_time: v || null }, 'end_time')}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label style={fieldLabel}>NOTES (OPTIONAL)</label>
                    <textarea
                      value={event.description ?? ''}
                      onChange={(e) => setEvents((prev) => prev.map((ev) => ev.id === event.id ? { ...ev, description: e.target.value } : ev))}
                      onBlur={(e) => updateEvent(event.id, { description: e.target.value || null }, 'description')}
                      placeholder="Any extra details for guests…"
                      rows={2}
                      style={{ ...fieldInput, width: '100%', resize: 'vertical', fontFamily: 'var(--font-montserrat)', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add custom event */}
        <button
          onClick={addCustomEvent}
          disabled={adding}
          style={{
            width: '100%', marginTop: 4, padding: '11px', borderRadius: 10,
            border: '1px dashed var(--border)', background: 'transparent',
            color: 'var(--text-tertiary)', fontFamily: 'var(--font-montserrat)',
            fontSize: 13, fontWeight: 600, cursor: adding ? 'not-allowed' : 'pointer',
            opacity: adding ? 0.5 : 1, transition: 'all 0.15s',
          }}
        >
          + Add Custom Event
        </button>
      </div>

      {/* Live preview */}
      <div style={{
        background: '#FAFAF7', border: '1px solid var(--border)', borderRadius: 12,
        padding: '24px 20px', position: 'sticky', top: 80,
      }}>
        <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 10, letterSpacing: '1px', color: 'var(--text-tertiary)', margin: '0 0 20px', textTransform: 'uppercase' }}>
          Preview
        </p>
        {previewEvents.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', margin: '24px 0' }}>
            Add events to see a preview
          </p>
        ) : (
          <ItineraryTimeline events={previewEvents as Event[]} />
        )}
      </div>
    </div>
  );
}

function parseTimeInput(raw: string): string | null {
  const cleaned = raw.trim().toLowerCase().replace(/[.\s]/g, '');
  // Match patterns like "2pm", "2:30pm", "14:30", "230pm", "1430"
  const match = cleaned.match(/^(\d{1,2}):?(\d{2})?\s*(am|pm)?$/);
  if (!match) return null;
  let h = parseInt(match[1]);
  const m = parseInt(match[2] ?? '0');
  const meridian = match[3];
  if (meridian === 'pm' && h < 12) h += 12;
  if (meridian === 'am' && h === 12) h = 0;
  if (h > 23 || m > 59) return null;
  // Snap to nearest 30min
  const snapped = m < 15 ? 0 : m < 45 ? 30 : 0;
  const finalH = m >= 45 ? (h + 1) % 24 : h;
  return `${String(finalH).padStart(2, '0')}:${String(snapped).padStart(2, '0')}`;
}

function TimePicker({ value, onChange, placeholder = '— Select —' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const [typing, setTyping] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Derive current AM/PM from value
  const currentH = value ? parseInt(value.split(':')[0]) : -1;
  const isPM = currentH >= 12;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setTyping('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (open && listRef.current && value) {
      const idx = TIME_OPTIONS.findIndex((o) => o.value === value);
      if (idx >= 0) listRef.current.scrollTop = idx * 34 - 34;
    }
  }, [open, value]);

  function toggleMeridian() {
    if (!value) return;
    const [h, m] = value.split(':').map(Number);
    const newH = h >= 12 ? h - 12 : h + 12;
    onChange(`${String(newH).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }

  const filtered = typing
    ? TIME_OPTIONS.filter((o) => o.label.toLowerCase().replace(/\s/g, '').includes(typing.toLowerCase().replace(/\s/g, '')))
    : TIME_OPTIONS;

  const display = value ? TIME_OPTIONS.find((o) => o.value === value)?.label ?? '' : '';

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (typing) {
        const parsed = parseTimeInput(typing);
        if (parsed) {
          onChange(parsed);
          setOpen(false);
          setTyping('');
          inputRef.current?.blur();
        }
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setTyping('');
      inputRef.current?.blur();
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: 0 }}>
        <input
          ref={inputRef}
          type="text"
          value={open ? typing : display}
          placeholder={placeholder}
          onFocus={() => { setOpen(true); setTyping(''); }}
          onChange={(e) => { setTyping(e.target.value); if (!open) setOpen(true); }}
          onKeyDown={handleKeyDown}
          style={{
            ...fieldInput, flex: 1, boxSizing: 'border-box',
            borderRadius: '7px 0 0 7px', borderRight: 'none',
            color: open ? 'var(--text)' : (value ? 'var(--text)' : 'var(--text-tertiary)'),
          }}
        />
        <button
          type="button"
          onClick={toggleMeridian}
          disabled={!value}
          style={{
            fontFamily: 'var(--font-montserrat)', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.5px', padding: '0 10px',
            border: '1px solid var(--border)', borderLeft: 'none',
            borderRadius: '0 7px 7px 0', cursor: value ? 'pointer' : 'default',
            background: value ? 'var(--sage-dim)' : 'var(--surface-alt)',
            color: value ? 'var(--sage)' : 'var(--text-tertiary)',
            transition: 'all 0.15s', whiteSpace: 'nowrap',
          }}
        >
          {value ? (isPM ? 'PM' : 'AM') : '—'}
        </button>
      </div>
      {open && (
        <div
          ref={listRef}
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 8, marginTop: 4, maxHeight: 136, overflowY: 'auto',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          {value && !typing && (
            <div
              onClick={() => { onChange(''); setOpen(false); setTyping(''); }}
              style={{
                padding: '8px 12px', cursor: 'pointer',
                fontFamily: 'var(--font-montserrat)', fontSize: 13,
                color: 'var(--text-tertiary)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--sage-dim)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              Clear
            </div>
          )}
          {filtered.length === 0 ? (
            <div style={{ padding: '8px 12px', fontFamily: 'var(--font-montserrat)', fontSize: 12, color: 'var(--text-tertiary)' }}>
              Press Enter to set &quot;{typing}&quot;
            </div>
          ) : filtered.map((o) => (
            <div
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); setTyping(''); }}
              style={{
                padding: '8px 12px', cursor: 'pointer',
                fontFamily: 'var(--font-montserrat)', fontSize: 13,
                color: o.value === value ? 'var(--sage)' : 'var(--text)',
                fontWeight: o.value === value ? 600 : 400,
                background: o.value === value ? 'var(--sage-dim)' : 'transparent',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--sage-dim)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = o.value === value ? 'var(--sage-dim)' : 'transparent')}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const fieldInput: React.CSSProperties = {
  padding: '8px 10px', borderRadius: 7, border: '1px solid var(--border)',
  background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-montserrat)',
  fontSize: 13, outline: 'none',
};

const fieldLabel: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-montserrat)', fontSize: 10,
  fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.5px',
  marginBottom: 5,
};
