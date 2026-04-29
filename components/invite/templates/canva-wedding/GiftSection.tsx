import { LIGHT_BG, LIGHT_TEXT, HEADING_FONT, BODY_FONT, MUTED } from './shared';

interface Props {
  giftText?: string;
  giftQrUrl?: string;
}

export function GiftSection({ giftText, giftQrUrl }: Props) {
  if (!giftText) return null;

  return (
    <section style={{
      background: LIGHT_BG,
      padding: '80px 40px',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h2 style={{
          fontFamily: HEADING_FONT,
          fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 400,
          fontStyle: 'italic',
          color: LIGHT_TEXT,
          margin: '0 0 24px',
          lineHeight: 1.2,
        }}>
          Your presence is truly the best<br />gift we could ask for.
        </h2>

        <p style={{
          fontFamily: BODY_FONT,
          fontSize: 14,
          fontWeight: 300,
          color: MUTED,
          margin: '0 0 32px',
          lineHeight: 1.8,
          whiteSpace: 'pre-line',
        }}>
          {giftText}
        </p>

        {giftQrUrl && (
          <div style={{ display: 'inline-block' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={giftQrUrl}
              alt="Gift registry QR code"
              style={{ width: 120, height: 120, display: 'block', margin: '0 auto 12px' }}
            />
            <p style={{
              fontFamily: BODY_FONT,
              fontSize: 11,
              color: MUTED,
              margin: 0,
            }}>
              Scan this QR or email us
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
