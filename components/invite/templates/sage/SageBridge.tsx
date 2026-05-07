/**
 * SageBridge — photo tile grid that mimics the reference layout:
 *
 *   ┌────────┐ ┌────────┐ ┌────────┐
 *   │  L1    │ │  L2    │ │  L3    │     <-- 3 large landscape tiles
 *   └────────┘ └────────┘ └────────┘
 *                              ┌──────┐
 *                              │ L4   │   <-- offset accent tile
 *                              └──────┘
 *
 * The tiles preferentially show user-uploaded photos (story_ceremony_1,
 * story_ceremony_2). Empty slots fall back to the stylized cloud/hill
 * landscape illustration so the section never collapses to dead space.
 */

import type { Photo } from '@/types';
import type { TemplateTheme } from '@/lib/template-theme';
import { LandscapeTile, BotanicalSprig } from './decorations';

interface Props {
  theme: TemplateTheme;
  photo1: Photo | undefined;
  photo2: Photo | undefined;
  showPlaceholders?: boolean;
}

export function SageBridge({ theme: t, photo1, photo2, showPlaceholders = false }: Props) {
  const hasAnyPhoto = Boolean(photo1) || Boolean(photo2);
  if (!hasAnyPhoto && !showPlaceholders) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .tl-sage-bridge{
          position:relative;
          background:${t.pageBg};
          padding:clamp(56px,12cqi,96px) clamp(24px,6cqi,56px) clamp(72px,14cqi,120px);
        }
        .tl-sage-bridge-inner{
          position:relative;
          max-width:1100px;
          margin:0 auto;
        }
        .tl-sage-bridge-row{
          display:grid;
          grid-template-columns:1fr;
          gap:clamp(14px,3cqi,22px);
        }
        @container(min-width:600px){
          .tl-sage-bridge-row{grid-template-columns:repeat(3,1fr);}
        }
        .tl-sage-bridge-tile{
          aspect-ratio:4/3;
          overflow:hidden;
          background:${t.pageBg};
          box-shadow:0 6px 18px rgba(34,44,32,0.18);
        }
        .tl-sage-bridge-accent{
          margin-top:clamp(18px,4cqi,28px);
          display:flex;
          justify-content:flex-end;
        }
        .tl-sage-bridge-accent > div{
          width:42%;
          max-width:280px;
          aspect-ratio:4/3;
          overflow:hidden;
          box-shadow:0 6px 18px rgba(34,44,32,0.18);
          background:${t.pageBg};
        }
        .tl-sage-bridge-sprig{
          position:absolute;
          left:clamp(-8px,-1.5cqi,-4px);
          top:30%;
          width:clamp(72px,16cqi,140px);
          height:auto;
          opacity:0.45;
          pointer-events:none;
        }
      `}} />
      <section className="tl-sage-bridge">
        <BotanicalSprig color={t.textOnDark} className="tl-sage-bridge-sprig" />
        <div className="tl-sage-bridge-inner">
          <div className="tl-sage-bridge-row">
            <BridgeTile photo={photo1} theme={t} />
            <BridgeTile photo={undefined} theme={t} />
            <BridgeTile photo={photo2} theme={t} />
          </div>
          <div className="tl-sage-bridge-accent">
            <div>
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

function BridgeTile({ photo, theme: t }: { photo: Photo | undefined; theme: TemplateTheme }) {
  return (
    <div className="tl-sage-bridge-tile">
      {photo ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={photo.image_url}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            filter: t.photoFilter,
          }}
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
