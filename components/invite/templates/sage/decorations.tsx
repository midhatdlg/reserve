/**
 * Sage decorations — line-art botanical SVGs and the landscape tile asset.
 *
 * Decorations are intentionally drawn at neutral stroke widths and accept a
 * `color` prop so they can sit on cream surfaces (deep sage stroke) or sage
 * surfaces (cream stroke) with no extra config.
 */

import type { CSSProperties } from 'react';
import { LANDSCAPE_TILE_URL } from './shared';

interface DecorationProps {
  /** Stroke color. Defaults to currentColor so parent CSS can drive it. */
  color?: string;
  size?: number;
  style?: CSSProperties;
  className?: string;
}

/**
 * Small leafy stem with a single bud — used as a hero corner accent.
 */
export function BotanicalSprig({ color = 'currentColor', size = 120, style, className }: DecorationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      stroke={color}
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      className={className}
      aria-hidden="true"
    >
      <path d="M22 18 C 32 38, 44 56, 60 72 C 72 84, 84 92, 96 96" />
      <path d="M30 28 C 40 26, 48 30, 50 40 C 44 44, 36 42, 30 28 Z" />
      <path d="M40 44 C 50 42, 58 46, 60 56 C 54 60, 46 58, 40 44 Z" />
      <path d="M52 60 C 64 58, 72 64, 72 74 C 64 78, 56 74, 52 60 Z" />
      <path d="M68 78 C 80 76, 86 82, 84 92 C 76 94, 70 90, 68 78 Z" />
      <circle cx="22" cy="14" r="4" />
      <path d="M22 18 L 22 14" />
      <path d="M16 12 C 18 8, 26 8, 28 12" />
    </svg>
  );
}

/**
 * Larger trailing branch with multiple leaves — paired with the hero on the
 * opposite corner from BotanicalSprig.
 */
export function BotanicalBranch({ color = 'currentColor', size = 160, style, className }: DecorationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      stroke={color}
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      className={className}
      aria-hidden="true"
    >
      <path d="M138 18 C 120 38, 100 60, 78 80 C 56 100, 36 116, 18 128" />
      <path d="M126 30 C 134 24, 142 26, 144 36 C 138 42, 128 40, 126 30 Z" />
      <path d="M108 50 C 118 44, 128 48, 128 60 C 120 66, 108 62, 108 50 Z" />
      <path d="M88 72 C 100 66, 110 72, 108 84 C 98 88, 86 84, 88 72 Z" />
      <path d="M66 92 C 78 86, 88 92, 86 104 C 76 108, 64 104, 66 92 Z" />
      <path d="M44 110 C 56 104, 66 110, 64 122 C 54 126, 42 122, 44 110 Z" />
      <path d="M138 18 C 134 12, 138 8, 144 10" />
      <circle cx="146" cy="12" r="3" />
    </svg>
  );
}

/**
 * Line-art rose — stylized open bloom with a few leaves on the stem. Used
 * behind the FAQS headline and on the love-story letter card.
 */
export function RoseLine({ color = 'currentColor', size = 140, style, className }: DecorationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      fill="none"
      stroke={color}
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      className={className}
      aria-hidden="true"
    >
      {/* Rose head — concentric spirals */}
      <circle cx="56" cy="48" r="26" />
      <path d="M56 48 C 50 40, 52 32, 60 30 C 68 32, 72 40, 68 48 C 64 54, 56 54, 56 48 Z" />
      <path d="M56 48 C 64 46, 70 50, 70 58 C 66 64, 58 64, 54 58 C 52 54, 52 50, 56 48 Z" />
      <path d="M52 44 C 44 44, 40 50, 42 58 C 48 62, 56 60, 56 54" />
      <path d="M60 38 C 66 38, 70 42, 70 48" />
      <path d="M44 52 C 40 56, 42 62, 48 64" />
      <path d="M62 52 C 66 56, 64 62, 58 64" />
      {/* Stem */}
      <path d="M56 74 C 56 88, 60 100, 70 116" />
      {/* Leaves */}
      <path d="M56 84 C 44 82, 36 86, 34 96 C 42 100, 52 96, 56 84 Z" />
      <path d="M62 102 C 74 100, 84 104, 86 114 C 78 118, 66 114, 62 102 Z" />
      {/* Sepal/calyx ticks */}
      <path d="M48 70 L 46 78" />
      <path d="M64 70 L 66 78" />
    </svg>
  );
}

/**
 * Butterfly with a small flower beside it — used at the bottom-right of the
 * love-story letter card.
 */
export function ButterflyBloom({ color = 'currentColor', size = 130, style, className }: DecorationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 130 130"
      fill="none"
      stroke={color}
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      className={className}
      aria-hidden="true"
    >
      {/* Butterfly body */}
      <path d="M50 32 L 50 78" />
      <circle cx="50" cy="28" r="2" />
      <path d="M48 26 L 44 20" />
      <path d="M52 26 L 56 20" />
      {/* Upper wings */}
      <path d="M50 38 C 30 30, 14 36, 12 54 C 22 58, 38 56, 50 50 Z" />
      <path d="M50 38 C 70 30, 86 36, 88 54 C 78 58, 62 56, 50 50 Z" />
      {/* Lower wings */}
      <path d="M50 54 C 36 60, 24 70, 28 80 C 38 80, 48 72, 50 64 Z" />
      <path d="M50 54 C 64 60, 76 70, 72 80 C 62 80, 52 72, 50 64 Z" />
      {/* Wing dot accents */}
      <circle cx="28" cy="46" r="2" />
      <circle cx="72" cy="46" r="2" />
      {/* Flower beside butterfly */}
      <circle cx="100" cy="86" r="6" />
      <path d="M100 86 m 0 -6 a 5 5 0 1 1 0 12" />
      <path d="M100 86 m -6 0 a 5 5 0 1 1 12 0" />
      <circle cx="100" cy="86" r="2" />
      <path d="M100 92 C 100 102, 96 110, 90 116" />
      <path d="M100 100 C 108 100, 114 96, 116 90" />
    </svg>
  );
}

/**
 * Landscape tile — re-renders the cloud/hill illustration extracted from the
 * reference PDF as an inline raster (kept aspect-correct via object-fit).
 *
 * Use as a decorative inset (e.g., bottom-right of footer, photo grid tiles).
 */
export function LandscapeTile({
  width = '100%',
  height = '100%',
  rounded = false,
  style,
}: {
  width?: number | string;
  height?: number | string;
  rounded?: boolean;
  style?: CSSProperties;
}) {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={LANDSCAPE_TILE_URL}
      alt=""
      style={{
        width,
        height,
        objectFit: 'cover',
        display: 'block',
        borderRadius: rounded ? 4 : 0,
        ...style,
      }}
    />
  );
}
