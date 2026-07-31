export type WizardState = {
  name1: string;
  name2: string;
  weddingDate: string;
  venueName: string;
  venueAddress: string;
  timezone: string;
  slug: string;
};

export const DEFAULT_SELECTED_BLOCKS = ['rsvp', 'itinerary', 'table', 'qna', 'countdown'];
export const DEFAULT_LANGUAGES = ['en'];

export function sanitizeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function slugFromNames(name1: string, name2: string): string {
  const clean = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '');
  const a = clean(name1);
  const b = clean(name2);
  if (!a && !b) return '';
  if (!a) return b;
  if (!b) return a;
  return `${a}-and-${b}`;
}
