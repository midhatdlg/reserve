import { describe, it, expect, beforeEach } from 'vitest';
import { loadInvitePageData, resolveVisibleBlocks } from './invite-page';
import { createSupabaseMock } from '@/test/helpers/supabase-mock';
import type { Wedding } from '@/types';

function makeWedding(overrides: Partial<Wedding> = {}): Wedding {
  return {
    id: 'wed-1',
    couple_id: 'couple-1',
    slug: 'ada-and-ben',
    title: 'Ada & Ben',
    wedding_date: '2026-09-12',
    venue_name: 'The Old Barn',
    venue_address: '1 High Street',
    venue_lat: null,
    venue_lng: null,
    template_id: 'heritage',
    custom_design_url: null,
    video_embed_url: null,
    design_zones: [],
    selected_blocks: ['rsvp', 'itinerary', 'photos'],
    languages: ['en'],
    is_published: true,
    save_the_date_mode: false,
    envelope_enabled: true,
    envelope_wax_color: '#799D7F',
    envelope_initials: 'A & B',
    invite_bg_color: '#F5F0E8',
    meal_options: ['Beef'],
    strict_name_match: true,
    timezone: 'Europe/London',
    template_overrides: {},
    template_content: {},
    settings: {},
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('loadInvitePageData', () => {
  let mock: ReturnType<typeof createSupabaseMock>;

  beforeEach(() => {
    mock = createSupabaseMock();
  });

  it('returns null when the slug is not found', async () => {
    mock.setResponse('weddings', { data: null });
    const result = await loadInvitePageData(mock.client, 'missing');
    expect(result).toBeNull();
  });

  it('returns null when the wedding is unpublished', async () => {
    mock.setResponse('weddings', { data: makeWedding({ is_published: false }) });
    const result = await loadInvitePageData(mock.client, 'ada-and-ben');
    expect(result).toBeNull();
  });

  it('loads wedding + events + photos + public questions when anonymous', async () => {
    mock.setResponses({
      weddings: { data: makeWedding() },
      events: { data: [{ id: 'e1' }, { id: 'e2' }] },
      photos: { data: [{ id: 'p1' }] },
      questions: { data: [{ id: 'q1' }] },
    });

    const result = await loadInvitePageData(mock.client, 'ada-and-ben');
    expect(result).not.toBeNull();
    expect(result!.events).toHaveLength(2);
    expect(result!.photos).toHaveLength(1);
    expect(result!.questions).toHaveLength(1);
    expect(result!.invite).toBeNull();
    expect(result!.rsvps).toEqual([]);
  });

  it('loads invite + rsvps when an inviteId is supplied', async () => {
    mock.setResponses({
      weddings: { data: makeWedding() },
      invites: { data: { id: 'inv-1', guest_name: 'Ada' } },
      rsvps: { data: [{ id: 'r1', person_name: 'Ada', attending: true }] },
      events: { data: [] },
      photos: { data: [] },
      questions: { data: [] },
    });

    const result = await loadInvitePageData(mock.client, 'ada-and-ben', 'inv-1');
    expect(result!.invite?.id).toBe('inv-1');
    expect(result!.rsvps).toHaveLength(1);

    const inviteCalls = mock.calls.filter((c) => c.table === 'invites');
    const eqCols = inviteCalls.filter((c) => c.method === 'eq').map((c) => c.args[0]);
    expect(eqCols).toContain('id');
    expect(eqCols).toContain('wedding_id');
  });

  it('falls back to empty arrays when a table returns null data', async () => {
    mock.setResponses({
      weddings: { data: makeWedding() },
      events: { data: null },
      photos: { data: null },
      questions: { data: null },
    });

    const result = await loadInvitePageData(mock.client, 'ada-and-ben');
    expect(result!.events).toEqual([]);
    expect(result!.photos).toEqual([]);
    expect(result!.questions).toEqual([]);
  });

  it('filters questions by is_public = true', async () => {
    mock.setResponses({
      weddings: { data: makeWedding() },
      events: { data: [] },
      photos: { data: [] },
      questions: { data: [] },
    });

    await loadInvitePageData(mock.client, 'ada-and-ben');
    const questionCalls = mock.calls.filter((c) => c.table === 'questions');
    const eqCalls = questionCalls.filter((c) => c.method === 'eq');
    const eqOnIsPublic = eqCalls.find((c) => c.args[0] === 'is_public');
    expect(eqOnIsPublic?.args[1]).toBe(true);
  });

  it('does not query invites when no inviteId is supplied', async () => {
    mock.setResponses({
      weddings: { data: makeWedding() },
      events: { data: [] },
      photos: { data: [] },
      questions: { data: [] },
    });

    await loadInvitePageData(mock.client, 'ada-and-ben');
    const inviteCalls = mock.calls.filter((c) => c.table === 'invites');
    expect(inviteCalls).toEqual([]);
  });
});

describe('resolveVisibleBlocks', () => {
  it('returns the selected_blocks in normal mode', () => {
    const wedding = makeWedding({
      selected_blocks: ['rsvp', 'itinerary', 'photos'],
    });
    expect(resolveVisibleBlocks(wedding)).toEqual(['rsvp', 'itinerary', 'photos']);
  });

  it('forces ["countdown"] when save_the_date_mode is on', () => {
    const wedding = makeWedding({
      save_the_date_mode: true,
      selected_blocks: ['rsvp', 'itinerary'],
    });
    expect(resolveVisibleBlocks(wedding)).toEqual(['countdown']);
  });

  it('returns [] when selected_blocks is missing', () => {
    const wedding = makeWedding({
      selected_blocks: undefined as unknown as string[],
    });
    expect(resolveVisibleBlocks(wedding)).toEqual([]);
  });
});

function makeWedding_(overrides: Partial<Wedding> = {}): Wedding {
  return makeWedding(overrides);
}
// Referenced to keep unused warning away if tree-shaken.
void makeWedding_;
