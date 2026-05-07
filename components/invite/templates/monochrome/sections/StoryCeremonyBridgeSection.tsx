import type { Photo } from '@/types';
import type { TemplateTheme } from '@/lib/template-theme';
import { SECTION_MIN_HEIGHT } from '@/lib/template-theme';
import { PhotoDropHint } from './Placeholders';

interface Props {
  theme: TemplateTheme;
  photo1: Photo | undefined;
  photo2: Photo | undefined;
  showPlaceholders?: boolean;
}

export function StoryCeremonyBridgeSection({
  theme: t,
  photo1,
  photo2,
  showPlaceholders = false,
}: Props) {
  const hasLeft = Boolean(photo1) || showPlaceholders;
  const hasRight = Boolean(photo2) || showPlaceholders;

  if (!hasLeft && !hasRight) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .tl-bridge{display:flex;flex-direction:column;}
        @container(min-width:600px){.tl-bridge{flex-direction:row;}}
      `}} />
      <section
        className="tl-bridge"
        style={{
          width: '100%',
          minHeight: SECTION_MIN_HEIGHT,
        }}
      >
        {/* Left — couple photo (cover) */}
        <div style={{ flex: '1 1 50%', minHeight: 'clamp(300px, 50svh, 560px)' }}>
          {photo1 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo1.image_url}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                filter: t.photoFilter,
              }}
            />
          ) : showPlaceholders ? (
            <PhotoDropHint
              theme={t}
              label="Before ceremony (1) — Design → Photos"
              style={{ width: '100%', height: '100%', minHeight: 'clamp(300px, 50svh, 560px)' }}
            />
          ) : null}
        </div>

        {/* Right — dark panel with centered asset/illustration */}
        <div style={{
          flex: '1 1 50%',
          background: t.sectionDarkBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'clamp(300px, 50svh, 560px)',
        }}>
          {photo2 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo2.image_url}
              alt=""
              style={{
                maxWidth: '65%',
                maxHeight: '65%',
                objectFit: 'contain',
                display: 'block',
                filter: t.photoFilter,
              }}
            />
          ) : showPlaceholders ? (
            <PhotoDropHint
              theme={t}
              surface="dark"
              label="Illustration / asset — Design → Photos"
              style={{ width: '60%', minHeight: 'clamp(160px, 30svh, 320px)' }}
            />
          ) : null}
        </div>
      </section>
    </>
  );
}
