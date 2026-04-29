import type { Photo } from '@/types';
import { LIGHT_BG, LIGHT_TEXT, HEADING_FONT, BODY_FONT, MUTED } from './shared';

interface Props {
  heading?: string;
  text?: string;
  photo: Photo | undefined;
}

export function LoveStorySection({ heading, text, photo }: Props) {
  if (!heading && !text) return null;

  return (
    <section style={{
      background: LIGHT_BG,
      padding: '80px 40px',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        gap: 60,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        {/* Photo */}
        {photo && (
          <div style={{ flex: '1 1 300px', maxWidth: 480 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
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
          </div>
        )}

        {/* Text */}
        <div style={{ flex: '1 1 300px' }}>
          {heading && (
            <h2 style={{
              fontFamily: HEADING_FONT,
              fontSize: 'clamp(36px, 6vw, 56px)',
              fontWeight: 400,
              fontStyle: 'italic',
              color: LIGHT_TEXT,
              margin: '0 0 24px',
              lineHeight: 1.1,
            }}>
              {heading}
            </h2>
          )}
          {text && (
            <p style={{
              fontFamily: BODY_FONT,
              fontSize: 15,
              fontWeight: 300,
              color: MUTED,
              margin: 0,
              lineHeight: 1.8,
              whiteSpace: 'pre-line',
            }}>
              {text}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
