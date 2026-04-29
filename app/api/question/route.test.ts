import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSupabaseMock } from '@/test/helpers/supabase-mock';
import { signRsvpSession, RSVP_SESSION_COOKIE } from '@/lib/session';

const mock = createSupabaseMock();
const cookieJar = { value: '' };

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mock.client,
}));

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (name === RSVP_SESSION_COOKIE && cookieJar.value ? { value: cookieJar.value } : undefined),
  }),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(async () => ({ allowed: true })),
}));

async function call(body: unknown, slug?: string) {
  const { POST } = await import('./route');
  const url = slug
    ? `https://example.com/api/question?slug=${encodeURIComponent(slug)}`
    : 'https://example.com/api/question';
  return POST(new Request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }));
}

function signSession(inviteId: string, weddingId: string) {
  process.env.RSVP_SESSION_SECRET = 'test-session-secret-at-least-32-chars-long';
  cookieJar.value = signRsvpSession({
    inviteId,
    weddingId,
    exp: Math.floor(Date.now() / 1000) + 600,
  });
}

describe('POST /api/question', () => {
  beforeEach(() => {
    mock.reset();
    cookieJar.value = '';
  });

  it('returns 400 for invalid input', async () => {
    signSession('inv-1', 'wed-1');
    const res = await call({ question_text: '' });
    expect(res.status).toBe(400);
  });

  it('authenticated path: inserts with is_public=false, linked to invite', async () => {
    signSession('inv-1', 'wed-1');
    mock.setResponse('questions', { data: { id: 'q-1' } });
    const res = await call({ question_text: 'What is the dress code?' });
    expect(res.status).toBe(200);
    const insert = mock.calls.find((c) => c.table === 'questions' && c.method === 'insert');
    expect(insert).toBeTruthy();
    const args = insert!.args[0] as { wedding_id: string; invite_id: string | null; is_public: boolean };
    expect(args.wedding_id).toBe('wed-1');
    expect(args.invite_id).toBe('inv-1');
    expect(args.is_public).toBe(false);
  });

  it('anonymous path: requires slug + author_name', async () => {
    const noSlug = await call({ question_text: 'hi', author_name: 'Stranger' });
    expect(noSlug.status).toBe(400);

    const noName = await call({ question_text: 'hi' }, 'ada-and-ben');
    expect(noName.status).toBe(400);
  });

  it('anonymous path: looks up wedding by slug and inserts unlinked question', async () => {
    mock.queueResponse('weddings', { data: { id: 'wed-1', is_published: true } });
    mock.queueResponse('questions', { data: { id: 'q-2' } });
    const res = await call({ question_text: 'Can I bring a plus one?', author_name: 'Stranger', author_email: 'x@example.com' }, 'ada-and-ben');
    expect(res.status).toBe(200);
    const insert = mock.calls.find((c) => c.table === 'questions' && c.method === 'insert');
    const args = insert!.args[0] as { invite_id: string | null; author_name: string | null; is_public: boolean };
    expect(args.invite_id).toBeNull();
    expect(args.author_name).toBe('Stranger');
    expect(args.is_public).toBe(false);
  });

  it('anonymous path: 404 if slug is unpublished', async () => {
    mock.setResponse('weddings', { data: { id: 'wed-1', is_published: false } });
    const res = await call({ question_text: 'hi', author_name: 'Stranger' }, 'secret');
    expect(res.status).toBe(404);
  });

  it('returns 429 when the rate limit denies', async () => {
    signSession('inv-1', 'wed-1');
    const rl = await import('@/lib/rate-limit');
    (rl.checkRateLimit as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ allowed: false });
    const res = await call({ question_text: 'hi' });
    expect(res.status).toBe(429);
  });
});
