/**
 * SageHero — reference (image 2): dark sage panel, centered cream type,
 * single-line names with & in the same serif caps, script tagline, ghost RSVP,
 * subtle light-sage line illustrations left (botanical + dragonfly) and
 * bottom-right (landscape + butterfly).
 */

import type { Photo } from '@/types';
import type { TemplateTheme } from '@/lib/template-theme';
import {
  SAGE_HERO_BG,
  SCRIPT_FONT,
  SAGE_HERO_DISPLAY_FONT,
  SAGE_HERO_FONT_FACE,
  SAGE_HERO_BOTANICAL_TL_URL,
  SAGE_HERO_LANDSCAPE_BR_URL,
} from './shared';

interface Props {
  theme: TemplateTheme;
  title: string | null;
  heroTagline?: string;
  heroPhoto: Photo | undefined;
  /** Ignored — Sage hero copy is always vertically centered on the viewport. */
  textPosition?: 'top' | 'center' | 'bottom';
  overlayOpacity?: number;
  heroFontSize?: number;
  fadeInText?: boolean;
  showPlaceholders?: boolean;
  previewHeroViewportFill?: boolean;
  slug: string;
}

/** Line art: multiply drops baked-in white mats so art sits on the sage panel naturally */
const HERO_LINE_ART_FILTER = 'contrast(1.06) saturate(0.92)';

export function SageHero({
  theme: t,
  title,
  heroTagline,
  heroPhoto,
  textPosition: _textPosition,
  overlayOpacity = 0.55,
  heroFontSize,
  fadeInText = false,
  showPlaceholders = false,
  previewHeroViewportFill = false,
  slug,
}: Props) {
  const [name1, name2] = (title ?? 'Partner & Partner').split(' & ');
  const clampedOverlay = Math.max(0, Math.min(1, overlayOpacity));

  const deskPx = heroFontSize ?? 58;
  const mobPx = Math.round(deskPx * 0.46);

  const lineInk = t.textOnDark;
  const trimmedHeroTagline = heroTagline?.trim() ?? '';
  const taglineText =
    trimmedHeroTagline ||
    (showPlaceholders ? 'Renewing our vows after 25 years' : '');
  const showTagline = Boolean(taglineText);
  const taglinePlaceholder = showPlaceholders && !trimmedHeroTagline;

  const n1 = (name1?.trim() || 'Partner').toUpperCase();
  const n2 = (name2?.trim() || 'Partner').toUpperCase();

  return (
    <>
      {!previewHeroViewportFill && (
        <style dangerouslySetInnerHTML={{
          __html: `.tl-sage-hero-root{min-height:100svh;min-height:100dvh;}`,
        }} />
      )}
      <style dangerouslySetInnerHTML={{ __html: SAGE_HERO_FONT_FACE }} />
      <style dangerouslySetInnerHTML={{ __html: `
        .tl-sage-hero-names{
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          text-align:center;
          font-size:${mobPx}px;
          letter-spacing:0.06em;
          line-height:1.1;
          gap:0.08em;
        }
        .tl-sage-hero-amp{
          font-style:italic;
          font-size:0.5em;
          letter-spacing:0.02em;
        }
        @container(min-width:560px){
          .tl-sage-hero-names{font-size:${deskPx}px;}
        }
        @keyframes tlSageHeroRise{
          from{opacity:0;transform:translateY(28px);}
          to{opacity:1;transform:translateY(0);}
        }
        .tl-sage-hero-rise{
          opacity:0;
          animation:tlSageHeroRise 0.95s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .tl-sage-hero-rise--1{animation-delay:0.08s;}
        .tl-sage-hero-rise--2{animation-delay:0.24s;}
        .tl-sage-hero-rise--3{animation-delay:0.4s;}
        @keyframes tlSageHeroLetter{
          from{opacity:0;transform:translateY(0.35em);}
          to{opacity:1;transform:translateY(0);}
        }
        .tl-sage-hero-letter{
          display:inline-block;
          opacity:0;
          animation:tlSageHeroLetter 0.75s cubic-bezier(0.22,1,0.36,1) both;
        }
        @media (prefers-reduced-motion:reduce){
          .tl-sage-hero-rise,.tl-sage-hero-letter{opacity:1;animation:none;transform:none;}
        }
        .tl-sage-rsvp-ghost{
          display:inline-block;
          font-family:var(--font-montserrat),system-ui,sans-serif;
          font-size:clamp(10px,2.5cqi,11px);
          font-weight:600;
          letter-spacing:0.32em;
          text-transform:uppercase;
          color:${lineInk};
          background:transparent;
          padding:clamp(12px,2.8cqi,14px) clamp(36px,9cqi,52px);
          text-decoration:none;
          border:1px solid rgba(239,236,226,0.82);
          border-radius:2px;
          transition:color 0.2s ease,border-color 0.2s ease,background 0.2s ease;
        }
        .tl-sage-rsvp-ghost:hover{
          background:rgba(239,236,226,0.08);
          border-color:rgba(239,236,226,0.95);
        }
      `}} />
      <section
        className={previewHeroViewportFill ? undefined : 'tl-sage-hero-root'}
        style={{
          position: 'relative',
          width: '100%',
          minHeight: previewHeroViewportFill ? '100cqh' : 'min(100dvh, 100svh)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: SAGE_HERO_BG,
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
                opacity: 0.1,
                filter: 'saturate(0.75) contrast(0.92)',
                zIndex: 0,
              }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              background: `linear-gradient(180deg, rgba(75,93,68,${0.58 + clampedOverlay * 0.22}) 0%, rgba(75,93,68,${0.74 + clampedOverlay * 0.18}) 100%)`,
            }} />
          </>
        )}

        {/* Left: botanical + dragonfly — natural light-sage ink on dark sage (ref image 2) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={SAGE_HERO_BOTANICAL_TL_URL}
          alt=""
          width={764}
          height={966}
          style={{
            position: 'absolute',
            top: 'clamp(6px, 2cqi, 20px)',
            left: 'clamp(2px, 1cqi, 12px)',
            width: 'clamp(168px, 40cqi, 320px)',
            height: 'auto',
            maxHeight: 'min(74svh, 540px)',
            objectFit: 'contain',
            objectPosition: 'top left',
            filter: HERO_LINE_ART_FILTER,
            mixBlendMode: 'multiply',
            opacity: 0.9,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Bottom-right: trees + butterfly */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={SAGE_HERO_LANDSCAPE_BR_URL}
          alt=""
          width={1024}
          height={816}
          style={{
            position: 'absolute',
            bottom: 'clamp(6px, 2cqi, 24px)',
            right: 'clamp(4px, 1.5cqi, 20px)',
            width: 'clamp(152px, 36cqi, 300px)',
            height: 'auto',
            maxHeight: 'min(48svh, 380px)',
            objectFit: 'contain',
            objectPosition: 'bottom right',
            filter: HERO_LINE_ART_FILTER,
            mixBlendMode: 'multiply',
            opacity: 0.9,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        <div style={{
          position: 'relative',
          zIndex: 2,
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 'clamp(22px, 6cqi, 48px)',
          paddingRight: 'clamp(22px, 6cqi, 48px)',
          textAlign: 'center',
          gap: 'clamp(20px, 5cqi, 32px)',
          minHeight: 0,
          width: '100%',
          boxSizing: 'border-box',
        }}>
          {(() => {
            const letterMs = 34;
            const baseMs = 100;

            const renderLetters = (value: string, startMs: number, keyPrefix: string) => {
              let ms = startMs;
              return value.split('').map((char, idx) => {
                const delay = ms;
                ms += char === ' ' ? Math.round(letterMs * 0.45) : letterMs;
                return (
                  <span
                    key={`${keyPrefix}-${idx}`}
                    className={fadeInText ? 'tl-sage-hero-letter' : undefined}
                    style={fadeInText ? { animationDelay: `${delay}ms`, whiteSpace: char === ' ' ? 'pre' : undefined } : undefined}
                  >
                    {char}
                  </span>
                );
              });
            };

            const riseClass = fadeInText ? '' : ' tl-sage-hero-rise tl-sage-hero-rise--1';
            const ampDelay = baseMs + n1.length * letterMs + 80;
            const n2Start = ampDelay + 120;

            return (
              <h1
                className={`tl-sage-hero-names${riseClass}`}
                style={{
                  fontFamily: SAGE_HERO_DISPLAY_FONT,
                  fontWeight: 400,
                  color: lineInk,
                  margin: 0,
                }}
              >
                <span style={{ textTransform: 'uppercase' }}>
                  {fadeInText ? renderLetters(n1, baseMs, 'name1') : n1}
                </span>
                <span className="tl-sage-hero-amp">
                  {fadeInText ? (
                    <span className="tl-sage-hero-letter" style={{ animationDelay: `${ampDelay}ms` }}>&amp;</span>
                  ) : '&'}
                </span>
                <span style={{ textTransform: 'uppercase' }}>
                  {fadeInText ? renderLetters(n2, n2Start, 'name2') : n2}
                </span>
              </h1>
            );
          })()}

          {showTagline ? (
            <p
              className="tl-sage-hero-rise tl-sage-hero-rise--2"
              style={{
                fontFamily: SCRIPT_FONT,
                fontSize: 'clamp(1.1rem, 3cqi + 0.35rem, 2rem)',
                fontWeight: 400,
                color: taglinePlaceholder ? t.placeholderMutedOnDark : lineInk,
                margin: 0,
                maxWidth: 'min(32ch, 92%)',
                lineHeight: 1.45,
                whiteSpace: 'pre-line',
              }}
            >
              {taglineText}
            </p>
          ) : null}

          <a
            href={`/invite/${slug}#rsvp`}
            className={`tl-sage-rsvp-ghost tl-sage-hero-rise tl-sage-hero-rise--3`}
          >
            RSVP
          </a>
        </div>
      </section>
    </>
  );
}
