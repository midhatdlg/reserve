import type { Photo } from '@/types';
import type { TemplateTheme } from '@/lib/template-theme';
import { PhotoDropHint } from './Placeholders';

interface Props {
  theme: TemplateTheme;
  photo: Photo | undefined;
  showPlaceholders?: boolean;
  placeholderLabel?: string;
}

export function FullBleedPhotoSection({
  theme: t,
  photo,
  showPlaceholders = false,
  placeholderLabel = 'Full-width photo — Design → Photos',
}: Props) {
  if (!photo && !showPlaceholders) return null;

  return (
    <section style={{ width: '100%', lineHeight: 0 }}>
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
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
      ) : showPlaceholders ? (
        <PhotoDropHint
          theme={t}
          label={placeholderLabel}
          style={{ width: '100%', height: 'clamp(280px, 50svh, 560px)' }}
        />
      ) : null}
    </section>
  );
}
