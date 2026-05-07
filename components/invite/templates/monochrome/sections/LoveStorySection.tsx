import type { Photo } from '@/types';
import type { TemplateTheme } from '@/lib/template-theme';
import { PAD_SECTION, SECTION_MIN_HEIGHT } from '@/lib/template-theme';
import { LineHint, PhotoDropHint } from './Placeholders';

interface Props {
  theme: TemplateTheme;
  heading?: string;
  text?: string;
  photo: Photo | undefined;
  showPlaceholders?: boolean;
}

const SAMPLE_STORY =
  'Tell guests how you met and what you are excited about for the big day. Break paragraphs with a blank line — they show as separate blocks here.';

export function LoveStorySection({ theme: t, heading, text, photo, showPlaceholders = false }: Props) {
  const hasCopy = Boolean(heading?.trim()) || Boolean(text?.trim());
  if (!hasCopy && !showPlaceholders) return null;

  const displayText = text?.trim() || (showPlaceholders ? SAMPLE_STORY : '');
  const displayHeading = (heading?.trim() || 'OUR LOVE STORY').replace(/\s+/g, ' ').split(' ').join('\n');

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .tl-story{
          display:flex;
          flex-direction:column;
          gap:clamp(24px,6cqi,40px);
          align-items:center;
        }
        .tl-story-heading{text-align:center;}
        .tl-story-heading,.tl-story-photo,.tl-story-text{width:100%;}
        .tl-story-photo{max-width:560px;margin:0 auto;}
        .tl-story-text{max-width:560px;padding-left:0;}
        @container(min-width:768px){
          .tl-story{
            flex-direction:row;
            gap:clamp(22px,2.8cqi,40px);
            align-items:center;
            justify-content:center;
            transform:none;
            box-sizing:border-box;
            padding-left:50px;
            padding-right:clamp(8px,1.2cqi,18px);
          }
          .tl-story-heading{flex:0 0 180px;text-align:left;}
          .tl-story-photo{flex:0 1 clamp(280px,40cqi,440px);max-width:none;margin:0;min-width:0;}
          .tl-story-text{
            flex:1 1 240px;
            min-width:0;
            padding-left:clamp(6px,1.2cqi,14px);
            max-width:34ch;
          }
        }
      `}} />
      <section style={{
        background: t.pageBg,
        padding: PAD_SECTION,
        minHeight: SECTION_MIN_HEIGHT,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <div
          className="tl-story"
          style={{
            maxWidth: 1060,
            margin: '0 auto',
            width: '100%',
          }}
        >
          {/* Column 1: Heading */}
          <div className="tl-story-heading">
            <h2 style={{
              fontFamily: t.displayFont,
              fontSize: 'clamp(1.95rem, 3.65cqi + 0.35rem, 3.05rem)',
              fontWeight: 400,
              color: showPlaceholders && !heading?.trim() ? t.placeholderMuted : t.ink,
              margin: 0,
              lineHeight: 0.95,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              whiteSpace: 'pre-line',
            }}>
              {displayHeading}
            </h2>
            {showPlaceholders && !heading?.trim() && (
              <LineHint theme={t} style={{ marginTop: 12 }}>
                Optional heading — Design → Content
              </LineHint>
            )}
          </div>

          {/* Column 2: Photo (forced landscape 4:3) */}
          <div className="tl-story-photo">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo.image_url}
                alt=""
                style={{
                  width: '100%',
                  aspectRatio: '4 / 3',
                  objectFit: 'cover',
                  display: 'block',
                  filter: t.photoFilter,
                }}
              />
            ) : showPlaceholders ? (
              <PhotoDropHint
                theme={t}
                label="Love Story photo — Design → Photos"
                style={{ width: '100%', aspectRatio: '4 / 3' }}
              />
            ) : null}
          </div>

          {/* Column 3: Text */}
          <div className="tl-story-text">
            {displayText ? (
              displayText.split('\n\n').map((para, i) => (
                <p key={i} style={{
                  fontFamily: t.bodyFont,
                  fontSize: 'clamp(14px, 2.1cqi, 15px)',
                  fontWeight: 400,
                  color: showPlaceholders && !text?.trim() ? t.placeholderMuted : t.ink2,
                  margin: '0 0 16px',
                  lineHeight: 1.6,
                }}>
                  {para}
                </p>
              ))
            ) : null}
            {showPlaceholders && !text?.trim() && (
              <LineHint theme={t} style={{ marginTop: 8 }}>
                Replace sample copy — Design → Content → Love Story text
              </LineHint>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
