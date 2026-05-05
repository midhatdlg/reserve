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

export const TEMPLATES: InviteTemplate[] = [];

/** Look up a template by ID. Returns undefined if not found. */
export function getTemplate(id: string): InviteTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
