/**
 * Pre-designed invite templates.
 *
 * Each template is a background image (artwork only, no text) with
 * pre-configured text zones. The couple picks a template in the dashboard
 * and their names/date/venue render as HTML text on top of the artwork.
 *
 * To add a new template:
 *   1. Design in Canva/Figma with placeholder text
 *   2. Export TWO versions:
 *      - preview:    WITH placeholder text  → public/templates/{id}-preview.png
 *      - background: WITHOUT text (art only) → public/templates/{id}-bg.png
 *   3. Add a config entry below with exact zone positions/fonts to match the design
 */

export interface TemplateZone {
  type: 'couple_names' | 'date' | 'venue' | 'guest_name';
  /** Center X position as percentage (0-100) */
  x: number;
  /** Center Y position as percentage (0-100) */
  y: number;
  /** Width as percentage (0-100) */
  width: number;
  fontFamily: string;
  /** Base font size — rendered using cqi units for responsive scaling */
  fontSize: number;
  fontColor: string;
  fontWeight: string;
  textAlign: 'left' | 'center' | 'right';
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
  letterSpacing?: string;
  fontStyle?: 'normal' | 'italic';
}

export interface InviteTemplate {
  id: string;
  name: string;
  /** Preview image with placeholder text (shown in the template picker) */
  previewUrl: string;
  /** Background image without text (used on the actual invite page) */
  backgroundUrl: string;
  /** Aspect ratio of the template image */
  aspectRatio: string;
  /** Pre-configured text zones matching the original design */
  zones: TemplateZone[];
  /** Google Fonts URL for fonts used by this template */
  fontsUrl: string;
  /** Accent color for UI elements (picker border, etc.) */
  accentColor: string;
}

export const TEMPLATES: InviteTemplate[] = [
  {
    id: 'beige-watercolor',
    name: 'Beige Watercolor',
    previewUrl: '/templates/beige-watercolor-preview.png',
    backgroundUrl: '/templates/beige-watercolor-bg.png',
    aspectRatio: '5 / 7',
    accentColor: '#C4A882',
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Montserrat:wght@300;400&display=swap',
    zones: [
      {
        type: 'couple_names',
        x: 50, y: 38, width: 80,
        fontFamily: 'Cormorant Garamond',
        fontSize: 38,
        fontColor: '#5C4033',
        fontWeight: '400',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: '3px',
      },
      {
        type: 'date',
        x: 50, y: 52, width: 70,
        fontFamily: 'Montserrat',
        fontSize: 12,
        fontColor: '#7A6B5D',
        fontWeight: '300',
        textAlign: 'center',
        letterSpacing: '2px',
        textTransform: 'uppercase',
      },
      {
        type: 'venue',
        x: 50, y: 58, width: 70,
        fontFamily: 'Montserrat',
        fontSize: 11,
        fontColor: '#7A6B5D',
        fontWeight: '300',
        textAlign: 'center',
        letterSpacing: '1px',
      },
    ],
  },
  {
    id: 'minimal-serif',
    name: 'Minimal Serif',
    previewUrl: '/templates/minimal-serif-preview.png',
    backgroundUrl: '/templates/minimal-serif-bg.png',
    aspectRatio: '5 / 7',
    accentColor: '#2C2C2C',
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@300;400&display=swap',
    zones: [
      {
        type: 'couple_names',
        x: 50, y: 40, width: 85,
        fontFamily: 'Playfair Display',
        fontSize: 44,
        fontColor: '#1A1A1A',
        fontWeight: '400',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: '4px',
      },
      {
        type: 'date',
        x: 50, y: 54, width: 70,
        fontFamily: 'Montserrat',
        fontSize: 13,
        fontColor: '#666666',
        fontWeight: '300',
        textAlign: 'center',
        letterSpacing: '2px',
      },
      {
        type: 'venue',
        x: 50, y: 60, width: 70,
        fontFamily: 'Montserrat',
        fontSize: 12,
        fontColor: '#666666',
        fontWeight: '300',
        textAlign: 'center',
      },
    ],
  },
  {
    id: 'sage-garden',
    name: 'Sage Garden',
    previewUrl: '/templates/sage-garden-preview.png',
    backgroundUrl: '/templates/sage-garden-bg.png',
    aspectRatio: '5 / 7',
    accentColor: '#6B7F5E',
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap',
    zones: [
      {
        type: 'couple_names',
        x: 50, y: 42, width: 80,
        fontFamily: 'Cormorant Garamond',
        fontSize: 40,
        fontColor: '#2C3E2D',
        fontWeight: '400',
        textAlign: 'center',
        fontStyle: 'italic',
      },
      {
        type: 'date',
        x: 50, y: 55, width: 70,
        fontFamily: 'Cormorant Garamond',
        fontSize: 15,
        fontColor: '#4A5D4B',
        fontWeight: '400',
        textAlign: 'center',
        letterSpacing: '2px',
        textTransform: 'uppercase',
      },
      {
        type: 'venue',
        x: 50, y: 62, width: 70,
        fontFamily: 'Cormorant Garamond',
        fontSize: 14,
        fontColor: '#4A5D4B',
        fontWeight: '400',
        textAlign: 'center',
      },
    ],
  },
  {
    id: 'midnight-gold',
    name: 'Midnight Gold',
    previewUrl: '/templates/midnight-gold-preview.png',
    backgroundUrl: '/templates/midnight-gold-bg.png',
    aspectRatio: '5 / 7',
    accentColor: '#C5A55A',
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Montserrat:wght@300;400&display=swap',
    zones: [
      {
        type: 'couple_names',
        x: 50, y: 40, width: 85,
        fontFamily: 'Cormorant Garamond',
        fontSize: 42,
        fontColor: '#C5A55A',
        fontWeight: '400',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: '4px',
      },
      {
        type: 'date',
        x: 50, y: 54, width: 70,
        fontFamily: 'Montserrat',
        fontSize: 12,
        fontColor: '#D4C8A8',
        fontWeight: '300',
        textAlign: 'center',
        letterSpacing: '2px',
        textTransform: 'uppercase',
      },
      {
        type: 'venue',
        x: 50, y: 60, width: 70,
        fontFamily: 'Montserrat',
        fontSize: 11,
        fontColor: '#D4C8A8',
        fontWeight: '300',
        textAlign: 'center',
      },
    ],
  },
];

/** Look up a template by ID. Returns undefined if not found. */
export function getTemplate(id: string): InviteTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
