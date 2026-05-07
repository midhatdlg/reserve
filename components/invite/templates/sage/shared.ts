/**
 * Sage palette — deep botanical/garden aesthetic.
 *
 * Reference: Green Design.pdf — sage page background with cream highlight panels,
 * elegant Cormorant Garamond serif typography, and full-color botanical photography.
 *
 * Where the monochrome theme is editorial black/white with grayscale photos,
 * the sage theme leans warm-organic: forest-green ground, cream accents,
 * line-art floral decorations, and unfiltered color photography.
 */

/* ── Core palette ──────────────────────────────────────────────────────── */

/** Sage page background — deep, slightly desaturated forest green */
export const SAGE_DEEP = '#5C6B5A';
/** Hero band — slightly deeper sage to match the reference mock */
export const SAGE_HERO_BG = '#4b5d44';
/** Slightly lighter sage for contrast surfaces (cards on sage) */
export const SAGE_MID = '#6E7C6B';
/** Cream paper — surfaces that contrast against sage */
export const CREAM_PAPER = '#E8E4D8';
/** Cream highlight — slightly warmer than paper */
export const CREAM_LIGHT = '#EFECE2';
/** Sky blue accent for landscape illustration backgrounds */
export const SKY_BLUE = '#C9DEEA';

/** Text on sage (cream/off-white tones) */
export const INK_ON_SAGE = '#EFECE2';
export const INK_ON_SAGE_2 = 'rgba(239,236,226,0.78)';
export const INK_ON_SAGE_3 = 'rgba(239,236,226,0.55)';

/** Text on cream (deep sage tones) */
export const INK_ON_CREAM = '#3F4A3D';
export const INK_ON_CREAM_2 = '#5C6B5A';
export const INK_ON_CREAM_3 = '#8A9486';

/** Hairline rules */
export const RULE_ON_SAGE = 'rgba(239,236,226,0.22)';
export const RULE_SOFT_ON_SAGE = 'rgba(239,236,226,0.12)';
export const RULE_ON_CREAM = 'rgba(63,74,61,0.22)';
export const RULE_SOFT_ON_CREAM = 'rgba(63,74,61,0.10)';

/* ── Typography ────────────────────────────────────────────────────────── */

/** Editorial serif — uppercase headings + italic flourishes */
export const DISPLAY_FONT = '"Cormorant Garamond", Georgia, serif';
/** Body — paired with display for a single-family editorial feel */
export const BODY_FONT = 'var(--font-caslon, "Libre Caslon Text"), Georgia, serif';
/** Loaded globally via app/layout.tsx — kept here for parity with other templates */
export const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Great+Vibes&family=Libre+Caslon+Text:ital,wght@0,400;1,400&display=swap';

/** Script face for the sage hero tagline (loaded via FONTS_URL) */
export const SCRIPT_FONT = '"Great Vibes", cursive';
/** Display font for sage hero names — Argue (self-hosted) */
export const SAGE_HERO_DISPLAY_FONT = '"Argue", Georgia, serif';
/** @font-face CSS for the Argue hero font */
export const SAGE_HERO_FONT_FACE = `
@font-face {
  font-family: 'Argue';
  src: url('/fonts/Argue-DEMO.otf') format('opentype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}`;

/* ── Photo treatment ───────────────────────────────────────────────────── */

/**
 * Sage uses unfiltered color photography (the PDF reference shows full-color
 * couple photo paired with sage panels). A subtle warmth/contrast lift keeps
 * photos from looking flat next to the cream surfaces.
 */
export const SAGE_PHOTO_FILTER = 'saturate(0.92) contrast(1.02)';

/* ── Asset paths ───────────────────────────────────────────────────────── */

/** Line-art botanical + dragonfly (hero, top-left over optional hero photo) — RGBA */
export const SAGE_HERO_BOTANICAL_TL_URL = '/templates/sage/hero-botanical-tl.png';
/** Trees + butterfly sketch (hero, bottom right) — RGBA, transparent ground */
export const SAGE_HERO_LANDSCAPE_BR_URL = '/templates/sage/hero-landscape-br.png';

/** Stylized hill/cloud landscape (extracted from the reference PDF) */
export const LANDSCAPE_TILE_URL = '/templates/sage/landscape-tile.png';

/* ── Theme object (consumed by shared section components) ─────────────── */

import type { TemplateTheme } from '@/lib/template-theme';

export const theme: TemplateTheme = {
  pageBg: SAGE_DEEP,
  displayFont: DISPLAY_FONT,
  bodyFont: BODY_FONT,
  fontsUrl: FONTS_URL,

  /* Type hierarchy on sage page sections (Ceremony, Schedule, Gift) */
  ink: INK_ON_SAGE,
  ink2: INK_ON_SAGE_2,
  ink3: INK_ON_SAGE_3,
  rule: RULE_ON_SAGE,
  ruleSoft: RULE_SOFT_ON_SAGE,

  /* Inset cream panels (e.g. QR background) */
  surface: CREAM_PAPER,
  surfaceBorder: 'rgba(63,74,61,0.18)',

  /* Hero — sage panel; if no photo uploaded, fall back to a slightly darker sage */
  heroBg: SAGE_DEEP,
  heroImgFallback: '#4F5C4D',

  /* "Dark" inverse sections — kept on the sage spectrum so the whole invite
     reads as cohesive (no jarring jet-black panels mid-flow) */
  sectionDarkBg: '#4A574A',
  textOnDark: INK_ON_SAGE,
  textOnDarkMuted: INK_ON_SAGE_2,
  ruleOnDark: RULE_ON_SAGE,

  /* Footer */
  footerBg: SAGE_DEEP,
  footerMuted: INK_ON_SAGE_2,
  footerRule: RULE_ON_SAGE,

  photoFilter: SAGE_PHOTO_FILTER,

  /* Design-preview placeholders (dashboard editor only) */
  placeholderMuted: 'rgba(239,236,226,0.55)',
  placeholderMutedOnDark: 'rgba(239,236,226,0.55)',
  placeholderBorder: '1px dashed rgba(239,236,226,0.32)',
  placeholderBorderOnDark: '1px dashed rgba(239,236,226,0.32)',
  placeholderFill: 'rgba(239,236,226,0.06)',
  placeholderFillOnDark: 'rgba(239,236,226,0.06)',

  /* RSVP form tokens — used by the universal RsvpForm component */
  primary: CREAM_PAPER,
  primaryMuted: 'rgba(232,228,216,0.28)',
  primaryContrast: SAGE_DEEP,
  accent: CREAM_LIGHT,
  cardBg: CREAM_PAPER,
  border: 'rgba(63,74,61,0.18)',
  surfaceTint: 'rgba(239,236,226,0.06)',
  danger: '#C4564A',
};
