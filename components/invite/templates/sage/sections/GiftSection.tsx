/**
 * Sage template — registry / gift block (owned copy).
 * Monochrome and civil-classic continue to use `components/invite/sections/GiftSection`.
 */
import type { TemplateTheme } from '@/lib/template-theme';
import { PAD_SECTION, FS_DISPLAY_MD, SECTION_MIN_HEIGHT } from '@/lib/template-theme';
import { LineHint, PhotoDropHint } from '@/components/invite/templates/monochrome/sections/Placeholders';

interface Props {
  theme: TemplateTheme;
  giftText?: string;
  giftQrUrl?: string;
  contactEmail?: string;
  showPlaceholders?: boolean;
}

const SAMPLE_GIFT =
  'No gifts are expected — your presence means the world to us. If you still wish to contribute, a small note toward our honeymoon would make us smile.';

export function GiftSection({ theme: t, giftText, giftQrUrl, contactEmail, showPlaceholders = false }: Props) {
  const hasRealCopy = Boolean(giftText?.trim());
  if (!hasRealCopy && !showPlaceholders) return null;

  const body = giftText?.trim() || (showPlaceholders ? SAMPLE_GIFT : '');

  return (
    <section style={{
      background: t.sectionDarkBg,
      padding: PAD_SECTION,
      textAlign: 'center',
      minHeight: SECTION_MIN_HEIGHT,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h2 style={{
          fontFamily: t.displayFont,
          fontSize: FS_DISPLAY_MD,
          fontWeight: 400,
          fontStyle: 'italic',
          color: t.textOnDark,
          margin: '0 0 clamp(18px, 5cqi, 28px)',
          lineHeight: 1.3,
        }}>
          Your presence is truly the best<br />gift we could ask for.
        </h2>

        {body ? (
          <p style={{
            fontFamily: t.bodyFont,
            fontSize: 'clamp(12px, 3cqi, 13px)',
            fontWeight: 400,
            color: hasRealCopy ? t.textOnDarkMuted : t.placeholderMutedOnDark,
            margin: '0 0 clamp(22px, 6cqi, 36px)',
            lineHeight: 1.9,
            whiteSpace: 'pre-line',
          }}>
            {body}
          </p>
        ) : null}

        {showPlaceholders && !hasRealCopy && (
          <LineHint theme={t} surface="dark" style={{ marginTop: -12, marginBottom: 24 }}>
            Replace sample — Design → Content → Registry / gift note
          </LineHint>
        )}

        {giftQrUrl ? (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 'clamp(14px, 4cqi, 20px)',
            padding: 'clamp(14px, 4cqi, 20px) clamp(16px, 5cqi, 24px)',
            background: 'rgba(255,255,255,0.08)',
            border: `1px solid rgba(255,255,255,0.15)`,
            borderRadius: 2,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={giftQrUrl}
              alt="Gift registry QR code"
              style={{ width: 'clamp(72px, 18cqi, 80px)', height: 'clamp(72px, 18cqi, 80px)', display: 'block' }}
            />
            <div style={{ textAlign: 'left' }}>
              <p style={{
                fontFamily: t.bodyFont,
                fontSize: 'clamp(11px, 2.85cqi, 12px)',
                fontWeight: 500,
                color: t.textOnDark,
                margin: '0 0 4px',
              }}>
                Scan this QR or email us at
              </p>
              {contactEmail ? (
                <p style={{
                  fontFamily: t.bodyFont,
                  fontSize: 'clamp(11px, 2.85cqi, 12px)',
                  color: t.textOnDarkMuted,
                  margin: 0,
                }}>
                  {contactEmail}
                </p>
              ) : showPlaceholders ? (
                <LineHint theme={t} surface="dark" style={{ marginTop: 4 }}>Contact email — Design → Content</LineHint>
              ) : null}
            </div>
          </div>
        ) : showPlaceholders ? (
          <PhotoDropHint
            theme={t}
            surface="dark"
            label="Optional registry QR URL — Design → Content"
            style={{ margin: '0 auto', maxWidth: 400, minHeight: 100 }}
          />
        ) : null}
      </div>
    </section>
  );
}
