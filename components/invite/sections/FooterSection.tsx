import type { TemplateTheme } from '@/lib/template-theme';
import { PAD_FOOTER, FS_FOOTER_TITLE, GAP_LAYOUT } from '@/lib/template-theme';
import { LineHint } from './Placeholders';

interface Props {
  theme: TemplateTheme;
  contactEmail?: string;
  contactPhone?: string;
  contactName1?: string;
  contactName2?: string;
  rsvpUrl: string;
  showPlaceholders?: boolean;
}

export function FooterSection({ theme: t, contactEmail, contactPhone, contactName1, contactName2, rsvpUrl, showPlaceholders = false }: Props) {
  return (
    <section style={{
      background: t.footerBg,
      padding: PAD_FOOTER,
    }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: GAP_LAYOUT,
      }}>
        <div>
          <h2 style={{
            fontFamily: t.displayFont,
            fontSize: FS_FOOTER_TITLE,
            fontWeight: 400,
            color: t.textOnDark,
            margin: '0 0 clamp(22px, 6cqi, 32px)',
            lineHeight: 1,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            GET IN<br />TOUCH
          </h2>

          <div style={{
            display: 'flex',
            gap: 'clamp(18px, 6cqi, 32px)',
            flexWrap: 'wrap',
          }}>
            {contactName1 && (
              <div>
                <p style={{
                  fontFamily: t.bodyFont,
                  fontSize: 'clamp(13px, 3.25cqi, 14px)',
                  fontWeight: 500,
                  color: t.textOnDark,
                  margin: '0 0 6px',
                }}>
                  {contactName1}
                </p>
                {contactPhone && (
                  <p style={{
                    fontFamily: t.bodyFont,
                    fontSize: 'clamp(11px, 2.85cqi, 12px)',
                    color: t.footerMuted,
                    margin: '0 0 2px',
                  }}>
                    {contactPhone}
                  </p>
                )}
                {contactEmail && (
                  <p style={{
                    fontFamily: t.bodyFont,
                    fontSize: 'clamp(11px, 2.85cqi, 12px)',
                    color: t.footerMuted,
                    margin: 0,
                  }}>
                    {contactEmail}
                  </p>
                )}
              </div>
            )}
            {contactName2 && (
              <div>
                <p style={{
                  fontFamily: t.bodyFont,
                  fontSize: 'clamp(13px, 3.25cqi, 14px)',
                  fontWeight: 500,
                  color: t.textOnDark,
                  margin: '0 0 6px',
                }}>
                  {contactName2}
                </p>
              </div>
            )}
            {!contactName1 && !contactName2 && (contactEmail || contactPhone) && (
              <div>
                {contactPhone && (
                  <p style={{
                    fontFamily: t.bodyFont,
                    fontSize: 'clamp(11px, 2.85cqi, 12px)',
                    color: t.footerMuted,
                    margin: '0 0 2px',
                  }}>
                    {contactPhone}
                  </p>
                )}
                {contactEmail && (
                  <p style={{
                    fontFamily: t.bodyFont,
                    fontSize: 'clamp(11px, 2.85cqi, 12px)',
                    color: t.footerMuted,
                    margin: 0,
                  }}>
                    {contactEmail}
                  </p>
                )}
              </div>
            )}
          </div>
          {showPlaceholders && (!(contactName1 || contactName2) || !contactPhone || !contactEmail) && (
            <LineHint theme={t} surface="dark" style={{ marginTop: 14, maxWidth: 400 }}>
              {!(contactName1 || contactName2) ? 'Names shown here come from your wedding title — Settings. ' : ''}
              {!contactPhone ? 'Add phone — Design → Content. ' : ''}
              {!contactEmail ? 'Add email — Design → Content.' : ''}
            </LineHint>
          )}
        </div>

        <a
          href={rsvpUrl}
          style={{
            display: 'inline-block',
            fontFamily: t.bodyFont,
            fontSize: 'clamp(11px, 2.85cqi, 12px)',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: t.footerBg,
            background: t.textOnDark,
            padding: 'clamp(12px, 3.5cqi, 16px) clamp(22px, 8cqi, 40px)',
            textDecoration: 'none',
            border: `1px solid ${t.textOnDark}`,
          }}
        >
          RSVP
        </a>
      </div>

      <div style={{
        maxWidth: 1100,
        margin: 'clamp(32px, 9cqi, 48px) auto 0',
        borderTop: `1px solid ${t.footerRule}`,
        paddingTop: 'clamp(16px, 4cqi, 20px)',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: t.bodyFont,
          fontSize: 'clamp(9px, 2.5cqi, 10px)',
          color: t.footerMuted,
          margin: 0,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          opacity: 0.5,
        }}>
          Powered by Reserve
        </p>
      </div>
    </section>
  );
}
