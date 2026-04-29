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

const revalidatePath = vi.fn();
vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(async () => ({ allowed: true })),
}));

async function call(body: unknown) {
  const { POST } = await import('./route');
  return POST(new Request('https://example.com/api/rsvp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }));
}

function signSessionFor(inviteId: string, weddingId: string) {
  process.env.RSVP_SESSION_SECRET = 'test-session-secret-at-least-32-chars-long';
  cookieJar.value = signRsvpSession({
    inviteId,
    weddingId,
    exp: Math.floor(Date.now() / 1000) + 600,
  });
}

describe('POST /api/rsvp', () => {
  beforeEach(() => {
    mock.reset();
    cookieJar.value = '';
    revalidatePath.mockClear();
  });

  it('returns 401 when no session cookie is present', async () => {
    const res = await call({ guests: [{ person_name: 'Ada', attending: true }] });
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid bodies', async () => {
    signSessionFor('inv-1', 'wed-1');
    const res = await call({ guests: [] });
    expect(res.status).toBe(400);
  });

  it('returns 404 when the session invite is gone', async () => {
    signSessionFor('inv-1', 'wed-1');
    mock.setResponse('invites', { data: null });
    const res = await call({ guests: [{ person_name: 'Ada', attending: true }] });
    expect(res.status).toBe(404);
  });

  it('rejects more guests than max_guests', async () => {
    signSessionFor('inv-1', 'wed-1');
    mock.setResponse('invites', { data: { id: 'inv-1', wedding_id: 'wed-1', max_guests: 1, table_number: null, table_name: null, status: 'pending' } });
    const res = await call({ guests: [
      { person_name: 'Ada', attending: true },
      { person_name: 'Ben', attending: true },
    ]});
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/maximum of 1/i);
  });

  it('happy path: calls replace_rsvps RPC, revalidates', async () => {
    signSessionFor('inv-1', 'wed-1');
    mock.setResponse('invites', {
      data: { id: 'inv-1', wedding_id: 'wed-1', max_guests: 2, table_number: 3, table_name: 'Oak', status: 'pending' },
    });
    mock.setResponse('weddings', { data: { slug: 'ada-and-ben' } });

    const res = await call({
      guests: [
        { person_name: 'Ada', attending: true, meal_preference: 'Fish' },
        { person_name: 'Ben', attending: false, dietary_notes: 'allergies' },
      ],
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.table_number).toBe(3);

    // Atomic RPC replaces the old delete+insert+update
    expect(mock.rpcCalls.length).toBe(1);
    const rpc = mock.rpcCalls[0];
    expect(rpc.fn).toBe('replace_rsvps');
    const params = rpc.params as { p_invite_id: string; p_status: string; p_rows: unknown[] };
    expect(params.p_invite_id).toBe('inv-1');
    expect(params.p_status).toBe('responded');
    expect(params.p_rows).toHaveLength(2);

    expect(revalidatePath).toHaveBeenCalledWith('/invite/ada-and-ben');
  });

  it('sets status=declined when no guest is attending', async () => {
    signSessionFor('inv-1', 'wed-1');
    mock.setResponse('invites', {
      data: { id: 'inv-1', wedding_id: 'wed-1', max_guests: 2, table_number: null, table_name: null, status: 'pending' },
    });
    mock.setResponse('weddings', { data: { slug: 's' } });

    await call({ guests: [{ person_name: 'Ada', attending: false }] });
    expect(mock.rpcCalls.length).toBe(1);
    expect((mock.rpcCalls[0].params as { p_status: string }).p_status).toBe('declined');
  });

  it('returns 429 when the rate limit denies', async () => {
    signSessionFor('inv-1', 'wed-1');
    mock.setResponse('invites', { data: { id: 'inv-1', wedding_id: 'wed-1', max_guests: 2, table_number: null, table_name: null, status: 'pending' } });
    const rl = await import('@/lib/rate-limit');
    (rl.checkRateLimit as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ allowed: false });
    const res = await call({ guests: [{ person_name: 'Ada', attending: true }] });
    expect(res.status).toBe(429);
  });
});
