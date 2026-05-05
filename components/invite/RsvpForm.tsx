'use client';

import { useState } from 'react';
import type { Invite, Rsvp } from '@/types';
import type { TemplateTheme } from '@/lib/template-theme';

interface GuestSlot {
  person_name: string;
  attending: boolean | null;
  meal_preference: string;
  dietary_notes: string;
}

interface Props {
  invite: Invite;
  existingRsvps: Rsvp[];
  slug: string;
  mealOptions?: string[];
  theme?: Partial<TemplateTheme>;
}

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

/* ── Fallback tokens (matches handoff editorial style) ─────────────── */
const FALLBACK = {
  pageBg: '#FFFFFF',
  displayFont: '"Cormorant Garamond", Georgia, serif',
  bodyFont: '"Montserrat", system-ui, sans-serif',
  ink: '#1A1A1A',
  ink2: '#4B4B4B',
  ink3: '#8A8478',
  ruleSoft: 'rgba(26,26,26,0.10)',
  primary: '#1A1A1A',
  primaryMuted: 'rgba(26,26,26,0.18)',
  primaryContrast: '#FFFFFF',
  accent: '#8A8478',
  cardBg: '#FFFFFF',
  border: 'rgba(26,26,26,0.10)',
  surfaceTint: 'rgba(26,26,26,0.03)',
  danger: '#C4564A',
};

/* ── Component ─────────────────────────────────────────────────────── */

export function RsvpForm({ invite, existingRsvps, slug, mealOptions = [], theme: themeProp }: Props) {
  const t = { ...FALLBACK, ...themeProp };

  const [slots, setSlots] = useState<GuestSlot[]>(() => makeSlots(invite, existingRsvps));
  const [step, setStep] = useState<'names' | 'rsvp'>(() => (existingRsvps.length > 0 ? 'rsvp' : 'names'));
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
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

      setStatus('success');
      window.location.href = `/invite/${slug}`;
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  }

  /* ── Shared inline styles ── */

  const eyebrow: React.CSSProperties = {
    fontFamily: t.bodyFont,
    fontSize: 10,
    letterSpacing: '0.36em',
    fontWeight: 500,
    textTransform: 'uppercase',
    color: t.ink3,
    margin: 0,
  };

  const hairline: React.CSSProperties = {
    width: '100%',
    height: 1,
    background: t.ruleSoft,
    border: 'none',
    margin: 0,
  };

  const pillCta = (enabled: boolean): React.CSSProperties => ({
    display: 'inline-block',
    width: '100%',
    background: enabled ? t.ink : t.primaryMuted,
    color: enabled ? t.primaryContrast : t.ink3,
    fontFamily: t.bodyFont,
    fontSize: 11,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    fontWeight: 500,
    padding: '16px 28px',
    borderRadius: 32,
    border: 'none',
    cursor: enabled ? 'pointer' : 'not-allowed',
    transition: 'opacity 0.15s',
    textAlign: 'center',
  });

  // ── Success (brief flash while page redirects) ──────────────
  if (status === 'success') {
    return (
      <div role="status" aria-live="polite" style={{ textAlign: 'center', padding: '36px 0' }}>
        <p style={{ fontFamily: t.displayFont, fontSize: 22, fontWeight: 500, color: t.ink, margin: 0 }}>
          Response saved
        </p>
      </div>
    );
  }

  // ── Step 1: Names ───────────────────────────────────────────────────
  if (step === 'names') {
    return (
      <form
        aria-labelledby="rsvp-names-heading"
        onSubmit={(e) => { e.preventDefault(); if (allNamed) setStep('rsvp'); }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        {/* Eyebrow + headline */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p id="rsvp-names-heading" style={{ ...eyebrow, marginBottom: 14 }}>
            RSVP
          </p>
          <h2 style={{
            fontFamily: t.displayFont,
            fontWeight: 400,
            fontSize: 'clamp(26px, 5vw, 36px)',
            lineHeight: 1.2,
            color: t.ink,
            margin: '0 0 8px',
          }}>
            {alreadyResponded ? 'Update your response' : <>The favour of a reply</>}
          </h2>
          {!alreadyResponded && (
            <p style={{
              fontFamily: t.displayFont,
              fontStyle: 'italic',
              fontSize: 17,
              lineHeight: 1.45,
              color: t.ink2,
              margin: 0,
            }}>
              is requested
            </p>
          )}
        </div>

        {/* Rule */}
        <div style={{ width: 60, height: 1, background: t.ink, opacity: 0.4, marginBottom: 32 }} />

        {/* Name inputs */}
        <div style={{ width: '100%', marginBottom: 24 }}>
          {slots.map((slot, i) => {
            const inputId = `rsvp-name-${i}`;
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '16px 0',
                  borderBottom: `1px solid ${t.ruleSoft}`,
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
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    fontFamily: t.displayFont,
                    fontSize: 22,
                    fontWeight: 500,
                    color: t.ink,
                    outline: 'none',
                    padding: 0,
                    boxSizing: 'border-box',
                  }}
                />
                {invite.max_guests > 1 && (
                  <span
                    aria-hidden="true"
                    style={{
                      fontFamily: t.bodyFont,
                      fontSize: 10,
                      letterSpacing: '0.22em',
                      fontWeight: 500,
                      color: t.ink3,
                      flexShrink: 0,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                )}
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => removeSlot(i)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: t.ink3,
                      fontSize: 18,
                      padding: 0,
                      lineHeight: 1,
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

        {/* Add guest link */}
        {canAddMore && (
          <button
            type="button"
            onClick={addSlot}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: t.displayFont,
              fontStyle: 'italic',
              fontSize: 13,
              color: t.ink2,
              textDecoration: 'underline',
              textUnderlineOffset: 4,
              marginBottom: 28,
              padding: 0,
            }}
          >
            + Add another guest ({slots.length}/{invite.max_guests})
          </button>
        )}

        {/* Continue CTA */}
        <button type="submit" disabled={!allNamed} style={pillCta(allNamed)}>
          CONTINUE
        </button>
      </form>
    );
  }

  // ── Step 2: RSVP details ────────────────────────────────────────────
  return (
    <form
      aria-labelledby="rsvp-step-heading"
      onSubmit={(e) => { e.preventDefault(); void submit(); }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <button
          type="button"
          onClick={() => setStep('names')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: t.displayFont,
            fontStyle: 'italic',
            fontSize: 13,
            color: t.ink3,
            textDecoration: 'underline',
            textUnderlineOffset: 4,
            marginBottom: 20,
            padding: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          ← Edit names
        </button>
        <p
          id="rsvp-step-heading"
          style={{
            fontFamily: t.displayFont,
            fontStyle: 'italic',
            fontSize: 17,
            lineHeight: 1.45,
            color: t.ink2,
            margin: 0,
          }}
        >
          Will you be joining us?
        </p>
      </div>

      {/* Guest slots */}
      <div style={{ width: '100%', marginBottom: 28 }}>
        {slots.map((slot, i) => {
          const attGroupId = `rsvp-att-${i}`;
          const dietId = `rsvp-diet-${i}`;
          return (
            <div
              key={i}
              style={{
                padding: '28px 0',
                borderTop: i > 0 ? `1px solid ${t.ruleSoft}` : undefined,
              }}
            >
              <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                <legend style={srOnly}>RSVP for {slot.person_name || `guest ${i + 1}`}</legend>

                {/* Guest name */}
                <p style={{
                  fontFamily: t.displayFont,
                  fontSize: 22,
                  fontWeight: 500,
                  lineHeight: 1.3,
                  color: t.ink,
                  margin: '0 0 18px',
                  textAlign: 'center',
                }}>
                  {slot.person_name}
                </p>

                {/* Accept / Decline */}
                <div
                  role="group"
                  aria-labelledby={attGroupId}
                  style={{
                    display: 'flex',
                    gap: 10,
                    marginBottom: slot.attending ? 20 : 0,
                  }}
                >
                  <span id={attGroupId} style={srOnly}>Attendance for {slot.person_name}</span>
                  {[
                    { value: true, label: 'Joyfully accepts' },
                    { value: false, label: 'Regretfully declines' },
                  ].map(({ value, label }) => {
                    const isSelected = slot.attending === value;
                    const isAccept = value === true;
                    return (
                      <button
                        key={String(value)}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => updateSlot(i, { attending: value })}
                        style={{
                          flex: 1,
                          padding: '12px 8px',
                          borderRadius: 32,
                          border: `1px solid ${
                            isSelected
                              ? isAccept ? t.ink : t.danger
                              : t.ruleSoft
                          }`,
                          background: isSelected && isAccept ? t.ink : 'transparent',
                          fontFamily: t.displayFont,
                          fontSize: 14,
                          fontStyle: 'italic',
                          fontWeight: 400,
                          color: isSelected
                            ? isAccept ? t.pageBg : t.danger
                            : t.ink3,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* Meal options */}
                {slot.attending && mealOptions.length > 0 && (
                  <div
                    role="group"
                    aria-label={`Meal preference for ${slot.person_name}`}
                    style={{
                      display: 'flex',
                      gap: 8,
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      marginBottom: 14,
                    }}
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
                            padding: '8px 16px',
                            borderRadius: 32,
                            border: `1px solid ${isSelected ? t.ink : t.ruleSoft}`,
                            background: 'transparent',
                            fontFamily: t.displayFont,
                            fontSize: 13,
                            fontWeight: 500,
                            color: isSelected ? t.ink : t.ink3,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Dietary notes */}
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
                        width: '100%',
                        border: 'none',
                        borderBottom: `1px solid ${t.ruleSoft}`,
                        background: 'transparent',
                        fontFamily: t.displayFont,
                        fontStyle: 'italic',
                        fontSize: 14,
                        color: t.ink,
                        outline: 'none',
                        padding: '10px 0',
                        boxSizing: 'border-box',
                        textAlign: 'center',
                      }}
                    />
                  </>
                )}
              </fieldset>
            </div>
          );
        })}
      </div>

      {/* Hairline before CTA */}
      <div style={hairline} />

      {/* Error */}
      {status === 'error' && (
        <p
          role="alert"
          style={{
            fontFamily: t.displayFont,
            fontStyle: 'italic',
            fontSize: 14,
            color: t.danger,
            textAlign: 'center',
            margin: '16px 0 0',
          }}
        >
          {errorMsg}
        </p>
      )}

      {/* Submit CTA */}
      <div style={{ width: '100%', paddingTop: 28 }}>
        <button
          type="submit"
          disabled={!canSubmit || status === 'loading'}
          style={pillCta(canSubmit && status !== 'loading')}
        >
          {status === 'loading' ? 'SENDING...' : 'SEND RESPONSE'}
        </button>
      </div>
    </form>
  );
}

const srOnly: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};
