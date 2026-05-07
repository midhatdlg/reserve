/**
 * SageLoveStory — combined love-story text + photo grid section.
 *
 * Layout: two-column grid on desktop (text left, 2x2 photo grid right),
 * stacked on mobile. Cream/sage background with botanical decorations.
 */

import type { Photo } from '@/types';
import type { TemplateTheme } from '@/lib/template-theme';
import { PAD_SECTION } from '@/lib/template-theme';
import { LineHint, PhotoDropHint } from '../monochrome/sections/Placeholders';
import { RoseLine, ButterflyBloom, LandscapeTile } from './decorations';

interface Props {
  theme: TemplateTheme;
  heading?: string;
  text?: string;
  storyPhoto: Photo | undefined;
  bridgePhoto1: Photo | undefined;
  bridgePhoto2: Photo | undefined;
  showPlaceholders?: boolean;
}

const SAMPLE_STORY =
  'Tell guests how you met and what you are excited about for the big day. Break paragraphs with a blank line — they show as separate blocks here.';

function buildCss(t: TemplateTheme): string {
  return `
.tl-sage-story{
  position:relative;
  background:${t.pageBg};
  padding:${PAD_SECTION};
  box-sizing:border-box;
  overflow:hidden;
}
.tl-sage-story-grid{
  position:relative;
  z-index:1;
  max-width:1100px;
  margin:0 auto;
  display:flex;
  flex-direction:column;
  gap:clamp(32px,8cqi,56px);
}
@container(min-width:680px){
  .tl-sage-story-grid{
    display:grid;
    grid-template-columns:1fr 1.2fr;
    align-items:center;
  }
}
.tl-sage-story-photos{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:clamp(10px,2.5cqi,16px);
}
.tl-sage-story-tile{
  aspect-ratio:4/5;
  overflow:hidden;
  box-shadow:0 6px 18px rgba(34,44,32,0.18);
}
.tl-sage-story-tile img{
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
  filter:${t.photoFilter};
}
`;
}

export function SageLoveStory({
  theme: t,
  heading,
  text,
  storyPhoto,
  bridgePhoto1,
  bridgePhoto2,
  showPlaceholders = false,
}: Props) {
  const hasCopy = Boolean(heading?.trim()) || Boolean(text?.trim());
  const hasPhotos = Boolean(storyPhoto) || Boolean(bridgePhoto1) || Boolean(bridgePhoto2);
  if (!hasCopy && !hasPhotos && !showPlaceholders) return null;

  const displayText = text?.trim() || (showPlaceholders ? SAMPLE_STORY : '');
  const displayHeading = heading?.trim() || 'Our Love Story';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: buildCss(t) }} />
      <section className="tl-sage-story">
        {/* Top-left rose */}
        <RoseLine
          color={t.ink}
          size={140}
          style={{
            position: 'absolute',
            top: 'clamp(-12px, -2cqi, -8px)',
            left: 'clamp(-16px, -3cqi, -10px)',
            width: 'clamp(96px, 22cqi, 160px)',
            height: 'auto',
            opacity: 0.4,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        {/* Bottom-right butterfly */}
        <ButterflyBloom
          color={t.ink}
          size={130}
          style={{
            position: 'absolute',
            bottom: 'clamp(-10px, -2cqi, -6px)',
            right: 'clamp(-10px, -2cqi, -6px)',
            width: 'clamp(88px, 20cqi, 140px)',
            height: 'auto',
            opacity: 0.4,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div className="tl-sage-story-grid">
          {/* Left: text */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{
              fontFamily: t.displayFont,
              fontSize: 'clamp(2.2rem, 6cqi + 0.5rem, 4rem)',
              fontWeight: 400,
              fontStyle: 'italic',
              color: showPlaceholders && !heading?.trim() ? t.ink3 : t.ink,
              margin: '0 0 clamp(20px, 5cqi, 32px)',
              lineHeight: 1.05,
              letterSpacing: '0.02em',
            }}>
              {displayHeading}
            </h2>

            {displayText ? (
              displayText.split('\n\n').map((para, i, arr) => (
                <p key={i} style={{
                  fontFamily: t.bodyFont,
                  fontSize: 'clamp(13px, 2.4cqi, 15px)',
                  fontWeight: 400,
                  color: showPlaceholders && !text?.trim() ? t.ink3 : t.ink2,
                  margin: '0 0 18px',
                  lineHeight: 1.85,
                  borderBottom: i < arr.length - 1 ? `1px solid ${t.rule}` : 'none',
                  paddingBottom: i < arr.length - 1 ? 18 : 0,
                }}>
                  {para}
                </p>
              ))
            ) : null}
            {showPlaceholders && !text?.trim() && (
              <LineHint theme={t} style={{ marginTop: 8, color: t.ink3 }}>
                Replace sample copy — Design → Content → Love Story text
              </LineHint>
            )}
          </div>

          {/* Right: 2x2 photo grid */}
          <div className="tl-sage-story-photos">
            <PhotoTile photo={storyPhoto} theme={t} showPlaceholders={showPlaceholders} />
            <PhotoTile photo={bridgePhoto1} theme={t} showPlaceholders={showPlaceholders} />
            <PhotoTile photo={bridgePhoto2} theme={t} showPlaceholders={showPlaceholders} />
            <div className="tl-sage-story-tile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LandscapeTile
                width="100%"
                height="100%"
                style={{ mixBlendMode: 'multiply', opacity: 0.92 }}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function PhotoTile({ photo, theme: t, showPlaceholders }: { photo: Photo | undefined; theme: TemplateTheme; showPlaceholders: boolean }) {
  return (
    <div className="tl-sage-story-tile">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo.image_url} alt="" />
      ) : showPlaceholders ? (
        <PhotoDropHint
          theme={t}
          label="Photo — Design → Photos"
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <LandscapeTile
          width="100%"
          height="100%"
          style={{ mixBlendMode: 'multiply', opacity: 0.92 }}
        />
      )}
    </div>
  );
}
