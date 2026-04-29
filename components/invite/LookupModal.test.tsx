import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LookupModal } from './LookupModal';

function setupFetchMock(
  impl: (url: string, init: RequestInit) => Promise<Response>
) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, init: RequestInit) => impl(url, init))
  );
}

describe('<LookupModal />', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('focuses the name input on mount and has dialog semantics', () => {
    render(<LookupModal slug="w" onMatched={() => {}} onMessageCouple={() => {}} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByLabelText(/full name/i)).toHaveFocus();
  });

  it('posts the trimmed name to the lookup endpoint and calls onMatched on 200 matched', async () => {
    const calls: Array<{ url: string; body: unknown }> = [];
    setupFetchMock(async (url, init) => {
      calls.push({ url, body: JSON.parse(init.body as string) });
      return new Response(JSON.stringify({ status: 'matched', invite: { id: 'x' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const onMatched = vi.fn();
    render(<LookupModal slug="ada-and-ben" onMatched={onMatched} onMessageCouple={() => {}} />);

    await userEvent.type(screen.getByLabelText(/full name/i), '  Ada Lovelace  ');
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => expect(onMatched).toHaveBeenCalled());
    expect(calls[0].url).toBe('/api/invite/ada-and-ben/lookup');
    expect(calls[0].body).toEqual({ name: 'Ada Lovelace', email: undefined });
  });

  it('reveals an email field when the endpoint returns ambiguous', async () => {
    const responses = [
      { body: { status: 'ambiguous', count: 2 }, status: 200 },
      { body: { status: 'matched', invite: { id: 'x' } }, status: 200 },
    ];
    setupFetchMock(async () => {
      const next = responses.shift()!;
      return new Response(JSON.stringify(next.body), {
        status: next.status,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const onMatched = vi.fn();
    render(<LookupModal slug="w" onMatched={onMatched} onMessageCouple={() => {}} />);
    await userEvent.type(screen.getByLabelText(/full name/i), 'Chris Smith');
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument());
    expect(screen.getByRole('alert')).toHaveTextContent(/more than one guest/i);

    await userEvent.type(screen.getByLabelText(/^email$/i), 'chris@b.com');
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => expect(onMatched).toHaveBeenCalled());
  });

  it('shows the message-the-couple fallback when the endpoint returns unmatched', async () => {
    setupFetchMock(
      async () =>
        new Response(JSON.stringify({ status: 'unmatched' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
    );

    const onMessage = vi.fn();
    render(<LookupModal slug="w" onMatched={() => {}} onMessageCouple={onMessage} />);
    await userEvent.type(screen.getByLabelText(/full name/i), 'Unknown Guest');
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));

    const link = await screen.findByRole('button', { name: /message the couple/i });
    await userEvent.click(link);
    expect(onMessage).toHaveBeenCalledWith('Unknown Guest', '');
  });

  it('shows a friendly error on 429', async () => {
    setupFetchMock(async () => new Response('', { status: 429 }));
    render(<LookupModal slug="w" onMatched={() => {}} onMessageCouple={() => {}} />);
    await userEvent.type(screen.getByLabelText(/full name/i), 'Ada');
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/too many attempts/i);
  });

  it('shows a friendly error on network failure', async () => {
    setupFetchMock(async () => {
      throw new Error('offline');
    });
    render(<LookupModal slug="w" onMatched={() => {}} onMessageCouple={() => {}} />);
    await userEvent.type(screen.getByLabelText(/full name/i), 'Ada');
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/network error/i);
  });

  it('rejects empty submissions with client-side validation', async () => {
    setupFetchMock(async () => new Response('{}', { status: 200 }));
    render(<LookupModal slug="w" onMatched={() => {}} onMessageCouple={() => {}} />);
    const button = screen.getByRole('button', { name: /continue/i });
    // Bypass the native `required` validation by clicking with empty input —
    // jsdom treats form submission with required-invalid inputs as a no-op.
    await userEvent.click(button);
    // Because jsdom doesn't submit invalid forms, fetch should not be called.
    expect(fetch).not.toHaveBeenCalled();
  });
});
