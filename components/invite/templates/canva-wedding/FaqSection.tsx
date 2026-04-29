import type { Question, Photo } from '@/types';
import { DARK_BG, DARK_TEXT, HEADING_FONT, BODY_FONT, MUTED } from './shared';

interface Props {
  questions: Question[];
  photo: Photo | undefined;
}

export function FaqSection({ questions, photo }: Props) {
  if (questions.length === 0) return null;

  return (
    <section style={{
      background: DARK_BG,
      padding: '80px 40px',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        gap: 60,
        alignItems: 'flex-start',
        flexWrap: 'wrap',
      }}>
        {/* Heading + photo */}
        <div style={{ flex: '1 1 280px', maxWidth: 360 }}>
          <h2 style={{
            fontFamily: HEADING_FONT,
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 400,
            fontStyle: 'italic',
            color: DARK_TEXT,
            margin: '0 0 32px',
            lineHeight: 1.1,
          }}>
            Frequently<br />Asked<br />Questions
          </h2>

          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo.image_url}
              alt=""
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          )}
        </div>

        {/* Questions */}
        <div style={{ flex: '1 1 400px' }}>
          {questions.map((q, i) => (
            <div key={q.id} style={{
              borderBottom: '1px solid rgba(242,240,236,0.1)',
              padding: '28px 0',
            }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <span style={{
                  fontFamily: HEADING_FONT,
                  fontSize: 28,
                  fontWeight: 400,
                  color: DARK_TEXT,
                  opacity: 0.4,
                  lineHeight: 1,
                  minWidth: 36,
                }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 style={{
                    fontFamily: BODY_FONT,
                    fontSize: 16,
                    fontWeight: 500,
                    color: DARK_TEXT,
                    margin: '0 0 8px',
                  }}>
                    {q.question_text}
                  </h3>
                  {q.answer_text && (
                    <p style={{
                      fontFamily: BODY_FONT,
                      fontSize: 13,
                      fontWeight: 300,
                      color: MUTED,
                      margin: 0,
                      lineHeight: 1.7,
                    }}>
                      {q.answer_text}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
