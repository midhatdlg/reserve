import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VenueMap } from './VenueMap';
import type { Wedding } from '@/types';

function makeWedding(overrides: Partial<Wedding> = {}): Wedding {
  return {
    id: 'w1',
    couple_id: 'c1',
    slug: 's',
    title: 'Ada & Ben',
    wedding_date: '2026-09-12',
    venue_name: 'The Old Barn',
    venue_address: '1 High Street, Oxford',
    venue_lat: 51.75,
    venue_lng: -1.25,
    template_id: 't',
    custom_design_url: null,
    video_embed_url: null,
    design_zones: [],
    selected_blocks: [],
    languages: ['en'],
    is_published: true,
    save_the_date_mode: false,
    envelope_enabled: false,
    envelope_wax_color: '#799D7F',
    envelope_initials: null,
    invite_bg_color: '#F5F0E8',
    meal_options: [],
    strict_name_match: true,
    timezone: 'Europe/London',
    template_overrides: {},
    template_content: {},
    settings: {},
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('<VenueMap />', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders nothing without coordinates', () => {
    const { container } = render(
      <VenueMap wedding={makeWedding({ venue_lat: null, venue_lng: null })} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('falls back to a textual placeholder when no Google Maps key is set', () => {
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_MAPS_KEY', '');
    render(<VenueMap wedding={makeWedding()} />);
    expect(screen.getByText('The Old Barn')).toBeInTheDocument();
    expect(screen.getByText('1 High Street, Oxford')).toBeInTheDocument();
  });

  it('renders a static map image when the key is present', () => {
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_MAPS_KEY', 'test-key');
    render(<VenueMap wedding={makeWedding()} />);
    const img = screen.getByAltText(/map showing the old barn/i) as HTMLImageElement;
    expect(img.src).toContain('maps.googleapis.com');
    expect(img.src).toContain('51.75,-1.25');
    expect(img.src).toContain('key=test-key');
  });

  it('always exposes a "Get Directions" link to Google Maps', () => {
    render(<VenueMap wedding={makeWedding()} />);
    const link = screen.getByRole('link', { name: /get directions/i }) as HTMLAnchorElement;
    expect(link.href).toContain('google.com/maps');
    expect(link.href).toContain('destination=51.75,-1.25');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });
});
