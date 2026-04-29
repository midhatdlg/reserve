import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSupabaseMock } from '@/test/helpers/supabase-mock';
import {
  RSVP_SESSION_COOKIE,
  verifyRsvpSession,
} from '@/lib/session';

const mock = createSupabaseMock();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mock.client,
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(async () => ({ allowed: true })),
}));

async function callLookup(slug: string, body: unknown, headers: Record<string, string> = {}) {
  const { POST } = await import('./route');
  return POST(
    new Request(`https://example.com/api/invite/${slug}/lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ slug }) }
  );
}

function setWedding(overrides: Record<string, unknown> = {}) {
  mock.setResponse('weddings', {
    data: {
      id: 'wed-1',
      strict_name_match: true,
      is_published: true,
      ...overrides,
    },
  });
}

function setInvites(invites: unknown[]) {
  mock.setResponse('invites', { data: invites });
}

describe('POST /api/invite/[slug]/lookup', () => {
  beforeEach(() => {
    mock.reset();
    process.env.RSVP_SESSION_SECRET = 'test-session-secret-at-least-32-chars-long';
  });

  it('returns 400 for malformed JSON', async () => {
    setWedding();
    const { POST } = await import('./route');
    const res = await POST(
      new Request('https://example.com/api/invite/w/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not json',
      }),
      { params: Promise.resolve({ slug: 'w' }) }
    );
    expect(res.status).toBe(400);
  });

  it('returns 400 when name is missing', async () => {
    setWedding();
    const res = await callLookup('w', {});
    expect(res.status).toBe(400);
  });

  it('returns 404 when the wedding does not exist', async () => {
    mock.setResponse('weddings', { data: null });
    const res = await callLookup('nope', { name: 'Ada' });
    expect(res.status).toBe(404);
  });

  it('returns 404 when the wedding is unpublished', async () => {
    setWedding({ is_published: false });
    const res = await callLookup('w', { name: 'Ada' });
    expect(res.status).toBe(404);
  });

  it('returns matched and sets a session cookie for a unique name', async () => {
    setWedding();
    setInvites([
      { id: 'inv-1', wedding_id: 'wed-1', guest_name: 'Ada Lovelace', email: null, max_guests: 2, table_number: 3, table_name: 'Oak' },
    ]);
    const res = await callLookup('w', { name: 'ada lovelace' });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('matched');
    expect(body.invite.id).toBe('inv-1');
    expect(body.invite.max_guests).toBe(2);

    const setCookie = res.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain(`${RSVP_SESSION_COOKIE}=`);
    expect(setCookie.toLowerCase()).toContain('httponly');
    expect(setCookie.toLowerCase()).toContain('samesite=lax');

    const tokenMatch = setCookie.match(new RegExp(`${RSVP_SESSION_COOKIE}=([^;]+)`));
    const token = tokenMatch?.[1];
    const payload = verifyRsvpSession(token);
    expect(payload?.inviteId).toBe('inv-1');
    expect(payload?.weddingId).toBe('wed-1');
  });

  it('returns ambiguous when two invites share a name and no email is given', async () => {
    setWedding();
    setInvites([
      { id: 'a', wedding_id: 'wed-1', guest_name: 'Chris Smith', email: 'chris@a.com', max_guests: 1, table_number: null, table_name: null },
      { id: 'b', wedding_id: 'wed-1', guest_name: 'Chris Smith', email: 'chris@b.com', max_guests: 1, table_number: null, table_name: null },
    ]);
    const res = await callLookup('w', { name: 'Chris Smith' });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ status: 'ambiguous', count: 2 });
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('resolves duplicates via email tiebreaker', async () => {
    setWedding();
    setInvites([
      { id: 'a', wedding_id: 'wed-1', guest_name: 'Chris Smith', email: 'chris@a.com', max_guests: 1, table_number: null, table_name: null },
      { id: 'b', wedding_id: 'wed-1', guest_name: 'Chris Smith', email: 'chris@b.com', max_guests: 1, table_number: null, table_name: null },
    ]);
    const res = await callLookup('w', { name: 'Chris Smith', email: 'chris@b.com' });
    const body = await res.json();
    expect(body.status).toBe('matched');
    expect(body.invite.id).toBe('b');
  });

  it('returns unmatched when strict_name_match is on and name is unknown', async () => {
    setWedding({ strict_name_match: true });
    setInvites([
      { id: 'a', wedding_id: 'wed-1', guest_name: 'Ada', email: null, max_guests: 1, table_number: null, table_name: null },
    ]);
    const res = await callLookup('w', { name: 'Ben' });
    const body = await res.json();
    expect(body).toEqual({ status: 'unmatched' });
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('creates an invite when strict_name_match is off and name is unknown', async () => {
    setWedding({ strict_name_match: false });
    // 1st invites query: list (empty name match).
    // 2nd: count query for open-RSVP cap.
    // 3rd: insert+select.single returns the freshly created row.
    mock.queueResponse('invites', { data: [] });
    mock.queueResponse('invites', { data: null, count: 5 });
    mock.queueResponse('invites', {
      data: {
        id: 'new-1',
        wedding_id: 'wed-1',
        guest_name: 'Walk-in Guest',
        email: null,
        max_guests: 1,
        table_number: null,
        table_name: null,
      },
    });

    const res = await callLookup('w', { name: 'Walk-in Guest' });
    const body = await res.json();
    expect(body.status).toBe('matched');
    expect(body.invite.id).toBe('new-1');

    const inserts = mock.calls.filter((c) => c.table === 'invites' && c.method === 'insert');
    expect(inserts.length).toBe(1);
  });

  it('returns 429 when the rate limit denies', async () => {
    const rl = await import('@/lib/rate-limit');
    (rl.checkRateLimit as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ allowed: false });
    const res = await callLookup('w', { name: 'Ada' });
    expect(res.status).toBe(429);
  });
});
