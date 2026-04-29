import type { Photo } from '@/types';

interface Props {
  photo: Photo | undefined;
}

export function FullWidthPhoto({ photo }: Props) {
  if (!photo) return null;

  return (
    <section style={{ width: '100%', lineHeight: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.image_url}
        alt=""
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: '70vh',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    </section>
  );
}
