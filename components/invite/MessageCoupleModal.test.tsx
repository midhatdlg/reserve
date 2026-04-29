import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageCoupleModal } from './MessageCoupleModal';

function fetchMock(impl: (url: string, init: RequestInit) => Promise<Response>) {
  vi.stubGlobal('fetch', vi.fn((url: string, init: RequestInit) => impl(url, init)));
}

describe('<MessageCoupleModal />', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('has dialog semantics and a back + send affordance', () => {
    render(<MessageCoupleModal slug="w" onCancel={() => {}} onSent={() => {}} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('prefills name and email from props', () => {
    render(
      <MessageCoupleModal slug="w" initialName="Ada" initialEmail="ada@a.com" onCancel={() => {}} onSent={() => {}} />
    );
    expect((screen.getByLabelText(/your name/i) as HTMLInputElement).value).toBe('Ada');
    expect((screen.getByLabelText(/email \(optional\)/i) as HTMLInputElement).value).toBe('ada@a.com');
  });

  it('rejects empty name or message on submit without calling fetch', async () => {
    fetchMock(async () => new Response('{}', { status: 200 }));
    render(<MessageCoupleModal slug="w" onCancel={() => {}} onSent={() => {}} />);
    // The form has required attributes; jsdom blocks the submit itself.
    await userEvent.click(screen.getByRole('button', { name: /send/i }));
    expect(fetch).not.toHaveBeenCalled();
  });

  it('posts to /api/invite/[slug]/message, shows confirmation, and schedules onSent', async () => {
    const calls: Array<{ url: string; body: unknown }> = [];
    fetchMock(async (url, init) => {
      calls.push({ url, body: JSON.parse(init.body as string) });
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    const onSent = vi.fn();
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');

    render(
      <MessageCoupleModal
        slug="ada-and-ben"
        initialName="Stranger"
        initialEmail="s@example.com"
        onCancel={() => {}}
        onSent={onSent}
      />
    );

    await userEvent.type(screen.getByLabelText(/^message$/i), 'Hi — may I RSVP?');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/on its way/i));
    expect(calls[0].url).toBe('/api/invite/ada-and-ben/message');
    expect(calls[0].body).toEqual({
      name: 'Stranger',
      email: 's@example.com',
      message: 'Hi — may I RSVP?',
    });
    const scheduledOnSent = setTimeoutSpy.mock.calls.find((args) => args[0] === onSent);
    expect(scheduledOnSent?.[1]).toBeGreaterThan(0);
  });

  it('shows a server error message when the endpoint rejects', async () => {
    fetchMock(
      async () =>
        new Response(JSON.stringify({ error: 'Rate limited' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        })
    );
    render(
      <MessageCoupleModal slug="w" initialName="Ada" onCancel={() => {}} onSent={() => {}} />
    );
    await userEvent.type(screen.getByLabelText(/^message$/i), 'hi');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/rate limited/i);
  });

  it('exercises each input onChange handler', async () => {
    render(<MessageCoupleModal slug="w" onCancel={() => {}} onSent={() => {}} />);
    const user = userEvent.setup();
    const name = screen.getByLabelText(/your name/i) as HTMLInputElement;
    const email = screen.getByLabelText(/email \(optional\)/i) as HTMLInputElement;
    const msg = screen.getByLabelText(/^message$/i) as HTMLTextAreaElement;
    await user.type(name, 'Ada');
    await user.type(email, 'ada@example.com');
    await user.type(msg, 'Hello!');
    expect(name.value).toBe('Ada');
    expect(email.value).toBe('ada@example.com');
    expect(msg.value).toBe('Hello!');
  });

  it('shows a generic error when the server returns a non-JSON body', async () => {
    fetchMock(async () => new Response('not json', { status: 500 }));
    render(<MessageCoupleModal slug="w" initialName="Ada" onCancel={() => {}} onSent={() => {}} />);
    await userEvent.type(screen.getByLabelText(/^message$/i), 'hi');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/could not send/i);
  });

  it('shows a network error when fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
    render(<MessageCoupleModal slug="w" initialName="Ada" onCancel={() => {}} onSent={() => {}} />);
    await userEvent.type(screen.getByLabelText(/^message$/i), 'hi');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/network error/i);
  });

  it('blocks submission with a client-side validation error if the message is whitespace', async () => {
    // Bypass the required="true" html guard by typing spaces that pass it but
    // fail the .trim() check in submit().
    render(<MessageCoupleModal slug="w" initialName="Ada" onCancel={() => {}} onSent={() => {}} />);
    await userEvent.type(screen.getByLabelText(/^message$/i), '   ');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/your name and a short message/i);
  });

  it('calls onCancel when the back button is pressed', async () => {
    const onCancel = vi.fn();
    render(<MessageCoupleModal slug="w" onCancel={onCancel} onSent={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
