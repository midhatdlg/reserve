/**
 * SageFooter — split footer that mirrors the bottom band of the reference:
 *
 *   ┌──────────────────────────┬──────────────────┐
 *   │  PLEASE RSVP BY          │                  │
 *   │  <RSVP date>             │   landscape      │
 *   │                          │   illustration   │
 *   │  Phone <number>          │                  │
 *   │  Email <address>         │                  │
 *   │  Social <handle>         │                  │
 *   └──────────────────────────┴──────────────────┘
 *
 * Falls back gracefully when RSVP date or contact fields are unset.
 */

import type { TemplateTheme } from '@/lib/template-theme';
import { PAD_FOOTER } from '@/lib/template-theme';
import { LandscapeTile } from './decorations';

interface Props {
  theme: TemplateTheme;
  rsvpByDate?: string | null;
  weddingDate?: string | null;
  contactEmail?: string;
  contactPhone?: string;
  contactSocial?: string;
  contactName1?: string;
  contactName2?: string;
  rsvpUrl: string;
  showPlaceholders?: boolean;
}

function formatLongDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

export function SageFooter({
  theme: t,
  rsvpByDate,
  weddingDate,
  contactEmail,
  contactPhone,
  contactSocial,
  contactName1,
  contactName2,
  rsvpUrl,
  showPlaceholders = false,
}: Props) {
  const displayRsvpBy =
    rsvpByDate?.trim()
      ? formatLongDate(rsvpByDate)
      : weddingDate
        ? formatLongDate(weddingDate)
        : showPlaceholders
          ? 'December 10'
          : null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .tl-sage-footer{
          background:${t.footerBg};
          display:grid;
          grid-template-columns:1fr;
        }
        @container(min-width:600px){
          .tl-sage-footer{grid-template-columns:1.4fr 1fr;}
        }
        .tl-sage-footer-copy{padding:${PAD_FOOTER};}
        .tl-sage-footer-tile{
          min-height:clamp(220px,40svh,360px);
          background:${t.footerBg};
          overflow:hidden;
        }
      `}} />
      <section className="tl-sage-footer">
        <div className="tl-sage-footer-copy">
          {displayRsvpBy && (
            <div style={{ marginBottom: 'clamp(28px, 7cqi, 44px)' }}>
              <p style={{
                fontFamily: t.bodyFont,
                fontSize: 'clamp(11px, 2.85cqi, 12px)',
                fontWeight: 400,
                color: t.footerMuted,
                margin: '0 0 6px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}>
                Please RSVP by
              </p>
              <h2 style={{
                fontFamily: t.displayFont,
                fontSize: 'clamp(1.8rem, 5cqi + 0.4rem, 3rem)',
                fontWeight: 400,
                fontStyle: 'italic',
                color: t.textOnDark,
                margin: 0,
                letterSpacing: '0.02em',
                lineHeight: 1.05,
              }}>
                {displayRsvpBy}
              </h2>
            </div>
          )}

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(10px, 2.5cqi, 14px)',
            maxWidth: 360,
          }}>
            {(contactPhone || showPlaceholders) && (
              <ContactRow theme={t} label="Phone" value={contactPhone || (showPlaceholders ? '(123) 456-7890' : '')} muted={!contactPhone && showPlaceholders} />
            )}
            {(contactEmail || showPlaceholders) && (
              <ContactRow theme={t} label="Email" value={contactEmail || (showPlaceholders ? 'hello@example.com' : '')} muted={!contactEmail && showPlaceholders} />
            )}
            {(contactSocial || showPlaceholders) && (
              <ContactRow
                theme={t}
                label="Social"
                value={contactSocial || (showPlaceholders ? '@yourhandle' : '')}
                muted={!contactSocial && showPlaceholders}
              />
            )}
          </div>

          {(contactName1 || contactName2) && (
            <div style={{
              marginTop: 'clamp(28px, 7cqi, 44px)',
              paddingTop: 'clamp(20px, 5cqi, 28px)',
              borderTop: `1px solid ${t.footerRule}`,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'clamp(20px, 5cqi, 32px)',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(16px, 4cqi, 24px)' }}>
                {contactName1 && (
                  <span style={{
                    fontFamily: t.displayFont,
                    fontSize: 'clamp(14px, 3.4cqi, 16px)',
                    fontStyle: 'italic',
                    color: t.textOnDark,
                  }}>
                    {contactName1}
                  </span>
                )}
                {contactName2 && (
                  <span style={{
                    fontFamily: t.displayFont,
                    fontSize: 'clamp(14px, 3.4cqi, 16px)',
                    fontStyle: 'italic',
                    color: t.textOnDark,
                  }}>
                    {contactName2}
                  </span>
                )}
              </div>

              <a
                href={rsvpUrl}
                style={{
                  display: 'inline-block',
                  fontFamily: t.bodyFont,
                  fontSize: 'clamp(11px, 2.85cqi, 12px)',
                  fontWeight: 600,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: t.footerBg,
                  background: t.surface,
                  padding: 'clamp(10px, 2.6cqi, 14px) clamp(22px, 6cqi, 36px)',
                  textDecoration: 'none',
                  border: `1px solid ${t.surfaceBorder}`,
                  borderRadius: 999,
                }}
              >
                RSVP
              </a>
            </div>
          )}

          <p style={{
            marginTop: 'clamp(28px, 7cqi, 44px)',
            fontFamily: t.bodyFont,
            fontSize: 'clamp(9px, 2.4cqi, 10px)',
            color: t.footerMuted,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            opacity: 0.55,
          }}>
            Powered by Reserve
          </p>
        </div>

        <div className="tl-sage-footer-tile">
          <LandscapeTile
            width="100%"
            height="100%"
            style={{ mixBlendMode: 'multiply', opacity: 0.92 }}
          />
        </div>
      </section>
    </>
  );
}

function ContactRow({
  theme: t,
  label,
  value,
  muted = false,
}: {
  theme: TemplateTheme;
  label: string;
  value: string;
  muted?: boolean;
}) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
      <span style={{
        fontFamily: t.displayFont,
        fontSize: 'clamp(13px, 3.2cqi, 15px)',
        fontStyle: 'italic',
        color: t.textOnDark,
        minWidth: 64,
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: t.bodyFont,
        fontSize: 'clamp(12px, 2.9cqi, 13px)',
        color: muted ? t.placeholderMutedOnDark : t.textOnDarkMuted,
        fontStyle: muted ? 'italic' : 'normal',
      }}>
        {value}
      </span>
    </div>
  );
}
