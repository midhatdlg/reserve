'use client';

import { useEffect, useState } from 'react';
import { StepLaunch } from '@/components/setup/StepLaunch';
import { isValidTimeZone } from '@/lib/timezone';
import {
  slugFromNames,
  type WizardState,
} from '@/lib/setup-wizard';

// ── Types / helpers live in lib/setup-wizard (Next page files may only export the page) ─

const COMMON_TIMEZONES = [
  'UTC',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Tokyo',
  'Australia/Sydney',
] as const;

const INCLUDED_SECTIONS = [
  { id: 'rsvp', label: 'RSVP' },
  { id: 'itinerary', label: 'Itinerary' },
  { id: 'table', label: 'Tables' },
  { id: 'qna', label: 'Q&A' },
  { id: 'countdown', label: 'Countdown' },
];

const SAGE = '#2C3A2E';
const BRONZE = '#8B7355';
const CREAM = '#F5F0E8';
const CARD = '#FEFCF9';
const INK = '#1F2A22';

// ── Helpers ───────────────────────────────────────────────────────────────────

function detectTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && isValidTimeZone(tz)) return tz;
  } catch {
    /* ignore */
  }
  return 'Europe/London';
}

function formatPreviewDate(iso: string): string {
  if (!iso) return 'Your wedding date';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return 'Your wedding date';
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

// ── Wizard shell ──────────────────────────────────────────────────────────────

export default function SetupPage() {
  const [step, setStep] = useState(1);
  const [slugTouched, setSlugTouched] = useState(false);
  const [state, setState] = useState<WizardState>({
    name1: '',
    name2: '',
    weddingDate: '',
    venueName: '',
    venueAddress: '',
    timezone: 'Europe/London',
    slug: '',
  });

  useEffect(() => {
    setState((s) => (s.timezone === 'Europe/London' ? { ...s, timezone: detectTimezone() } : s));
  }, []);

  function update(partial: Partial<WizardState>) {
    setState((s) => {
      const next = { ...s, ...partial };
      if (!slugTouched && ('name1' in partial || 'name2' in partial)) {
        next.slug = slugFromNames(next.name1, next.name2);
      }
      return next;
    });
  }

  const timezoneValid = isValidTimeZone(state.timezone);
  const canContinue =
    Boolean(state.name1.trim() && state.name2.trim() && state.weddingDate) &&
    timezoneValid &&
    Boolean(state.slug.trim());

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  return (
    <div style={{
      minHeight: '100vh',
      background: CREAM,
      color: '#2C2C2C',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          background: [
            'radial-gradient(circle 520px at 18% 20%, rgba(44,58,46,0.06) 0%, transparent 55%)',
            'radial-gradient(circle 420px at 85% 75%, rgba(139,115,85,0.05) 0%, transparent 50%)',
          ].join(', '),
        }}
      />

      <header style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '28px 28px 0',
        maxWidth: 1080,
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}>
        <span style={{
          fontFamily: 'var(--font-yeseva)',
          fontSize: 22,
          fontStyle: 'italic',
          fontWeight: 500,
          color: INK,
          letterSpacing: '-0.02em',
        }}>
          Reserve
        </span>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontFamily: 'var(--font-montserrat)',
          fontSize: 11,
          letterSpacing: '0.4px',
        }}>
          {[
            { n: 1, label: 'Details' },
            { n: 2, label: 'Launch' },
          ].map((s, i) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {i > 0 && (
                <div style={{
                  width: 18,
                  height: 2,
                  background: step > 1 ? SAGE : 'rgba(31,42,34,0.15)',
                  borderRadius: 99,
                }} />
              )}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '6px 12px 6px 6px',
                borderRadius: 20,
                background: step === s.n ? 'rgba(255,255,255,0.55)' : 'transparent',
                border: step === s.n ? '1px solid rgba(31,42,34,0.1)' : '1px solid transparent',
              }}>
                <span style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: step >= s.n ? SAGE : 'rgba(31,42,34,0.1)',
                  color: step >= s.n ? '#F5F0E8' : INK,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 700,
                }}>
                  {s.n}
                </span>
                <span style={{
                  color: step === s.n ? INK : 'rgba(31,42,34,0.5)',
                  fontWeight: step === s.n ? 600 : 500,
                }}>
                  {s.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </header>

      <main style={{
        position: 'relative',
        zIndex: 1,
        flex: 1,
        width: '100%',
        maxWidth: 1080,
        margin: '0 auto',
        padding: '36px 28px 64px',
        boxSizing: 'border-box',
      }}>
        {step === 1 && (
          <StepDetails
            state={state}
            update={update}
            timezoneValid={timezoneValid}
            appUrl={appUrl}
            canContinue={canContinue}
            onSlugEdit={(value) => {
              setSlugTouched(true);
              update({
                slug: value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]+/g, '-')
                  .replace(/-+/g, '-'),
              });
            }}
            onLaunch={() => setStep(2)}
          />
        )}
        {step === 2 && <StepLaunch state={state} />}
      </main>
    </div>
  );
}

// ── Step 1: Couple + wedding context ──────────────────────────────────────────

function StepDetails({
  state,
  update,
  timezoneValid,
  appUrl,
  canContinue,
  onSlugEdit,
  onLaunch,
}: {
  state: WizardState;
  update: (p: Partial<WizardState>) => void;
  timezoneValid: boolean;
  appUrl: string;
  canContinue: boolean;
  onSlugEdit: (value: string) => void;
  onLaunch: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.15fr) minmax(260px, 0.85fr)',
        gap: 40,
        alignItems: 'start',
      }}
        className="setup-details-grid"
      >
        <style>{`
          @media (max-width: 820px) {
            .setup-details-grid { grid-template-columns: 1fr !important; }
            .setup-preview { order: -1; }
          }
        `}</style>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              background: 'rgba(255,255,255,0.55)',
              border: '1px solid rgba(31,42,34,0.12)',
              borderRadius: 100,
              marginBottom: 14,
              fontFamily: 'var(--font-montserrat)',
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: 0.5,
              color: 'rgba(31,42,34,0.75)',
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: BRONZE,
              }} />
              Getting started
            </div>
            <h1 style={{
              fontFamily: 'var(--font-yeseva)',
              fontSize: 'clamp(32px, 5vw, 44px)',
              fontWeight: 500,
              color: INK,
              margin: '0 0 10px',
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
            }}>
              Your wedding page
            </h1>
            <p style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 20,
              color: 'rgba(31,42,34,0.7)',
              margin: 0,
              lineHeight: 1.45,
            }}>
              A few details now — guests, design, and meals can wait for the dashboard.
            </p>
          </div>

          <div style={{
            background: 'rgba(254,252,249,0.95)',
            border: '1px solid rgba(44,58,46,0.12)',
            borderLeft: `4px solid ${SAGE}`,
            borderRadius: 14,
            padding: '28px 26px',
            boxShadow: '0 24px 64px rgba(44,58,46,0.12), 0 8px 24px rgba(44,58,46,0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
              <Field
                label="Your name"
                value={state.name1}
                placeholder="Aisha"
                onChange={(v) => update({ name1: v })}
              />
              <span style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 28,
                fontStyle: 'italic',
                color: SAGE,
                paddingBottom: 8,
                flexShrink: 0,
              }}>
                &
              </span>
              <Field
                label="Partner's name"
                value={state.name2}
                placeholder="Omar"
                onChange={(v) => update({ name2: v })}
              />
            </div>

            <Field
              label="Wedding date"
              type="date"
              value={state.weddingDate}
              onChange={(v) => update({ weddingDate: v })}
            />

            <Field
              label="Venue name"
              value={state.venueName}
              placeholder="The Grand Hall"
              onChange={(v) => update({ venueName: v })}
              optional
            />

            <Field
              label="Venue address"
              value={state.venueAddress}
              placeholder="123 Wedding Lane, London"
              onChange={(v) => update({ venueAddress: v })}
              optional
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label htmlFor="setup-tz" style={labelStyle}>
                TIMEZONE
              </label>
              <input
                id="setup-tz"
                list="setup-tz-options"
                value={state.timezone}
                onChange={(e) => update({ timezone: e.target.value })}
                placeholder="Europe/London"
                style={{
                  ...inputStyle,
                  borderColor: timezoneValid ? 'rgba(212,207,198,0.9)' : '#C4564A',
                }}
                aria-invalid={!timezoneValid}
              />
              <datalist id="setup-tz-options">
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz} value={tz} />
                ))}
              </datalist>
              <p style={{
                fontFamily: 'var(--font-montserrat)',
                fontSize: 11,
                color: timezoneValid ? '#9E9890' : '#C4564A',
                margin: '2px 0 0',
              }}>
                {timezoneValid
                  ? 'Used for the countdown and calendar invite.'
                  : 'Use a valid IANA timezone (e.g. Europe/London).'}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label htmlFor="setup-slug" style={labelStyle}>
                INVITE URL
              </label>
              <div style={{ display: 'flex', alignItems: 'stretch' }}>
                <span style={{
                  fontFamily: 'var(--font-montserrat)',
                  fontSize: 12,
                  color: SAGE,
                  padding: '10px 12px',
                  background: 'rgba(44,58,46,0.08)',
                  border: '1px solid rgba(44,58,46,0.15)',
                  borderRight: 'none',
                  borderRadius: '8px 0 0 8px',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 500,
                }}>
                  {appUrl.replace(/^https?:\/\//, '')}/invite/
                </span>
                <input
                  id="setup-slug"
                  value={state.slug}
                  onChange={(e) => onSlugEdit(e.target.value)}
                  placeholder="aisha-and-omar"
                  style={{
                    ...inputStyle,
                    borderRadius: '0 8px 8px 0',
                    flex: 1,
                  }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={!canContinue}
            onClick={onLaunch}
            style={{
              alignSelf: 'flex-start',
              background: SAGE,
              color: '#F5F0E8',
              border: 'none',
              borderRadius: 22,
              padding: '13px 28px',
              fontFamily: 'var(--font-montserrat)',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.2px',
              cursor: canContinue ? 'pointer' : 'not-allowed',
              opacity: canContinue ? 1 : 0.45,
              boxShadow: canContinue ? '0 12px 28px rgba(44,58,46,0.22)' : 'none',
            }}
          >
            Create my page →
          </button>
        </div>

        <aside className="setup-preview" style={{
          position: 'sticky',
          top: 28,
          alignSelf: 'start',
        }}>
          <InvitePreview state={state} />
        </aside>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.45)',
        border: '1px solid rgba(31,42,34,0.1)',
        borderRadius: 14,
        padding: '26px 28px',
      }}>
        <p style={{
          fontFamily: 'var(--font-montserrat)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '2px',
          color: BRONZE,
          margin: '0 0 14px',
          textTransform: 'uppercase',
        }}>
          Included to start
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {INCLUDED_SECTIONS.map((s) => (
            <span
              key={s.id}
              style={{
                fontFamily: 'var(--font-montserrat)',
                fontSize: 12,
                color: SAGE,
                background: 'rgba(44,58,46,0.08)',
                borderRadius: 20,
                padding: '7px 13px',
              }}
            >
              {s.label}
            </span>
          ))}
        </div>
        <p style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: 18,
          color: 'rgba(31,42,34,0.7)',
          margin: 0,
          lineHeight: 1.4,
        }}>
          Add guests, tweak sections, and refine the look anytime in your dashboard.
        </p>
      </div>
    </div>
  );
}

function InvitePreview({ state }: { state: WizardState }) {
  const n1 = state.name1.trim() || 'Your name';
  const n2 = state.name2.trim() || 'Partner';
  const venue = state.venueName.trim();

  const initials = `${(state.name1.trim()[0] ?? 'Y').toUpperCase()}&${(state.name2.trim()[0] ?? 'P').toUpperCase()}`;

  return (
    <div style={{
      background: CARD,
      borderRadius: 6,
      border: '1px solid rgba(44,58,46,0.12)',
      boxShadow: '0 40px 100px rgba(44,58,46,0.2), 0 16px 40px rgba(44,58,46,0.1)',
      overflow: 'hidden',
      minHeight: 420,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        height: 8,
        background: `linear-gradient(90deg, ${SAGE}, #4A5E4C 55%, ${BRONZE})`,
      }} />
      <div style={{
        padding: '40px 32px 36px',
        textAlign: 'center',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${SAGE}, #4A5E4C)`,
        color: '#F5F0E8',
        fontFamily: 'var(--font-yeseva)',
        fontStyle: 'italic',
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        boxShadow: '0 8px 20px rgba(44,58,46,0.28)',
      }}>
        {initials}
      </div>
      <div style={{
        fontFamily: 'var(--font-montserrat)',
        fontSize: 9,
        letterSpacing: '4px',
        color: SAGE,
        textTransform: 'uppercase',
        marginBottom: 16,
      }}>
        You are invited
      </div>

      <div style={{
        fontFamily: 'var(--font-yeseva)',
        fontSize: 'clamp(28px, 4vw, 36px)',
        color: SAGE,
        lineHeight: 1.05,
      }}>
        {n1}
      </div>
      <div style={{
        fontFamily: 'var(--font-cormorant)',
        fontStyle: 'italic',
        fontSize: 22,
        color: BRONZE,
        margin: '4px 0',
      }}>
        &
      </div>
      <div style={{
        fontFamily: 'var(--font-yeseva)',
        fontSize: 'clamp(28px, 4vw, 36px)',
        color: SAGE,
        lineHeight: 1.05,
        marginBottom: 28,
      }}>
        {n2}
      </div>

      <div style={{
        width: 40,
        height: 2,
        background: 'rgba(44,58,46,0.35)',
        marginBottom: 20,
      }} />

      <div style={{
        fontFamily: 'var(--font-montserrat)',
        fontSize: 12,
        color: '#6B6560',
        letterSpacing: '0.3px',
      }}>
        {formatPreviewDate(state.weddingDate)}
      </div>
      {venue && (
        <div style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: 18,
          color: '#2C2C2C',
          marginTop: 6,
        }}>
          {venue}
        </div>
      )}
      {state.venueAddress.trim() && (
        <div style={{
          fontFamily: 'var(--font-montserrat)',
          fontSize: 11,
          color: '#9E9890',
          marginTop: 4,
          maxWidth: 220,
          lineHeight: 1.45,
        }}>
          {state.venueAddress.trim()}
        </div>
      )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  optional,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  optional?: boolean;
}) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
      <label style={labelStyle}>
        {label.toUpperCase()}
        {optional ? (
          <span style={{ fontWeight: 400, color: '#9E9890', letterSpacing: '0.2px' }}> · optional</span>
        ) : null}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-montserrat)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.5px',
  color: '#6B6560',
};

const inputStyle: React.CSSProperties = {
  padding: '11px 12px',
  borderRadius: 8,
  border: '1px solid rgba(212,207,198,0.9)',
  background: CREAM,
  color: '#2C2C2C',
  fontFamily: 'var(--font-montserrat)',
  fontSize: 14,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};
