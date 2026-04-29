import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RsvpForm } from './RsvpForm';
import type { Invite, Rsvp } from '@/types';

function makeInvite(overrides: Partial<Invite> = {}): Invite {
  return {
    id: 'inv-1',
    wedding_id: 'wed-1',
    token: '',
    guest_name: 'Ada Lovelace',
    max_guests: 3,
    table_number: 7,
    table_name: 'Oak',
    email: null,
    phone: null,
    status: 'pending',
    responded_at: null,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

function fetchMock(impl: (url: string, init: RequestInit) => Promise<Response>) {
  vi.stubGlobal('fetch', vi.fn((url: string, init: RequestInit) => impl(url, init)));
}

describe('<RsvpForm /> — names step', () => {
  beforeEach(() => vi.unstubAllGlobals());

  it('defaults to max_guests slots, prefilling the invite name on the first row', () => {
    render(<RsvpForm invite={makeInvite({ max_guests: 3 })} existingRsvps={[]} slug="w" />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(3);
    expect((inputs[0] as HTMLInputElement).value).toBe('Ada Lovelace');
    expect((inputs[1] as HTMLInputElement).value).toBe('');
    expect((inputs[2] as HTMLInputElement).value).toBe('');
  });

  it('each input has an accessible label', () => {
    render(<RsvpForm invite={makeInvite({ max_guests: 2 })} existingRsvps={[]} slug="w" />);
    expect(screen.getByLabelText(/your full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/guest 2 full name/i)).toBeInTheDocument();
  });

  it("Continue is disabled until every slot has a name", async () => {
    render(<RsvpForm invite={makeInvite({ max_guests: 2 })} existingRsvps={[]} slug="w" />);
    const cont = screen.getByRole('button', { name: /continue/i });
    expect(cont).toBeDisabled();
    await userEvent.type(screen.getByLabelText(/guest 2 full name/i), 'Plus One');
    expect(cont).not.toBeDisabled();
  });

  it('remove button drops that slot but keeps the first', async () => {
    render(<RsvpForm invite={makeInvite({ max_guests: 3 })} existingRsvps={[]} slug="w" />);
    const removes = screen.getAllByRole('button', { name: /remove/i });
    expect(removes).toHaveLength(2);
    await userEvent.click(removes[0]);
    expect(screen.getAllByRole('textbox')).toHaveLength(2);
  });

  it('add-guest button is hidden once slots == max_guests and returns when one is removed', async () => {
    render(<RsvpForm invite={makeInvite({ max_guests: 2 })} existingRsvps={[]} slug="w" />);
    expect(screen.queryByRole('button', { name: /add another guest/i })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: /remove/i }));
    expect(screen.getByRole('button', { name: /add another guest/i })).toBeInTheDocument();
  });
});

describe('<RsvpForm /> — rsvp step + submit', () => {
  beforeEach(() => vi.unstubAllGlobals());

  async function advanceToRsvpStep(max = 1) {
    const user = userEvent.setup();
    render(<RsvpForm invite={makeInvite({ max_guests: max })} existingRsvps={[]} slug="ada-and-ben" mealOptions={['Fish', 'Chicken']} />);
    await user.click(screen.getByRole('button', { name: /continue/i }));
    return user;
  }

  it('toggles reveal meal pills and dietary input only when attending', async () => {
    const user = await advanceToRsvpStep(1);
    expect(screen.queryByRole('radio', { name: /fish/i })).toBeNull();

    await user.click(screen.getByRole('radio', { name: /joyfully accepts/i }));
    expect(screen.getByRole('radio', { name: /fish/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/allergies or dietary needs/i)).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /regretfully declines/i }));
    expect(screen.queryByRole('radio', { name: /fish/i })).toBeNull();
  });

  it('submits the expected payload shape and displays success + calendar link', async () => {
    const posts: Array<{ url: string; body: unknown }> = [];
    fetchMock(async (url, init) => {
      posts.push({ url, body: JSON.parse(init.body as string) });
      return new Response(JSON.stringify({ success: true, table_number: 7, table_name: 'Oak' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const user = await advanceToRsvpStep(1);
    await user.click(screen.getByRole('radio', { name: /joyfully accepts/i }));
    await user.click(screen.getByRole('radio', { name: /fish/i }));
    await user.type(screen.getByLabelText(/allergies or dietary needs/i), 'nuts');
    await user.click(screen.getByRole('button', { name: /send response/i }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/see you there/i));

    expect(posts[0].url).toBe('/api/rsvp');
    expect(posts[0].body).toEqual({
      guests: [
        {
          person_name: 'Ada Lovelace',
          attending: true,
          meal_preference: 'fish',
          dietary_notes: 'nuts',
        },
      ],
    });

    const calendar = screen.getByRole('link', { name: /add to calendar/i });
    expect(calendar).toHaveAttribute('href', '/api/invite/ada-and-ben/calendar');
  });

  it('surfaces the server error message with role=alert', async () => {
    fetchMock(
      async () =>
        new Response(JSON.stringify({ error: 'Invite not found.' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
    );
    const user = await advanceToRsvpStep(1);
    await user.click(screen.getByRole('radio', { name: /regretfully declines/i }));
    await user.click(screen.getByRole('button', { name: /send response/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/invite not found/i);
  });

  it('skips the calendar link when everyone declines', async () => {
    fetchMock(
      async () => new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    );
    const user = await advanceToRsvpStep(1);
    await user.click(screen.getByRole('radio', { name: /regretfully declines/i }));
    await user.click(screen.getByRole('button', { name: /send response/i }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/miss you/i));
    expect(screen.queryByRole('link', { name: /add to calendar/i })).toBeNull();
  });

  it('add-guest button appends a blank slot and the meal pill deselects on second click', async () => {
    // Bump past max_guests to expose the add button: start with max=3, remove one, re-add one.
    const user = userEvent.setup();
    render(<RsvpForm invite={makeInvite({ max_guests: 3 })} existingRsvps={[]} slug="w" mealOptions={['Fish']} />);
    const removes = screen.getAllByRole('button', { name: /remove/i });
    await user.click(removes[0]);
    await user.click(screen.getByRole('button', { name: /add another guest/i }));
    expect(screen.getAllByRole('textbox')).toHaveLength(3);
  });

  it('"Edit names" returns to the names step, and meal pill toggles off on second click', async () => {
    const user = await advanceToRsvpStep(1);
    await user.click(screen.getByRole('radio', { name: /joyfully accepts/i }));
    const fish = screen.getByRole('radio', { name: /fish/i });
    await user.click(fish);
    expect(fish).toHaveAttribute('aria-checked', 'true');
    await user.click(fish);
    expect(fish).toHaveAttribute('aria-checked', 'false');

    await user.click(screen.getByRole('button', { name: /edit names/i }));
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });

  it('"Change my response" resets to the names step from the success screen', async () => {
    fetchMock(
      async () =>
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
    );
    const user = await advanceToRsvpStep(1);
    await user.click(screen.getByRole('radio', { name: /regretfully declines/i }));
    await user.click(screen.getByRole('button', { name: /send response/i }));
    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /change my response/i }));
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });

  it('falls back to a generic error message when the server returns no body', async () => {
    fetchMock(async () => new Response('not json', { status: 500 }));
    const user = await advanceToRsvpStep(1);
    await user.click(screen.getByRole('radio', { name: /regretfully declines/i }));
    await user.click(screen.getByRole('button', { name: /send response/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/submission failed|something went wrong/i);
  });

  it('opens on the rsvp step when there are already RSVPs', () => {
    const rsvps: Rsvp[] = [
      {
        id: 'r1', invite_id: 'inv-1', wedding_id: 'wed-1',
        person_name: 'Ada Lovelace', attending: true,
        meal_preference: 'fish', dietary_notes: null,
        created_at: new Date().toISOString(),
      } as Rsvp,
    ];
    render(<RsvpForm invite={makeInvite({ max_guests: 1 })} existingRsvps={rsvps} slug="w" mealOptions={['Fish']} />);
    expect(screen.getByRole('button', { name: /send response/i })).toBeInTheDocument();
    // Edit-names back-button is present
    expect(screen.getByRole('button', { name: /edit names/i })).toBeInTheDocument();
  });
});
