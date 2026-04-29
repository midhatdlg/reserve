import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSupabaseMock } from '@/test/helpers/supabase-mock';

const mock = createSupabaseMock();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mock.client,
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(async () => ({ allowed: true })),
}));

const sendMessageCouple = vi.fn<(input: unknown) => Promise<unknown>>(async () => ({ id: 'email-1' }));
vi.mock('@/lib/resend', () => ({
  sendMessageCouple: (input: unknown) => sendMessageCouple(input),
}));

async function call(slug: string, body: unknown) {
  const { POST } = await import('./route');
  return POST(
    new Request(`https://example.com/api/invite/${slug}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ slug }) }
  );
}

const VALID = { name: 'Stranger', email: 'stranger@example.com', message: 'May I RSVP?' };

describe('POST /api/invite/[slug]/message', () => {
  beforeEach(() => {
    mock.reset();
    sendMessageCouple.mockClear();
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com';
  });

  it('returns 400 on invalid body', async () => {
    const res = await call('w', { name: 'ok' }); // missing message
    expect(res.status).toBe(400);
  });

  it('returns 404 when wedding missing/unpublished', async () => {
    mock.setResponse('weddings', { data: null });
    const res = await call('w', VALID);
    expect(res.status).toBe(404);

    mock.setResponse('weddings', { data: { id: 'w', is_published: false, couple_id: 'c' } });
    const res2 = await call('w', VALID);
    expect(res2.status).toBe(404);
  });

  it('persists the message as a questions row with is_public=false and invite_id=null', async () => {
    mock.setResponse('weddings', { data: { id: 'w1', title: 'Ada & Ben', is_published: true, couple_id: 'c1' } });
    mock.setResponse('couples', { data: { email: 'couple@example.com' } });
    mock.setResponse('questions', { data: null, error: null });

    const res = await call('ada-and-ben', VALID);
    expect(res.status).toBe(200);

    const insert = mock.calls.find((c) => c.table === 'questions' && c.method === 'insert');
    expect(insert).toBeTruthy();
    const args = insert!.args[0] as Record<string, unknown>;
    expect(args.wedding_id).toBe('w1');
    expect(args.invite_id).toBeNull();
    expect(args.is_public).toBe(false);
    expect(args.author_name).toBe('Stranger');
    expect(args.author_email).toBe('stranger@example.com');
    expect(args.question_text).toBe('May I RSVP?');
  });

  it('sends an email to the couple with the dashboard link', async () => {
    mock.setResponse('weddings', { data: { id: 'w1', title: 'Ada & Ben', is_published: true, couple_id: 'c1' } });
    mock.setResponse('couples', { data: { email: 'couple@example.com' } });
    await call('ada-and-ben', VALID);
    expect(sendMessageCouple).toHaveBeenCalledTimes(1);
    const args = sendMessageCouple.mock.calls[0]?.[0] as {
      to: string; weddingTitle: string; guestName: string; dashboardUrl: string;
    };
    expect(args.to).toBe('couple@example.com');
    expect(args.weddingTitle).toBe('Ada & Ben');
    expect(args.dashboardUrl).toBe('https://example.com/dashboard/questions');
  });

  it('still returns 200 if email delivery fails', async () => {
    mock.setResponse('weddings', { data: { id: 'w1', title: 'Ada & Ben', is_published: true, couple_id: 'c1' } });
    mock.setResponse('couples', { data: { email: 'couple@example.com' } });
    sendMessageCouple.mockRejectedValueOnce(new Error('resend down'));
    const res = await call('ada-and-ben', VALID);
    expect(res.status).toBe(200);
  });

  it('skips the email if the couple has no email on file', async () => {
    mock.setResponse('weddings', { data: { id: 'w1', title: 'Ada & Ben', is_published: true, couple_id: 'c1' } });
    mock.setResponse('couples', { data: null });
    const res = await call('w', VALID);
    expect(res.status).toBe(200);
    expect(sendMessageCouple).not.toHaveBeenCalled();
  });

  it('returns 429 when rate limited', async () => {
    const rl = await import('@/lib/rate-limit');
    (rl.checkRateLimit as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ allowed: false });
    const res = await call('w', VALID);
    expect(res.status).toBe(429);
  });

  it('accepts a message with no email', async () => {
    mock.setResponse('weddings', { data: { id: 'w1', title: 'Ada & Ben', is_published: true, couple_id: 'c1' } });
    mock.setResponse('couples', { data: { email: 'couple@example.com' } });
    const res = await call('w', { name: 'Anon', message: 'Hi!' });
    expect(res.status).toBe(200);
    const insert = mock.calls.find((c) => c.table === 'questions' && c.method === 'insert');
    expect((insert!.args[0] as { author_email: unknown }).author_email).toBeNull();
  });
});
