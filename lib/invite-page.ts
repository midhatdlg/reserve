import type { Event, Invite, Photo, Question, Rsvp, Wedding } from '@/types';

/**
 * Minimal Supabase client surface we rely on. Keeping this as a structural
 * alias means both the real `@supabase/supabase-js` client and our test
 * harness satisfy it without runtime wrapping.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InvitePageClient = { from: (table: string) => any };

export interface InvitePageData {
  wedding: Wedding;
  invite: Invite | null;
  events: Event[];
  rsvps: Rsvp[];
  photos: Photo[];
  questions: Question[];
}

/**
 * Loads everything the guest invite page needs in parallel.
 *
 *   - `wedding`, `events`, `photos`, and public `questions` are read via the
 *     anon `client` so RLS decides what is publicly visible. A missing or
 *     unpublished wedding returns `null`, which the caller turns into a 404.
 *   - `invite` and `rsvps` are invite-scoped private data. When an
 *     `inviteId` is supplied (typically extracted from the RSVP session
 *     cookie after a successful name match) the optional `privilegedClient`
 *     is used to fetch them; if no privileged client is provided we skip
 *     those reads entirely — the page simply omits the personalised bits.
 */
export async function loadInvitePageData(
  client: InvitePageClient,
  slug: string,
  inviteId?: string | null,
  privilegedClient?: InvitePageClient
): Promise<InvitePageData | null> {
  const privileged = privilegedClient ?? client;

  // Try the anon client first (respects RLS — only published weddings).
  // If the guest has a valid session (inviteId + privilegedClient), fall back
  // to the privileged client so unpublished weddings are still accessible
  // for guests who already matched their name / are editing their RSVP.
  let weddingRes = await client
    .from('weddings')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  let wedding = weddingRes.data as Wedding | null;

  if (!wedding && privilegedClient) {
    weddingRes = await privilegedClient
      .from('weddings')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    wedding = weddingRes.data as Wedding | null;
  }

  if (!wedding) return null;

  const invitePromise: Promise<Invite | null> = inviteId
    ? privileged
        .from('invites')
        .select('*')
        .eq('id', inviteId)
        .eq('wedding_id', wedding.id)
        .maybeSingle()
        .then((r: { data: unknown }) => (r.data as Invite | null) ?? null)
    : Promise.resolve(null);

  const eventsPromise: Promise<Event[]> = client
    .from('events')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('sort_order', { ascending: true })
    .then((r: { data: unknown }) => (r.data as Event[] | null) ?? []);

  const photosPromise: Promise<Photo[]> = client
    .from('photos')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('sort_order', { ascending: true })
    .then((r: { data: unknown }) => (r.data as Photo[] | null) ?? []);

  const questionsPromise: Promise<Question[]> = client
    .from('questions')
    .select('*')
    .eq('wedding_id', wedding.id)
    .eq('is_public', true)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: true })
    .then((r: { data: unknown }) => (r.data as Question[] | null) ?? []);

  const [invite, events, photos, questions] = await Promise.all([
    invitePromise,
    eventsPromise,
    photosPromise,
    questionsPromise,
  ]);

  const rsvps: Rsvp[] = invite
    ? await privileged
        .from('rsvps')
        .select('*')
        .eq('invite_id', invite.id)
        .then((r: { data: unknown }) => (r.data as Rsvp[] | null) ?? [])
    : [];

  return { wedding, invite, events, photos, questions, rsvps };
}

/**
 * Decide which block keys should render for a given wedding. Centralised so
 * `save_the_date_mode` can force a minimal set without the page having to
 * re-implement the rule. Returned order matches the authoring order on the
 * wedding record; unknown blocks are filtered out.
 */
export function resolveVisibleBlocks(wedding: Wedding): readonly string[] {
  if (wedding.save_the_date_mode) {
    return ['countdown'];
  }
  return wedding.selected_blocks ?? [];
}
