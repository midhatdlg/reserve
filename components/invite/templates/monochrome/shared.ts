/**
 * Monochrome palette — black, white, neutral paper (PDF reference: minimalist B/W + beige paper).
 * All UI chrome stays achromatic; photos use MONOCHROME_PHOTO_FILTER for editorial consistency.
 */
export const BG_PAGE = '#E8E6E2';
export const WHITE = '#FFFFFF';
export const BLACK = '#000000';

/** Primary headings / rules */
export const INK = '#000000';
/** Body copy */
export const INK_2 = '#3A3A3A';
/** Captions, icons, numbers */
export const INK_3 = '#6B6B6B';

export const RULE = 'rgba(0,0,0,0.14)';
export const RULE_SOFT = 'rgba(0,0,0,0.08)';
/** QR / inset panels on paper */
export const SURFACE = 'rgba(255,255,255,0.72)';
export const SURFACE_BORDER = 'rgba(0,0,0,0.12)';

export const HERO_BG = '#000000';
export const HERO_IMG_FALLBACK = '#141414';

export const FOOTER_BG = '#000000';
export const FOOTER_MUTED = 'rgba(255,255,255,0.55)';
export const FOOTER_RULE = 'rgba(255,255,255,0.14)';

/** Full-bleed inverse sections (Schedule reference: black panel + white type) */
export const BG_SECTION_DARK = '#000000';
export const RULE_ON_DARK = 'rgba(255,255,255,0.28)';
export const TEXT_ON_DARK = '#FFFFFF';
export const TEXT_ON_DARK_MUTED = 'rgba(255,255,255,0.82)';

/** Applied to photography so the site reads as monochrome like the PDF */
export const MONOCHROME_PHOTO_FILTER = 'grayscale(100%) contrast(1.06)';

export const DISPLAY_FONT = '"NewYork", Georgia, serif';
export const BODY_FONT = '"Montserrat", "Helvetica Neue", sans-serif';
export const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600&display=swap';
export const DISPLAY_FONT_FACE = `@font-face{font-family:'NewYork';src:url('/fonts/NewYork.otf') format('opentype');font-weight:400;font-style:normal;font-display:swap;}`;

/**
 * ── Fluid layout (mobile ↔ desktop) ─────────────────────────────────────
 * MonochromeInvite sets `containerType: 'inline-size'` on the root.
 * We use `cqi` (1% of container width) so type & spacing shrink on narrow
 * phones instead of hitting large `vw`/`px` floors — matching desktop proportions.
 */
export const INVITE_ROOT_STYLE = {
  minHeight: '100svh',
  background: BG_PAGE,
  width: '100%',
  maxWidth: '100%',
  overflowX: 'hidden' as const,
  containerType: 'inline-size' as const,
};

/** Each main block fills most of the viewport so guests scroll section-by-section */
export const SECTION_MIN_HEIGHT = '88svh';

/** Section padding: vertical / horizontal */
export const PAD_SECTION =
  'clamp(48px, 14cqi, 110px) clamp(16px, 5cqi, 40px)';
/** Ceremony content block (slightly tighter top when below banner) */
export const PAD_CEREMONY_INNER =
  'clamp(40px, 10cqi, 88px) clamp(16px, 5cqi, 40px) clamp(44px, 11cqi, 96px)';
export const PAD_FOOTER = 'clamp(40px, 10cqi, 64px) clamp(16px, 5cqi, 40px)';
/** Gap between columns in split layouts */
export const GAP_LAYOUT = 'clamp(24px, 8cqi, 60px)';
/** Hero meta row padding */
export const PAD_HERO_META = '0 clamp(16px, 5cqi, 40px) clamp(22px, 7cqi, 40px)';

/** Hero couple names */
export const FS_HERO_NAMES = 'clamp(1.45rem, 5.25cqi + 0.55rem, 4.5rem)';
/** Large stacked display (Love Story, FAQ title blocks) */
export const FS_DISPLAY_XL = 'clamp(1.65rem, 5cqi + 0.45rem, 3.5rem)';
/** Section titles (Ceremony, Schedule, FAQ aside) */
export const FS_DISPLAY_LG = 'clamp(1.35rem, 4cqi + 0.45rem, 3rem)';
/** Gift quote line */
export const FS_DISPLAY_MD = 'clamp(1.15rem, 3.25cqi + 0.5rem, 2.25rem)';
/** Footer “TOUCH” */
export const FS_FOOTER_TITLE = 'clamp(1.35rem, 3.75cqi + 0.55rem, 2.5rem)';
/** FAQ numbering */
export const FS_FAQ_INDEX = 'clamp(1.35rem, 5.5cqi, 2rem)';

/** Design preview only — dashed slots & copy hints (not shown on published invites) */
export const PLACEHOLDER_MUTED = 'rgba(0,0,0,0.42)';
export const PLACEHOLDER_MUTED_ON_DARK = 'rgba(255,255,255,0.48)';
export const PLACEHOLDER_BORDER = '1px dashed rgba(0,0,0,0.22)';
export const PLACEHOLDER_BORDER_ON_DARK = '1px dashed rgba(255,255,255,0.38)';
export const PLACEHOLDER_FILL = 'rgba(0,0,0,0.045)';
export const PLACEHOLDER_FILL_ON_DARK = 'rgba(255,255,255,0.07)';

/* ── Theme object (consumed by shared section components) ────────────── */

import type { TemplateTheme } from '@/lib/template-theme';

export const theme: TemplateTheme = {
  pageBg: BG_PAGE,
  displayFont: DISPLAY_FONT,
  bodyFont: BODY_FONT,
  fontsUrl: FONTS_URL,
  fontFaceCSS: DISPLAY_FONT_FACE,
  ink: INK,
  ink2: INK_2,
  ink3: INK_3,
  rule: RULE,
  ruleSoft: RULE_SOFT,
  surface: SURFACE,
  surfaceBorder: SURFACE_BORDER,
  heroBg: HERO_BG,
  heroImgFallback: HERO_IMG_FALLBACK,
  sectionDarkBg: BG_SECTION_DARK,
  textOnDark: TEXT_ON_DARK,
  textOnDarkMuted: TEXT_ON_DARK_MUTED,
  ruleOnDark: RULE_ON_DARK,
  footerBg: FOOTER_BG,
  footerMuted: FOOTER_MUTED,
  footerRule: FOOTER_RULE,
  photoFilter: MONOCHROME_PHOTO_FILTER,
  placeholderMuted: PLACEHOLDER_MUTED,
  placeholderMutedOnDark: PLACEHOLDER_MUTED_ON_DARK,
  placeholderBorder: PLACEHOLDER_BORDER,
  placeholderBorderOnDark: PLACEHOLDER_BORDER_ON_DARK,
  placeholderFill: PLACEHOLDER_FILL,
  placeholderFillOnDark: PLACEHOLDER_FILL_ON_DARK,
  // RSVP
  primary: BLACK,
  primaryMuted: 'rgba(0,0,0,0.18)',
  primaryContrast: WHITE,
  accent: INK_3,
  cardBg: 'rgba(255,255,255,0.72)',
  border: 'rgba(0,0,0,0.12)',
  surfaceTint: 'rgba(0,0,0,0.03)',
  danger: '#C4564A',
};
