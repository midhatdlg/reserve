import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSupabaseMock } from '@/test/helpers/supabase-mock';
import { pickEventWindow } from './route';

const mock = createSupabaseMock();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mock.client,
}));

describe('GET /api/invite/[slug]/calendar', () => {
  beforeEach(() => {
    mock.reset();
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com';
  });

  async function callRoute(slug: string) {
    const { GET } = await import('./route');
    return GET(new Request(`https://example.com/api/invite/${slug}/calendar`), {
      params: Promise.resolve({ slug }),
    });
  }

  it('returns 404 when wedding is missing', async () => {
    mock.setResponse('weddings', { data: null });
    const res = await callRoute('missing');
    expect(res.status).toBe(404);
  });

  it('returns 404 when wedding is unpublished', async () => {
    mock.setResponse('weddings', {
      data: {
        id: 'w1',
        title: 'W',
        wedding_date: '2026-09-12',
        venue_name: 'V',
        venue_address: null,
        timezone: 'Europe/London',
        is_published: false,
      },
    });
    const res = await callRoute('w');
    expect(res.status).toBe(404);
  });

  it('returns 404 when wedding_date is missing', async () => {
    mock.setResponse('weddings', {
      data: {
        id: 'w1',
        title: 'W',
        wedding_date: null,
        venue_name: 'V',
        venue_address: null,
        timezone: 'Europe/London',
        is_published: true,
      },
    });
    const res = await callRoute('w');
    expect(res.status).toBe(404);
  });

  it('builds an .ics document with correct headers', async () => {
    mock.setResponses({
      weddings: {
        data: {
          id: 'w1',
          title: 'Ada & Ben',
          wedding_date: '2026-09-12',
          venue_name: 'The Old Barn',
          venue_address: '1 High Street',
          timezone: 'Europe/London',
          is_published: true,
        },
      },
      events: { data: [] },
    });
    const res = await callRoute('ada-and-ben');
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/calendar');
    const body = await res.text();
    expect(body).toContain('BEGIN:VCALENDAR');
    expect(body).toContain('SUMMARY:Ada & Ben');
    expect(body).toContain('URL:https://example.com/invite/ada-and-ben');
  });
});

describe('pickEventWindow', () => {
  it('falls back to 14:00 local + 4h when no events (UTC default)', () => {
    const { start, end } = pickEventWindow('2026-09-12', []);
    expect(start.toISOString()).toBe('2026-09-12T14:00:00.000Z');
    expect(end.getTime() - start.getTime()).toBe(4 * 60 * 60 * 1000);
  });

  it('anchors the fallback in the wedding timezone', () => {
    // 14:00 London on 2026-09-12 is BST (UTC+1) → 13:00Z
    const { start } = pickEventWindow('2026-09-12', [], 'Europe/London');
    expect(start.toISOString()).toBe('2026-09-12T13:00:00.000Z');
  });

  it('spans earliest start to latest end', () => {
    const events = [
      { start_time: '2026-09-12T14:00:00Z', end_time: '2026-09-12T15:00:00Z' },
      { start_time: '2026-09-12T17:00:00Z', end_time: '2026-09-12T23:00:00Z' },
    ];
    const { start, end } = pickEventWindow('2026-09-12', events);
    expect(start.toISOString()).toBe('2026-09-12T14:00:00.000Z');
    expect(end.toISOString()).toBe('2026-09-12T23:00:00.000Z');
  });

  it('uses start + 1h when no ends are given', () => {
    const events = [
      { start_time: '2026-09-12T17:00:00Z', end_time: null },
    ];
    const { start, end } = pickEventWindow('2026-09-12', events);
    expect(end.getTime() - start.getTime()).toBe(60 * 60 * 1000);
  });
});
