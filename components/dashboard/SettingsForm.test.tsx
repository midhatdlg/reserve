import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsForm } from './SettingsForm';
import type { Wedding, Couple } from '@/types';

const updatePayloads: Array<{ table: string; patch: Record<string, unknown>; id: string }> = [];

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: (table: string) => ({
      update: (patch: Record<string, unknown>) => ({
        eq: async (_col: string, id: string) => {
          updatePayloads.push({ table, patch, id });
          return { error: null };
        },
      }),
      delete: () => ({ eq: async () => ({ error: null }) }),
    }),
  }),
}));

function makeWedding(overrides: Partial<Wedding> = {}): Wedding {
  return {
    id: 'w1',
    couple_id: 'c1',
    slug: 'ada-and-ben',
    title: 'Ada & Ben',
    wedding_date: '2026-09-12',
    venue_name: null,
    venue_address: null,
    venue_lat: null,
    venue_lng: null,
    template_id: 't1',
    custom_design_url: null,
    video_embed_url: null,
    design_zones: [],
    selected_blocks: ['countdown', 'rsvp'],
    languages: ['en'],
    is_published: true,
    save_the_date_mode: false,
    envelope_enabled: false,
    envelope_wax_color: '#799D7F',
    envelope_initials: null,
    invite_bg_color: '#F5F0E8',
    meal_options: ['Fish', 'Chicken'],
    strict_name_match: true,
    timezone: 'Europe/London',
    template_overrides: {},
    template_content: {},
    settings: {},
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

const couple: Couple = {
  id: 'c1', email: 'c@e.com', name_1: 'Ada', name_2: 'Ben',
  plan_tier: 'standard', stripe_customer_id: null, created_at: new Date().toISOString(),
};

describe('<SettingsForm /> timezone + strict name match', () => {
  beforeEach(() => {
    updatePayloads.length = 0;
  });

  it('prefills the timezone input from the wedding', () => {
    render(<SettingsForm wedding={makeWedding({ timezone: 'America/New_York' })} couple={couple} upgraded={false} />);
    const tz = screen.getByLabelText(/^timezone$/i) as HTMLInputElement;
    expect(tz.value).toBe('America/New_York');
  });

  it('shows an inline error and disables Save when the timezone is invalid', async () => {
    render(<SettingsForm wedding={makeWedding()} couple={couple} upgraded={false} />);
    const tz = screen.getByLabelText(/^timezone$/i);
    const user = userEvent.setup();
    await user.clear(tz);
    await user.type(tz, 'Not/A/Zone');

    expect(tz).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent(/valid iana timezone/i);

    // The Save button in the Wedding Details section should be disabled
    const saveButtons = screen.getAllByRole('button', { name: /^save$/i });
    // First Save corresponds to Wedding Details section
    expect(saveButtons[0]).toBeDisabled();
  });

  it('includes `timezone` in the update payload when saving wedding details', async () => {
    render(<SettingsForm wedding={makeWedding({ timezone: 'UTC' })} couple={couple} upgraded={false} />);
    const user = userEvent.setup();
    const tz = screen.getByLabelText(/^timezone$/i);
    await user.clear(tz);
    await user.type(tz, 'Europe/Paris');

    const saveButtons = screen.getAllByRole('button', { name: /^save$/i });
    await user.click(saveButtons[0]);

    const call = updatePayloads.find((c) => c.table === 'weddings' && 'timezone' in c.patch);
    expect(call?.patch.timezone).toBe('Europe/Paris');
  });

  it('renders a "Strict name matching" toggle and writes the value when saved', async () => {
    render(<SettingsForm wedding={makeWedding({ strict_name_match: true })} couple={couple} upgraded={false} />);
    const toggle = screen.getByRole('switch', { name: /strict name matching/i });
    expect(toggle).toHaveAttribute('aria-checked', 'true');

    const user = userEvent.setup();
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    const saveButtons = screen.getAllByRole('button', { name: /^save$/i });
    await user.click(saveButtons[saveButtons.length - 1]);

    const call = updatePayloads.find((c) => c.table === 'weddings' && 'strict_name_match' in c.patch);
    expect(call?.patch.strict_name_match).toBe(false);
  });

  it('defaults the strict toggle to ON when the field is missing on legacy rows', () => {
    render(
      <SettingsForm
        wedding={makeWedding({ strict_name_match: undefined as unknown as boolean })}
        couple={couple}
        upgraded={false}
      />
    );
    expect(screen.getByRole('switch', { name: /strict name matching/i })).toHaveAttribute('aria-checked', 'true');
  });
});
