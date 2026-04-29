'use client';

import { useState } from 'react';
import type { Invite, Rsvp } from '@/types';

interface GuestSlot {
  person_name: string;
  attending: boolean | null;
  meal_preference: string;
  dietary_notes: string;
}

interface Props {
  invite: Invite;
  existingRsvps: Rsvp[];
  /** Wedding slug — used to link back to the .ics download after success. */
  slug: string;
  mealOptions?: string[];
}

/**
 * Build the initial slot list. Rules:
 *   - If the guest already has RSVPs, reuse them verbatim (so "change my
 *     response" keeps their previous choices).
 *   - Otherwise, default to `max_guests` slots so every reserved seat is
 *     visible without the guest hunting for a "+" button. The first slot
 *     prefills with the invite's guest_name; the rest are blank for plus-ones.
 */
function makeSlots(invite: Invite, existing: Rsvp[]): GuestSlot[] {
  if (existing.length > 0) {
    return existing.map((ex) => ({
      person_name: ex.person_name,
      attending: ex.attending,
      meal_preference: ex.meal_preference ?? '',
      dietary_notes: ex.dietary_notes ?? '',
    }));
  }
  const count = Math.max(1, invite.max_guests);
  return Array.from({ length: count }, (_, i) => ({
    person_name: i === 0 ? invite.guest_name : '',
    attending: null,
    meal_preference: '',
    dietary_notes: '',
  }));
}

const numberWords = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

export function RsvpForm({ invite, existingRsvps, slug, mealOptions = [] }: Props) {
  const [slots, setSlots] = useState<GuestSlot[]>(() => makeSlots(invite, existingRsvps));
  const [step, setStep] = useState<'names' | 'rsvp'>(() => (existingRsvps.length > 0 ? 'rsvp' : 'names'));
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [tableNumber, setTableNumber] = useState<number | null>(invite.table_number);
  const [tableName, setTableName] = useState<string | null>(invite.table_name);
  const [errorMsg, setErrorMsg] = useState('');

  const alreadyResponded = existingRsvps.length > 0;

  function updateSlot(i: number, patch: Partial<GuestSlot>) {
    setSlots((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  function addSlot() {
    setSlots((prev) => [...prev, { person_name: '', attending: null, meal_preference: '', dietary_notes: '' }]);
  }

  function removeSlot(i: number) {
    setSlots((prev) => prev.filter((_, idx) => idx !== i));
  }

  const canAddMore = slots.length < invite.max_guests;
  const allNamed = slots.every((s) => s.person_name.trim());
  const canSubmit = slots.every((s) => s.person_name.trim() && s.attending !== null);

  async function submit() {
    if (!canSubmit) return;
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guests: slots.map((s) => ({
            person_name: s.person_name.trim(),
            attending: s.attending,
            meal_preference: s.attending ? s.meal_preference || undefined : undefined,
            dietary_notes: s.attending && s.dietary_notes ? s.dietary_notes : undefined,
          })),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Submission failed');

      setTableNumber(data.table_number);
      setTableName(data.table_name);
      setStatus('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  }

  // ── Success state ────────────────────────────────────────────────────
  if (status === 'success') {
    const attending = slots.filter((s) => s.attending);
    const declining = slots.filter((s) => !s.attending);

    return (
      <div role="status" aria-live="polite" style={{ textAlign: 'center', padding: '8px 0' }}>
        <h3 style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 24, fontWeight: 400, color: '#2C2C2C',
          margin: '0 0 8px',
        }}>
          {attending.length > 0 ? 'See you there' : 'We\'ll miss you'}
        </h3>
        <p style={{
          fontFamily: 'var(--font-caslon, Libre Caslon Text), Georgia, serif',
          fontSize: 15, fontStyle: 'italic', color: '#6B6560',
          margin: '0 0 20px', lineHeight: 1.6,
        }}>
          {attending.length > 0 && (
            <>{attending.map((s) => s.person_name).join(', ')} {attending.length === 1 ? 'is' : 'are'} confirmed.</>
          )}
          {declining.length > 0 && attending.length > 0 && ' '}
          {declining.length > 0 && (
            <>{declining.map((s) => s.person_name).join(', ')} {declining.length === 1 ? 'is' : 'are'} unable to attend.</>
          )}
        </p>

        {tableNumber && (
          <div style={{
            background: 'rgba(44,58,46,0.04)', border: '1px solid #D4CFC6',
            borderRadius: 10, padding: '16px 20px', marginBottom: 16,
          }}>
            <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 11, letterSpacing: '2px', color: '#9E9890', margin: '0 0 4px', textTransform: 'uppercase' }}>
              Your Table
            </p>
            <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 32, color: '#2C2C2C', margin: 0 }}>
              {tableNumber}
            </p>
            {tableName && (
              <p style={{ fontFamily: 'var(--font-caslon, Libre Caslon Text), Georgia, serif', fontSize: 14, color: '#2C2C2C', margin: '4px 0 0', fontStyle: 'italic' }}>
                {tableName}
              </p>
            )}
          </div>
        )}

        {attending.length > 0 && (
          <a
            href={`/api/invite/${encodeURIComponent(slug)}/calendar`}
            style={{
              display: 'inline-block', padding: '10px 20px', borderRadius: 6,
              border: '1px solid #2C3A2E', background: 'transparent', color: '#2C3A2E',
              fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 13,
              letterSpacing: '1.5px', textTransform: 'uppercase', textDecoration: 'none',
              marginBottom: 16,
            }}
          >
            + Add to Calendar
          </a>
        )}

        <div style={{ marginTop: attending.length > 0 ? 8 : 0 }}>
          <button
            type="button"
            onClick={() => { setStatus('idle'); setStep('names'); }}
            style={{
              background: 'none', border: 'none',
              fontFamily: 'var(--font-caslon, Libre Caslon Text), Georgia, serif',
              fontSize: 13, fontStyle: 'italic', color: '#9E9890', cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Change my response
          </button>
        </div>
      </div>
    );
  }

  // ── Step 1: Names ─────────────────────────────────────────────────────
  if (step === 'names') {
    return (
      <form
        aria-labelledby="rsvp-names-heading"
        onSubmit={(e) => { e.preventDefault(); if (allNamed) setStep('rsvp'); }}
        style={{ display: 'flex', flexDirection: 'column', gap: 0 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <p
            id="rsvp-names-heading"
            style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: 11, letterSpacing: '3px', color: '#8B7355',
              textTransform: 'uppercase', margin: '0 0 6px',
            }}
          >
            {alreadyResponded ? 'Update your response' : 'The favour of a reply'}
          </p>
          <p style={{
            fontFamily: 'var(--font-caslon, Libre Caslon Text), Georgia, serif',
            fontSize: 22, fontStyle: 'italic', color: '#2C2C2C', margin: 0, fontWeight: 400,
          }}>
            is requested
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          {slots.map((slot, i) => {
            const inputId = `rsvp-name-${i}`;
            return (
              <div
                key={i}
                style={{
                  background: '#FFFFFF', border: '1px solid #D4CFC6',
                  borderRadius: 10, padding: '14px 16px',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}
              >
                <label htmlFor={inputId} style={srOnly}>
                  {i === 0 ? 'Your full name' : `Guest ${i + 1} full name`}
                </label>
                <input
                  id={inputId}
                  type="text"
                  autoComplete={i === 0 ? 'name' : 'off'}
                  autoFocus={i === 0}
                  placeholder={i === 0 ? invite.guest_name : `Guest ${i + 1} full name`}
                  value={slot.person_name}
                  onChange={(e) => updateSlot(i, { person_name: e.target.value })}
                  style={{
                    flex: 1, border: 'none', background: 'transparent',
                    fontFamily: 'Cormorant Garamond, Georgia, serif',
                    fontSize: 17, color: '#2C2C2C', outline: 'none',
                    padding: '4px 0', boxSizing: 'border-box',
                  }}
                />
                {invite.max_guests > 1 && (
                  <span aria-hidden="true" style={{
                    fontFamily: 'Cormorant Garamond, Georgia, serif',
                    fontSize: 13, color: '#D4CFC6',
                    border: '1px solid #D4CFC6', borderRadius: 4,
                    padding: '2px 8px', flexShrink: 0,
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                )}
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => removeSlot(i)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#9E9890', fontSize: 18, padding: 0, lineHeight: 1,
                    }}
                    aria-label={`Remove ${slot.person_name || `guest ${i + 1}`}`}
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {invite.max_guests > 1 && (
          <p style={{
            fontFamily: 'var(--font-caslon, Libre Caslon Text), Georgia, serif',
            fontSize: 14, fontStyle: 'italic', color: '#6B6560',
            textAlign: 'center', margin: '0 0 16px',
          }}>
            Seated at a table of {numberWords[invite.max_guests] ?? invite.max_guests}
          </p>
        )}

        {canAddMore && (
          <button
            type="button"
            onClick={addSlot}
            style={{
              width: '100%', padding: '12px', borderRadius: 8,
              border: '1px dashed #D4CFC6', background: 'transparent',
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: 14, color: '#6B6560',
              cursor: 'pointer', marginBottom: 16,
            }}
          >
            + Add another guest ({slots.length}/{invite.max_guests})
          </button>
        )}

        <button
          type="submit"
          disabled={!allNamed}
          style={{
            width: '100%', padding: '14px', borderRadius: 6, border: 'none',
            background: allNamed ? '#2C3A2E' : 'rgba(44,58,46,0.2)',
            color: '#F2F0EC',
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: 15, letterSpacing: '2px', textTransform: 'uppercase',
            cursor: allNamed ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s',
          }}
        >
          Continue
        </button>
      </form>
    );
  }

  // ── Step 2: RSVP details ──────────────────────────────────────────────
  return (
    <form
      aria-labelledby="rsvp-step-heading"
      onSubmit={(e) => { e.preventDefault(); void submit(); }}
      style={{ display: 'flex', flexDirection: 'column', gap: 0 }}
    >
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <button
          type="button"
          onClick={() => setStep('names')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-caslon, Libre Caslon Text), Georgia, serif',
            fontSize: 13, fontStyle: 'italic', color: '#9E9890', marginBottom: 12,
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}
        >
          ← Edit names
        </button>
        <p
          id="rsvp-step-heading"
          style={{
            fontFamily: 'var(--font-caslon, Libre Caslon Text), Georgia, serif',
            fontSize: 16, fontStyle: 'italic', color: '#6B6560', margin: 0,
          }}
        >
          Will you be joining us?
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
        {slots.map((slot, i) => {
          const attGroupId = `rsvp-att-${i}`;
          const dietId = `rsvp-diet-${i}`;
          return (
            <fieldset
              key={i}
              style={{
                background: '#FFFFFF', border: '1px solid #D4CFC6',
                borderRadius: 10, padding: '16px', margin: 0,
              }}
            >
              <legend style={srOnly}>RSVP for {slot.person_name || `guest ${i + 1}`}</legend>
              <p style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontSize: 17, fontWeight: 600, color: '#2C2C2C',
                margin: '0 0 12px',
              }}>
                {slot.person_name}
              </p>

              <div
                role="group"
                aria-labelledby={attGroupId}
                style={{ display: 'flex', gap: 10, marginBottom: slot.attending ? 14 : 0 }}
              >
                <span id={attGroupId} style={srOnly}>Attendance for {slot.person_name}</span>
                {[
                  { value: true,  label: 'Joyfully accepts' },
                  { value: false, label: 'Regretfully declines' },
                ].map(({ value, label }) => {
                  const isSelected = slot.attending === value;
                  return (
                    <button
                      key={String(value)}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => updateSlot(i, { attending: value })}
                      style={{
                        flex: 1, padding: '10px 8px', borderRadius: 6,
                        border: `1px solid ${isSelected ? (value ? '#2C3A2E' : '#C4564A') : '#D4CFC6'}`,
                        background: isSelected && value ? '#2C3A2E' : 'transparent',
                        fontFamily: 'var(--font-caslon, Libre Caslon Text), Georgia, serif',
                        fontSize: 13, fontStyle: 'italic',
                        color: isSelected ? (value ? '#F2F0EC' : '#C4564A') : '#9E9890',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {slot.attending && mealOptions.length > 0 && (
                <div
                  role="group"
                  aria-label={`Meal preference for ${slot.person_name}`}
                  style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
                >
                  {mealOptions.map((opt) => {
                    const value = opt.toLowerCase();
                    const isSelected = slot.meal_preference.toLowerCase() === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => updateSlot(i, { meal_preference: isSelected ? '' : value })}
                        style={{
                          padding: '6px 12px', borderRadius: 20,
                          border: `1px solid ${isSelected ? '#2C3A2E' : '#D4CFC6'}`,
                          background: isSelected ? 'rgba(44,58,46,0.06)' : 'transparent',
                          fontFamily: 'Cormorant Garamond, Georgia, serif',
                          fontSize: 13,
                          color: isSelected ? '#2C3A2E' : '#9E9890',
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {slot.attending && (
                <>
                  <label htmlFor={dietId} style={srOnly}>
                    Allergies or dietary needs for {slot.person_name}
                  </label>
                  <input
                    id={dietId}
                    type="text"
                    placeholder="Allergies or dietary needs..."
                    value={slot.dietary_notes}
                    onChange={(e) => updateSlot(i, { dietary_notes: e.target.value })}
                    style={{
                      width: '100%', border: 'none',
                      borderTop: '1px solid #D4CFC6', background: 'transparent',
                      fontFamily: 'var(--font-caslon, Libre Caslon Text), Georgia, serif',
                      fontSize: 14, fontStyle: 'italic', color: '#2C2C2C', outline: 'none',
                      padding: '10px 0 0', marginTop: 12, boxSizing: 'border-box',
                    }}
                  />
                </>
              )}
            </fieldset>
          );
        })}
      </div>

      {status === 'error' && (
        <p
          role="alert"
          style={{
            fontFamily: 'var(--font-caslon, Libre Caslon Text), Georgia, serif',
            fontSize: 14, fontStyle: 'italic', color: '#C4564A',
            textAlign: 'center', marginBottom: 12,
          }}
        >
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit || status === 'loading'}
        style={{
          width: '100%', padding: '14px', borderRadius: 6, border: 'none',
          background: canSubmit ? '#2C3A2E' : 'rgba(44,58,46,0.2)',
          color: '#F2F0EC',
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 15, letterSpacing: '2px', textTransform: 'uppercase',
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          transition: 'background 0.2s',
        }}
      >
        {status === 'loading' ? 'Sending...' : 'Send Response'}
      </button>
    </form>
  );
}

const srOnly: React.CSSProperties = {
  position: 'absolute',
  width: 1, height: 1, padding: 0, margin: -1,
  overflow: 'hidden', clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap', border: 0,
};
