import type { Question, Photo } from '@/types';
import type { TemplateTheme } from '@/lib/template-theme';
import { PAD_SECTION, GAP_LAYOUT, FS_DISPLAY_LG, FS_FAQ_INDEX, SECTION_MIN_HEIGHT } from '@/lib/template-theme';
import { LineHint, PhotoDropHint } from './Placeholders';

interface Props {
  theme: TemplateTheme;
  questions: Question[];
  photo: Photo | undefined;
  showPlaceholders?: boolean;
}

export function FaqSection({ theme: t, questions, photo, showPlaceholders = false }: Props) {
  const pinned = questions.filter((q) => q.is_pinned && q.answer_text);
  const showDemo = pinned.length === 0 && showPlaceholders;

  if (pinned.length === 0 && !showPlaceholders) return null;

  return (
    <>
    <section style={{
      background: t.pageBg,
      padding: PAD_SECTION,
      minHeight: SECTION_MIN_HEIGHT,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
      }}>
        <div style={{
          display: 'flex',
          gap: GAP_LAYOUT,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: '1 1 min(100%, 260px)', maxWidth: 280 }}>
            <h2 style={{
              fontFamily: t.displayFont,
              fontSize: FS_DISPLAY_LG,
              fontWeight: 400,
              color: t.ink,
              margin: 0,
              lineHeight: 1.05,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              FREQUENTLY<br />ASKED<br />QUESTIONS
            </h2>
            {showDemo && (
              <LineHint theme={t} style={{ marginTop: 16 }}>
                Pin questions with answers in Dashboard → Questions (mark pinned & public)
              </LineHint>
            )}
          </div>

          <div style={{ flex: '1 1 min(100%, 280px)' }}>
            {showDemo ? (
              <div style={{
                borderBottom: `1px solid ${t.rule}`,
                padding: 'clamp(18px, 5cqi, 28px) 0',
              }}>
                <div style={{ display: 'flex', gap: 'clamp(12px, 4cqi, 20px)', alignItems: 'flex-start' }}>
                  <span style={{
                    fontFamily: t.displayFont,
                    fontSize: FS_FAQ_INDEX,
                    fontWeight: 400,
                    color: t.ink3,
                    lineHeight: 1,
                    minWidth: 'clamp(32px, 9cqi, 40px)',
                    opacity: 0.5,
                  }}>
                    01
                  </span>
                  <div>
                    <h3 style={{
                      fontFamily: t.bodyFont,
                      fontSize: 'clamp(14px, 3.6cqi, 15px)',
                      fontWeight: 500,
                      fontStyle: 'italic',
                      color: t.placeholderMuted,
                      margin: '0 0 10px',
                    }}>
                      Where should I park?
                    </h3>
                    <p style={{
                      fontFamily: t.bodyFont,
                      fontSize: 'clamp(12px, 3cqi, 13px)',
                      fontWeight: 400,
                      color: t.placeholderMuted,
                      margin: 0,
                      lineHeight: 1.8,
                    }}>
                      Sample answer — replace with your pinned FAQ content.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              pinned.map((q, i) => (
                <div key={q.id} style={{
                  borderBottom: `1px solid ${t.rule}`,
                  padding: 'clamp(18px, 5cqi, 28px) 0',
                }}>
                  <div style={{ display: 'flex', gap: 'clamp(12px, 4cqi, 20px)', alignItems: 'flex-start' }}>
                    <span style={{
                      fontFamily: t.displayFont,
                      fontSize: FS_FAQ_INDEX,
                      fontWeight: 400,
                      color: t.ink3,
                      lineHeight: 1,
                      minWidth: 'clamp(32px, 9cqi, 40px)',
                      opacity: 0.5,
                    }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 style={{
                        fontFamily: t.bodyFont,
                        fontSize: 'clamp(14px, 3.6cqi, 15px)',
                        fontWeight: 500,
                        fontStyle: 'italic',
                        color: t.ink,
                        margin: '0 0 10px',
                      }}>
                        {q.question_text}
                      </h3>
                      <p style={{
                        fontFamily: t.bodyFont,
                        fontSize: 'clamp(12px, 3cqi, 13px)',
                        fontWeight: 400,
                        color: t.ink2,
                        margin: 0,
                        lineHeight: 1.8,
                      }}>
                        {q.answer_text}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </section>

    {photo ? (
      <div style={{ lineHeight: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.image_url}
          alt=""
          style={{
            width: '100%',
            height: 'clamp(280px, 50svh, 560px)',
            objectFit: 'cover',
            display: 'block',
            filter: t.photoFilter,
          }}
        />
      </div>
    ) : showPlaceholders ? (
      <PhotoDropHint
        theme={t}
        label="FAQ banner photo — Design → Photos"
        style={{ width: '100%', minHeight: 'clamp(280px, 50svh, 560px)' }}
      />
    ) : null}
    </>
  );
}
