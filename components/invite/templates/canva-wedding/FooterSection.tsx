import { DARK_BG, DARK_TEXT, HEADING_FONT, BODY_FONT, MUTED, ACCENT } from './shared';

interface Props {
  contactEmail?: string;
  contactPhone?: string;
  hashtag?: string;
  rsvpUrl: string;
}

export function FooterSection({ contactEmail, contactPhone, hashtag, rsvpUrl }: Props) {
  return (
    <section style={{
      background: DARK_BG,
      padding: '80px 40px',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h2 style={{
          fontFamily: HEADING_FONT,
          fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 400,
          fontStyle: 'italic',
          color: DARK_TEXT,
          margin: '0 0 16px',
          lineHeight: 1.2,
        }}>
          We can&apos;t wait to celebrate with you
        </h2>

        {hashtag && (
          <p style={{
            fontFamily: BODY_FONT,
            fontSize: 14,
            fontWeight: 300,
            color: MUTED,
            margin: '0 0 32px',
            letterSpacing: '1px',
          }}>
            {hashtag}
          </p>
        )}

        <a
          href={rsvpUrl}
          style={{
            display: 'inline-block',
            fontFamily: BODY_FONT,
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: DARK_BG,
            background: ACCENT,
            padding: '16px 48px',
            textDecoration: 'none',
            marginBottom: 40,
          }}
        >
          RSVP
        </a>

        {(contactEmail || contactPhone) && (
          <div style={{ marginTop: 40 }}>
            <p style={{
              fontFamily: BODY_FONT,
              fontSize: 12,
              fontWeight: 400,
              color: MUTED,
              margin: '0 0 8px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}>
              Questions? Reach out
            </p>
            {contactEmail && (
              <p style={{
                fontFamily: BODY_FONT,
                fontSize: 13,
                fontWeight: 300,
                color: DARK_TEXT,
                margin: '0 0 4px',
              }}>
                {contactEmail}
              </p>
            )}
            {contactPhone && (
              <p style={{
                fontFamily: BODY_FONT,
                fontSize: 13,
                fontWeight: 300,
                color: DARK_TEXT,
                margin: 0,
              }}>
                {contactPhone}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
