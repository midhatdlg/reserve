import type { Photo } from '@/types';
import { DARK_BG, DARK_TEXT, HEADING_FONT, BODY_FONT, MUTED } from './shared';

interface Props {
  title: string | null;
  weddingDate: string | null;
  hashtag?: string;
  heroPhoto: Photo | undefined;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function HeroSection({ title, weddingDate, hashtag, heroPhoto }: Props) {
  const [name1, name2] = (title ?? 'Partner & Partner').split(' & ');

  return (
    <section style={{
      position: 'relative',
      width: '100%',
      minHeight: '100vh',
      background: DARK_BG,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      overflow: 'hidden',
    }}>
      {/* Background photo */}
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
              opacity: 0.6,
            }}
          />
          {/* Gradient overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, transparent 30%, rgba(26,24,22,0.7) 70%, rgba(26,24,22,0.95) 100%)',
          }} />
        </>
      )}

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: '0 40px 60px',
        maxWidth: 1200,
        width: '100%',
        margin: '0 auto',
      }}>
        {/* Couple names */}
        <h1 style={{
          fontFamily: HEADING_FONT,
          fontSize: 'clamp(48px, 10vw, 96px)',
          fontWeight: 400,
          fontStyle: 'italic',
          color: DARK_TEXT,
          margin: '0 0 24px',
          lineHeight: 1,
          letterSpacing: '2px',
        }}>
          {name1?.trim()} <span style={{ fontStyle: 'normal', opacity: 0.6 }}>&amp;</span> {name2?.trim()}
        </h1>

        {/* Date + hashtag row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          {weddingDate && (
            <p style={{
              fontFamily: BODY_FONT,
              fontSize: 14,
              fontWeight: 300,
              color: MUTED,
              margin: 0,
              letterSpacing: '1px',
            }}>
              {formatDate(weddingDate)}
            </p>
          )}
          {hashtag && (
            <p style={{
              fontFamily: BODY_FONT,
              fontSize: 14,
              fontWeight: 300,
              color: MUTED,
              margin: 0,
              letterSpacing: '1px',
            }}>
              {hashtag}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
