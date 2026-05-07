import type { Photo } from '@/types';
import type { TemplateTheme } from '@/lib/template-theme';
import { PAD_HERO_META } from '@/lib/template-theme';

type TextPosition = 'top' | 'center' | 'bottom';

interface Props {
  theme: TemplateTheme;
  title: string | null;
  weddingDate: string | null;
  hashtag?: string;
  heroPhoto: Photo | undefined;
  textPosition?: TextPosition;
  overlayOpacity?: number;
  /** Base font size in px for couple names (desktop). Mobile uses ~55% of this. */
  heroFontSize?: number;
  /** Animate names/date/hashtag from invisible to visible. */
  fadeInText?: boolean;
  showPlaceholders?: boolean;
  previewHeroViewportFill?: boolean;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const TEXT_POSITION_STYLES: Record<TextPosition, { alignItems: string; paddingTop: string; paddingBottom: string }> = {
  top:    { alignItems: 'flex-start', paddingTop: 'clamp(1.25rem, 6svh, 4rem)', paddingBottom: '0' },
  center: { alignItems: 'center',     paddingTop: '0', paddingBottom: '0' },
  bottom: { alignItems: 'flex-end',   paddingTop: '0', paddingBottom: 'clamp(1.5rem, 12svh, 5rem)' },
};

const HERO_SIDE_INSET = 'clamp(12px, 4cqi, 40px)';

export function HeroSection({
  theme: t,
  title,
  weddingDate,
  hashtag,
  heroPhoto,
  textPosition = 'top',
  overlayOpacity = 0.6,
  heroFontSize,
  fadeInText = false,
  showPlaceholders = false,
  previewHeroViewportFill = false,
}: Props) {
  const [name1, name2] = (title ?? 'Partner & Partner').split(' & ');
  const posStyles = TEXT_POSITION_STYLES[textPosition] ?? TEXT_POSITION_STYLES.top;
  const clampedOverlay = Math.max(0, Math.min(1, overlayOpacity));

  // Desktop font size from override, mobile is ~55% of desktop
  const deskPx = heroFontSize ?? 64;
  const mobPx = Math.round(deskPx * 0.55);

  return (
    <>
      {!previewHeroViewportFill && (
        <style dangerouslySetInnerHTML={{
          __html: `.tl-hero-root{min-height:100svh;min-height:100dvh;}`,
        }}
        />
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        .tl-hero-names{flex-direction:column;align-items:center;font-size:${mobPx}px;}
        @container(min-width:600px){.tl-hero-names{flex-direction:row;font-size:${deskPx}px;}}
        @keyframes tlHeroFadeIn{
          from{opacity:0;transform:translateY(12px);}
          to{opacity:1;transform:translateY(0);}
        }
        .tl-hero-letter{display:inline-block;opacity:0;animation:tlHeroFadeIn 1.1s ease-out both;}
        @media (prefers-reduced-motion: reduce){
          .tl-hero-letter{opacity:1;animation:none;transform:none;}
        }
      `}} />
      <section
        className={previewHeroViewportFill ? undefined : 'tl-hero-root'}
        style={{
          position: 'relative',
          width: '100%',
          minHeight: previewHeroViewportFill ? '100cqh' : undefined,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: t.heroBg,
        }}
      >
      {heroPhoto && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroPhoto.image_url}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.72,
              filter: t.photoFilter,
            }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(to bottom, rgba(0,0,0,${clampedOverlay * 0.18}) 0%, rgba(0,0,0,${clampedOverlay * 0.5}) 60%, rgba(0,0,0,${clampedOverlay}) 100%)`,
          }} />
        </>
      )}

      {!heroPhoto && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: t.heroImgFallback,
        }} />
      )}

      {showPlaceholders && !heroPhoto && (
        <div
          style={{
            position: 'absolute',
            inset: 'clamp(14px, 4cqi, 28px)',
            border: t.placeholderBorderOnDark,
            borderRadius: 2,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            boxSizing: 'border-box',
            zIndex: 1,
          }}
        >
          <span style={{
            fontFamily: t.bodyFont,
            fontSize: 'clamp(10px, 2.75cqi, 11px)',
            color: t.placeholderMutedOnDark,
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textAlign: 'center',
            lineHeight: 1.45,
          }}>
            Hero photo — upload in Design → Photos
          </span>
        </div>
      )}

      <div style={{
        position: 'relative',
        zIndex: 2,
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: posStyles.alignItems,
        justifyContent: 'center',
        paddingTop: posStyles.paddingTop,
        paddingBottom: posStyles.paddingBottom,
        paddingLeft: HERO_SIDE_INSET,
        paddingRight: HERO_SIDE_INSET,
        boxSizing: 'border-box',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          {(() => {
            const letterStepMs = 34;
            const nameStartMs = 120;
            const n1 = name1?.trim() || 'Partner';
            const n2 = name2?.trim() || 'Partner';

            const renderAnimatedLetters = (
              value: string,
              startMs: number,
              keyPrefix: string,
            ) => {
              let ms = startMs;
              return value.split('').map((char, idx) => {
                const delayMs = ms;
                ms += char === ' ' ? Math.round(letterStepMs * 0.55) : letterStepMs;
                return (
                  <span
                    key={`${keyPrefix}-${idx}`}
                    className={fadeInText ? 'tl-hero-letter' : undefined}
                    style={fadeInText ? { animationDelay: `${delayMs}ms`, whiteSpace: char === ' ' ? 'pre' : undefined } : undefined}
                  >
                    {char}
                  </span>
                );
              });
            };

            const ampDelay = nameStartMs + n1.length * letterStepMs + 110;

            return (
              <>
          <h1
            className="tl-hero-names"
            style={{
            fontFamily: t.displayFont,
            fontWeight: 400,
            color: t.textOnDark,
            margin: 0,
            letterSpacing: '0.06em',
            lineHeight: 1.15,
            display: 'flex',
            justifyContent: 'center',
            columnGap: '0.28em',
            rowGap: '0.12em',
            textAlign: 'center',
          }}>
            <span style={{ textTransform: 'uppercase' }}>
              {fadeInText ? renderAnimatedLetters(n1, nameStartMs, 'name1') : n1}
            </span>
            <span style={{
              fontStyle: 'italic',
              fontWeight: 400,
              textTransform: 'none',
              letterSpacing: '0.02em',
            }}
            >
              {fadeInText ? (
                <span className="tl-hero-letter" style={{ animationDelay: `${ampDelay}ms` }}>&amp;</span>
              ) : '&'}
            </span>
            <span style={{ textTransform: 'uppercase' }}>
              {fadeInText ? renderAnimatedLetters(n2, ampDelay + 120, 'name2') : n2}
            </span>
          </h1>
          {showPlaceholders && !(title?.trim()) && (
            <p style={{
              fontFamily: t.bodyFont,
              fontSize: 'clamp(11px, 2.85cqi, 12px)',
              fontStyle: 'italic',
              color: t.placeholderMutedOnDark,
              margin: 'clamp(12px, 3cqi, 20px) 0 0',
              textAlign: 'center',
            }}>
              Couple names — set in Wedding Settings
            </p>
          )}
              </>
            );
          })()}
        </div>
      </div>

      <div style={{
        position: 'relative',
        zIndex: 2,
        padding: PAD_HERO_META,
      }}>
        <div style={{
          borderTop: `1px solid ${t.ruleOnDark}`,
          paddingTop: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          {weddingDate ? (
            <span style={{
              fontFamily: t.bodyFont,
              fontSize: 'clamp(11px, 2.85cqi, 12px)',
              fontWeight: 400,
              color: t.textOnDarkMuted,
              letterSpacing: '0.5px',
            }}>
              {fadeInText
                ? (() => {
                    let ms = 950;
                    return formatDate(weddingDate).split('').map((char, idx) => {
                      const d = ms;
                      ms += char === ' ' ? 18 : 34;
                      return (
                        <span
                          key={`date-${idx}`}
                          className="tl-hero-letter"
                          style={{ animationDelay: `${d}ms`, whiteSpace: char === ' ' ? 'pre' : undefined }}
                        >
                          {char}
                        </span>
                      );
                    });
                  })()
                : formatDate(weddingDate)}
            </span>
          ) : showPlaceholders ? (
            <span style={{
              fontFamily: t.bodyFont,
              fontSize: 'clamp(11px, 2.85cqi, 12px)',
              fontStyle: 'italic',
              color: t.placeholderMutedOnDark,
              letterSpacing: '0.5px',
            }}>
              Wedding date — Settings
            </span>
          ) : null}
          {hashtag ? (
            <span style={{
              fontFamily: t.bodyFont,
              fontSize: 'clamp(11px, 2.85cqi, 12px)',
              fontWeight: 400,
              color: t.textOnDarkMuted,
              letterSpacing: '0.5px',
            }}>
              {fadeInText
                ? (() => {
                    let ms = 1250;
                    return hashtag.split('').map((char, idx) => {
                      const d = ms;
                      ms += char === ' ' ? 18 : 34;
                      return (
                        <span
                          key={`tag-${idx}`}
                          className="tl-hero-letter"
                          style={{ animationDelay: `${d}ms`, whiteSpace: char === ' ' ? 'pre' : undefined }}
                        >
                          {char}
                        </span>
                      );
                    });
                  })()
                : hashtag}
            </span>
          ) : showPlaceholders ? (
            <span style={{
              fontFamily: t.bodyFont,
              fontSize: 'clamp(11px, 2.85cqi, 12px)',
              fontStyle: 'italic',
              color: t.placeholderMutedOnDark,
              letterSpacing: '0.5px',
            }}>
              Hashtag — Design → Content
            </span>
          ) : null}
        </div>
      </div>
    </section>
    </>
  );
}
