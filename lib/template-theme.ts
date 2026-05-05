/**
 * TemplateTheme — the visual tokens every template must provide.
 *
 * Section components and the universal RsvpForm consume these tokens
 * instead of hardcoded color/font constants. Each template folder
 * exports a `theme` object conforming to this interface.
 */
export interface TemplateTheme {
  // ── Page ──
  pageBg: string;

  // ── Typography ──
  displayFont: string;
  bodyFont: string;
  fontsUrl: string;
  /** Optional @font-face CSS for self-hosted fonts */
  fontFaceCSS?: string;

  // ── Ink (text hierarchy) ──
  ink: string;
  ink2: string;
  ink3: string;

  // ── Rules / borders ──
  rule: string;
  ruleSoft: string;

  // ── Surfaces (panels, QR bg) ──
  surface: string;
  surfaceBorder: string;

  // ── Hero ──
  heroBg: string;
  heroImgFallback: string;

  // ── Dark sections (schedule, footer, hero text) ──
  sectionDarkBg: string;
  textOnDark: string;
  textOnDarkMuted: string;
  ruleOnDark: string;

  // ── Footer ──
  footerBg: string;
  footerMuted: string;
  footerRule: string;

  // ── Photo treatment ──
  photoFilter: string;

  // ── Placeholders (design preview only) ──
  placeholderMuted: string;
  placeholderMutedOnDark: string;
  placeholderBorder: string;
  placeholderBorderOnDark: string;
  placeholderFill: string;
  placeholderFillOnDark: string;

  // ── RSVP form tokens ──
  primary: string;
  primaryMuted: string;
  primaryContrast: string;
  accent: string;
  cardBg: string;
  border: string;
  surfaceTint: string;
  danger: string;
}

/* ── Layout constants (shared across ALL templates) ────────────────────── */

export const PAD_SECTION =
  'clamp(48px, 14cqi, 110px) clamp(16px, 5cqi, 40px)';
export const PAD_CEREMONY_INNER =
  'clamp(40px, 10cqi, 88px) clamp(16px, 5cqi, 40px) clamp(44px, 11cqi, 96px)';
export const PAD_FOOTER =
  'clamp(40px, 10cqi, 64px) clamp(16px, 5cqi, 40px)';
export const PAD_HERO_META =
  '0 clamp(16px, 5cqi, 40px) clamp(22px, 7cqi, 40px)';
export const GAP_LAYOUT = 'clamp(24px, 8cqi, 60px)';
export const SECTION_MIN_HEIGHT = '88svh';

export const FS_HERO_NAMES = 'clamp(1.45rem, 5.25cqi + 0.55rem, 4.5rem)';
export const FS_DISPLAY_XL = 'clamp(1.65rem, 5cqi + 0.45rem, 3.5rem)';
export const FS_DISPLAY_LG = 'clamp(1.35rem, 4cqi + 0.45rem, 3rem)';
export const FS_DISPLAY_MD = 'clamp(1.15rem, 3.25cqi + 0.5rem, 2.25rem)';
export const FS_FOOTER_TITLE = 'clamp(1.35rem, 3.75cqi + 0.55rem, 2.5rem)';
export const FS_FAQ_INDEX = 'clamp(1.35rem, 5.5cqi, 2rem)';

export const INVITE_ROOT_STYLE = {
  minHeight: '100svh',
  width: '100%',
  maxWidth: '100%',
  overflowX: 'hidden' as const,
  containerType: 'inline-size' as const,
};

/* ── Default RSVP theme (matches current hardcoded RsvpForm values) ──── */

export const DEFAULT_RSVP_THEME: Pick<
  TemplateTheme,
  'primary' | 'primaryMuted' | 'primaryContrast' | 'accent' | 'cardBg' | 'border' | 'surfaceTint' | 'danger' | 'ink' | 'ink2' | 'ink3' | 'displayFont' | 'bodyFont'
> = {
  primary: '#2C3A2E',
  primaryMuted: 'rgba(44,58,46,0.2)',
  primaryContrast: '#F2F0EC',
  accent: '#8B7355',
  cardBg: '#FFFFFF',
  border: '#D4CFC6',
  surfaceTint: 'rgba(44,58,46,0.04)',
  danger: '#C4564A',
  ink: '#2C2C2C',
  ink2: '#6B6560',
  ink3: '#9E9890',
  displayFont: '"Cormorant Garamond", Georgia, serif',
  bodyFont: 'var(--font-caslon, "Libre Caslon Text"), Georgia, serif',
};
