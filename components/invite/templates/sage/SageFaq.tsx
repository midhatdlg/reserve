/**
 * SageFaq — sage-panel FAQ section with an oversized italic "FAQs" headline
 * and a line-art rose layered behind it (matching the green design reference).
 *
 * Q&A list sits to the right of the headline on desktop, stacks below on
 * mobile. Empty states show a placeholder hint when shown in design preview.
 */

import type { Question, Photo } from '@/types';
import type { TemplateTheme } from '@/lib/template-theme';
import { PAD_SECTION, GAP_LAYOUT, FS_FAQ_INDEX, SECTION_MIN_HEIGHT } from '@/lib/template-theme';
import { LineHint, PhotoDropHint } from '../monochrome/sections/Placeholders';
import { RoseLine } from './decorations';

interface Props {
  theme: TemplateTheme;
  questions: Question[];
  photo: Photo | undefined;
  showPlaceholders?: boolean;
}

export function SageFaq({ theme: t, questions, photo, showPlaceholders = false }: Props) {
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
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          maxWidth: 1100,
          margin: '0 auto',
          width: '100%',
          position: 'relative',
        }}>
          <div style={{
            display: 'flex',
            gap: GAP_LAYOUT,
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}>
            {/* Left — oversized headline with rose overlay */}
            <div style={{
              flex: '1 1 min(100%, 320px)',
              maxWidth: 420,
              position: 'relative',
            }}>
              <RoseLine
                color={t.textOnDark}
                size={220}
                style={{
                  position: 'absolute',
                  top: 'clamp(-30px, -6cqi, -10px)',
                  left: 'clamp(-20px, -4cqi, -8px)',
                  width: 'clamp(160px, 36cqi, 260px)',
                  height: 'auto',
                  opacity: 0.4,
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />
              <h2 style={{
                position: 'relative',
                zIndex: 1,
                fontFamily: t.displayFont,
                fontSize: 'clamp(3.6rem, 12cqi + 0.5rem, 8rem)',
                fontWeight: 400,
                fontStyle: 'italic',
                color: t.ink,
                margin: 0,
                lineHeight: 0.95,
                letterSpacing: '-0.01em',
              }}>
                FAQs
              </h2>
              {showDemo && (
                <LineHint theme={t} surface="dark" style={{ marginTop: 20, position: 'relative', zIndex: 1 }}>
                  Pin questions with answers in Dashboard → Questions (mark pinned & public)
                </LineHint>
              )}
            </div>

            {/* Right — Q&A list */}
            <div style={{ flex: '1 1 min(100%, 320px)', position: 'relative', zIndex: 1 }}>
              {showDemo ? (
                <FaqRow theme={t} index={1} q="Where should I park?" a="Sample answer — replace with your pinned FAQ content." muted />
              ) : (
                pinned.map((q, i) => (
                  <FaqRow key={q.id} theme={t} index={i + 1} q={q.question_text} a={q.answer_text ?? ''} />
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Optional banner photo below the FAQ panel */}
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

interface RowProps {
  theme: TemplateTheme;
  index: number;
  q: string;
  a: string;
  muted?: boolean;
}

function FaqRow({ theme: t, index, q, a, muted = false }: RowProps) {
  return (
    <div style={{
      borderBottom: `1px solid ${t.ruleOnDark}`,
      padding: 'clamp(18px, 5cqi, 28px) 0',
    }}>
      <div style={{ display: 'flex', gap: 'clamp(12px, 4cqi, 20px)', alignItems: 'flex-start' }}>
        <span style={{
          fontFamily: t.displayFont,
          fontSize: FS_FAQ_INDEX,
          fontWeight: 400,
          color: muted ? t.placeholderMutedOnDark : t.ink3,
          lineHeight: 1,
          minWidth: 'clamp(32px, 9cqi, 40px)',
          opacity: 0.7,
        }}>
          {String(index).padStart(2, '0')}
        </span>
        <div>
          <h3 style={{
            fontFamily: t.bodyFont,
            fontSize: 'clamp(14px, 3.6cqi, 16px)',
            fontWeight: 500,
            fontStyle: 'italic',
            color: muted ? t.placeholderMutedOnDark : t.ink,
            margin: '0 0 10px',
          }}>
            {q}
          </h3>
          <p style={{
            fontFamily: t.bodyFont,
            fontSize: 'clamp(12px, 3cqi, 14px)',
            fontWeight: 400,
            color: muted ? t.placeholderMutedOnDark : t.ink2,
            margin: 0,
            lineHeight: 1.8,
          }}>
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}
