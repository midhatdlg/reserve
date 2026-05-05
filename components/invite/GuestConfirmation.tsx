import type { Wedding, Invite, Rsvp, Event } from '@/types';
import type { TemplateTheme } from '@/lib/template-theme';
import { INVITE_ROOT_STYLE } from '@/lib/template-theme';

interface Props {
  wedding: Wedding;
  invite: Invite;
  rsvps: Rsvp[];
  events: Event[];
  slug: string;
  theme?: Partial<TemplateTheme>;
}

/* ── Fallback theme (matches handoff defaults) ─────────────────────── */
const FALLBACK: TemplateTheme = {
  pageBg: '#FFFFFF',
  displayFont: '"Cormorant Garamond", Georgia, serif',
  bodyFont: '"Montserrat", system-ui, sans-serif',
  fontsUrl:
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Montserrat:wght@300;400;500;600&display=swap',
  ink: '#1A1A1A',
  ink2: '#4B4B4B',
  ink3: '#8A8478',
  rule: 'rgba(26,26,26,0.18)',
  ruleSoft: 'rgba(26,26,26,0.10)',
  surface: 'rgba(255,255,255,0.8)',
  surfaceBorder: 'rgba(0,0,0,0.1)',
  heroBg: '#1A1A1A',
  heroImgFallback: '#0F0F0F',
  sectionDarkBg: '#1A1A1A',
  textOnDark: '#FFFFFF',
  textOnDarkMuted: 'rgba(255,255,255,0.8)',
  ruleOnDark: 'rgba(255,255,255,0.2)',
  footerBg: '#1A1A1A',
  footerMuted: 'rgba(255,255,255,0.55)',
  footerRule: 'rgba(255,255,255,0.14)',
  photoFilter: 'none',
  placeholderMuted: 'rgba(0,0,0,0.42)',
  placeholderMutedOnDark: 'rgba(255,255,255,0.48)',
  placeholderBorder: '1px dashed rgba(0,0,0,0.22)',
  placeholderBorderOnDark: '1px dashed rgba(255,255,255,0.38)',
  placeholderFill: 'rgba(0,0,0,0.045)',
  placeholderFillOnDark: 'rgba(255,255,255,0.07)',
  primary: '#1A1A1A',
  primaryMuted: 'rgba(26,26,26,0.18)',
  primaryContrast: '#FFFFFF',
  accent: '#8A8478',
  cardBg: '#FFFFFF',
  border: 'rgba(26,26,26,0.10)',
  surfaceTint: 'rgba(0,0,0,0.03)',
  danger: '#C4564A',
};

/* ── Formatting ────────────────────────────────────────────────────── */

function fmtDate(dateStr: string, tz: string): string {
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T12:00:00');
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: tz || 'UTC',
  }).format(d);
}

function fmtTime(timeStr: string, tz: string): string {
  const d = new Date(timeStr);
  return d
    .toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: tz || 'UTC',
    })
    .toUpperCase();
}

/* ── Component ─────────────────────────────────────────────────────── */

export function GuestConfirmation({
  wedding,
  invite,
  rsvps,
  events,
  slug,
  theme: tp,
}: Props) {
  const t: TemplateTheme = { ...FALLBACK, ...tp };

  const attending = rsvps.filter((r) => r.attending);
  const declining = rsvps.filter((r) => !r.attending);
  const anyAttending = attending.length > 0;
  const hasTable = invite.table_number != null;

  const tz = wedding.timezone ?? 'UTC';
  const coupleNames = wedding.title ?? '';
  const tc = wedding.template_content ?? {};
  const venueAddress = wedding.venue_address ?? '';
  const directionsUrl = venueAddress
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(venueAddress)}`
    : null;

  /* ── Inline style helpers (match handoff exactly) ── */

  const eyebrow: React.CSSProperties = {
    fontFamily: t.bodyFont,
    fontSize: 10,
    letterSpacing: '0.36em',
    fontWeight: 500,
    textTransform: 'uppercase',
    color: t.ink3,
    margin: '0 0 14px',
  };

  const rule: React.CSSProperties = {
    width: 60,
    height: 1,
    background: t.ink,
    opacity: 0.4,
    margin: '56px auto 48px',
    border: 'none',
  };

  const row: React.CSSProperties = {
    width: '100%',
    padding: '36px 0',
    borderTop: `1px solid ${t.ruleSoft}`,
  };

  return (
    <>
      {t.fontFaceCSS && <style dangerouslySetInnerHTML={{ __html: t.fontFaceCSS }} />}
      <link rel="stylesheet" href={t.fontsUrl} />
      <div style={{ ...INVITE_ROOT_STYLE, background: t.pageBg }}>
        <main
          style={{
            maxWidth: 520,
            margin: '0 auto',
            padding: '100px 28px 140px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >

          {/* ── Names eyebrow ── */}
          <p style={{ ...eyebrow, marginBottom: 28, letterSpacing: '0.36em' }}>
            {coupleNames.toUpperCase()}
          </p>

          {/* ── Thank-you headline ── */}
          <h1
            style={{
              fontFamily: t.displayFont,
              fontWeight: 400,
              fontSize: 'clamp(34px, 5.5vw, 46px)',
              lineHeight: 1.18,
              color: t.ink,
              maxWidth: '18ch',
              margin: '0 auto 12px',
            }}
          >
            {anyAttending ? (
              <>
                Thank you for joining us on our{' '}
                <em style={{ fontStyle: 'italic' }}>special day</em>
              </>
            ) : (
              "We'll miss you"
            )}
          </h1>

          {/* ── Subline ── */}
          <p
            style={{
              fontFamily: t.displayFont,
              fontStyle: 'italic',
              fontSize: 17,
              lineHeight: 1.45,
              color: t.ink2,
              maxWidth: '30ch',
              margin: '0 auto',
            }}
          >
            {anyAttending
              ? "We're so glad you're here to celebrate with us."
              : `${declining.map((r) => r.person_name).join(' & ')} — we hope to see you soon.`}
          </p>

          {/* ── Rule ── */}
          <div style={rule} />

          {/* ── RSVP Summary ── */}
          {anyAttending && attending.length > 0 && (
            <p
              style={{
                fontFamily: t.displayFont,
                fontStyle: 'italic',
                fontSize: 15,
                color: t.ink2,
                margin: '0 0 8px',
                lineHeight: 1.6,
              }}
            >
              {attending.map((r) => r.person_name).join(' & ')}{' '}
              {attending.length === 1 ? 'is' : 'are'} confirmed
              {declining.length > 0 && (
                <>
                  {' · '}
                  {declining.map((r) => r.person_name).join(' & ')}{' '}
                  {declining.length === 1 ? 'is' : 'are'} unable to attend
                </>
              )}
            </p>
          )}

          {/* ── Table ── */}
          {hasTable && anyAttending && (
            <>
              <div style={rule} />
              <p style={{ ...eyebrow, letterSpacing: '0.4em', fontSize: 11 }}>YOUR TABLE</p>
              <p
                style={{
                  fontFamily: t.displayFont,
                  fontSize: 168,
                  lineHeight: 1,
                  fontWeight: 400,
                  color: t.ink,
                  margin: 0,
                }}
              >
                {invite.table_number}
              </p>
              {invite.table_name && (
                <p
                  style={{
                    fontFamily: t.displayFont,
                    fontStyle: 'italic',
                    fontSize: 22,
                    color: t.ink2,
                    marginTop: 14,
                  }}
                >
                  {invite.table_name}
                </p>
              )}
            </>
          )}

          {/* ── WHEN ── */}
          {wedding.wedding_date && (
            <section style={{ ...row, marginTop: 40 }}>
              <p style={eyebrow}>WHEN</p>
              <p
                style={{
                  fontFamily: t.displayFont,
                  fontSize: 22,
                  lineHeight: 1.3,
                  fontWeight: 500,
                  color: t.ink,
                  margin: 0,
                }}
              >
                {fmtDate(wedding.wedding_date, tz)}
              </p>
            </section>
          )}

          {/* ── WHERE ── */}
          {wedding.venue_name && (
            <section style={row}>
              <p style={eyebrow}>WHERE</p>
              <p
                style={{
                  fontFamily: t.displayFont,
                  fontSize: 22,
                  lineHeight: 1.3,
                  fontWeight: 500,
                  color: t.ink,
                  margin: 0,
                }}
              >
                {wedding.venue_name}
              </p>
              {venueAddress && (
                <p
                  style={{
                    fontFamily: t.displayFont,
                    fontStyle: 'italic',
                    fontSize: 14,
                    color: t.ink2,
                    marginTop: 6,
                  }}
                >
                  {venueAddress}
                </p>
              )}
            </section>
          )}

          {/* ── ITINERARY ── */}
          {events.length > 0 && (
            <section style={row}>
              <p style={eyebrow}>ITINERARY</p>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 22,
                  marginTop: 6,
                }}
              >
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '84px 1fr',
                      alignItems: 'baseline',
                      gap: 18,
                      textAlign: 'left',
                      maxWidth: 360,
                      margin: '0 auto',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: t.bodyFont,
                        fontSize: 10,
                        letterSpacing: '0.22em',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        color: t.ink3,
                        paddingTop: 4,
                      }}
                    >
                      {ev.start_time ? fmtTime(ev.start_time, tz) : ''}
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: t.displayFont,
                          fontSize: 18,
                          fontWeight: 500,
                          color: t.ink,
                        }}
                      >
                        {ev.name}
                      </div>
                      {ev.location && (
                        <div
                          style={{
                            fontFamily: t.displayFont,
                            fontStyle: 'italic',
                            fontSize: 12,
                            color: t.ink3,
                            marginTop: 2,
                          }}
                        >
                          {ev.location}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Actions ── */}
          <div style={{ paddingTop: 44 }}>
            {anyAttending && (
              <>
                <a
                  href={`/api/invite/${encodeURIComponent(slug)}/calendar`}
                  style={{
                    display: 'inline-block',
                    background: t.ink,
                    color: t.pageBg,
                    fontFamily: t.bodyFont,
                    fontSize: 11,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                    padding: '14px 28px',
                    borderRadius: 32,
                    textDecoration: 'none',
                    border: 'none',
                  }}
                >
                  + ADD TO CALENDAR
                </a>

                {directionsUrl && (
                  <div style={{ marginTop: 18 }}>
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: t.displayFont,
                        fontStyle: 'italic',
                        fontSize: 13,
                        color: t.ink2,
                        textDecoration: 'underline',
                        textUnderlineOffset: 4,
                      }}
                    >
                      Get directions
                    </a>
                  </div>
                )}
              </>
            )}

            <div style={{ marginTop: anyAttending ? 28 : 0 }}>
              <a
                href={`/invite/${encodeURIComponent(slug)}/edit`}
                style={{
                  fontFamily: t.displayFont,
                  fontStyle: 'italic',
                  fontSize: 13,
                  color: t.ink3,
                  textDecoration: 'underline',
                  textUnderlineOffset: 4,
                }}
              >
                Change my response
              </a>
            </div>
          </div>

        </main>

        {/* ── Fixed "POWERED BY RESERVE" mark ── */}
        <div
          style={{
            position: 'fixed',
            bottom: 18,
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: t.bodyFont,
            fontSize: 7,
            letterSpacing: '0.32em',
            color: t.ink3,
            opacity: 0.55,
            textTransform: 'uppercase',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          POWERED BY RESERVE
        </div>
      </div>
    </>
  );
}
