'use client';

import { useState } from 'react';
import type { Photo } from '@/types';

interface Props {
  photos: Photo[];
}

export function PhotoGallery({ photos }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (photos.length === 0) return null;

  function prev() {
    setLightbox((i) => (i === null ? null : (i - 1 + photos.length) % photos.length));
  }
  function next() {
    setLightbox((i) => (i === null ? null : (i + 1) % photos.length));
  }

  return (
    <>
      <div>
        <p style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 13,
          letterSpacing: '3px',
          color: '#B8965A',
          textTransform: 'uppercase',
          textAlign: 'center',
          margin: '0 0 16px',
        }}>
          Our Story
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 8,
        }}>
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => setLightbox(i)}
              style={{
                padding: 0,
                border: 'none',
                borderRadius: 8,
                overflow: 'hidden',
                cursor: 'pointer',
                background: 'rgba(44,62,45,0.05)',
                aspectRatio: '1',
                display: 'block',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.image_url}
                alt={photo.caption ?? `Photo ${i + 1}`}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.92)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[lightbox].image_url}
            alt={photos[lightbox].caption ?? `Photo ${lightbox + 1}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '92vw',
              maxHeight: '80vh',
              objectFit: 'contain',
              borderRadius: 8,
            }}
          />

          {photos[lightbox].caption && (
            <p style={{
              position: 'absolute',
              bottom: 32,
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: 15,
              color: 'rgba(255,255,255,0.7)',
              textAlign: 'center',
              width: '100%',
              padding: '0 24px',
              boxSizing: 'border-box',
            }}>
              {photos[lightbox].caption}
            </p>
          )}

          {/* Prev / Next */}
          {photos.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }} style={navBtn('left')}>‹</button>
              <button onClick={(e) => { e.stopPropagation(); next(); }} style={navBtn('right')}>›</button>
            </>
          )}

          {/* Close */}
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 28,
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            ×
          </button>

          {/* Counter */}
          <p style={{
            position: 'absolute',
            top: 24,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: 13,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '1px',
          }}>
            {lightbox + 1} / {photos.length}
          </p>
        </div>
      )}
    </>
  );
}

function navBtn(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute',
    top: '50%',
    [side]: 16,
    transform: 'translateY(-50%)',
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    color: 'white',
    fontSize: 32,
    width: 44,
    height: 44,
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
}
