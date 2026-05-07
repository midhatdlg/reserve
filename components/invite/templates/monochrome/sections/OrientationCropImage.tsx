'use client';

import { useState, useCallback } from 'react';

interface Props {
  src: string;
  alt?: string;
  photoFilter?: string;
  /** Aspect ratio for portrait images */
  portraitRatio?: string;
  /** Aspect ratio for landscape images */
  landscapeRatio?: string;
}

export function OrientationCropImage({
  src,
  alt = '',
  photoFilter,
  portraitRatio = '3 / 4',
  landscapeRatio = '4 / 3',
}: Props) {
  const [ratio, setRatio] = useState(portraitRatio);

  const onLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setRatio(img.naturalWidth > img.naturalHeight ? landscapeRatio : portraitRatio);
  }, [portraitRatio, landscapeRatio]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onLoad={onLoad}
      style={{
        width: '100%',
        aspectRatio: ratio,
        objectFit: 'cover',
        display: 'block',
        filter: photoFilter,
      }}
    />
  );
}
