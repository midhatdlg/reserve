import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { createPublicClient } from '@/lib/supabase/public';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  loadInvitePageData,
  resolveVisibleBlocks,
} from '@/lib/invite-page';
import { readRsvpSession } from '@/lib/session';
import { InviteHero } from '@/components/invite/InviteHero';
import { CountdownTimer } from '@/components/invite/CountdownTimer';
import { RsvpForm } from '@/components/invite/RsvpForm';
import { ItineraryTimeline } from '@/components/invite/ItineraryTimeline';
import { TableReveal } from '@/components/invite/TableReveal';
import { QnaSection } from '@/components/invite/QnaSection';
import { LookupGate } from '@/components/invite/LookupGate';
import { PhotoGallery } from '@/components/invite/PhotoGallery';
import { VenueMap } from '@/components/invite/VenueMap';
import { EnvelopeAnimation } from '@/components/invite/EnvelopeAnimation';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = createPublicClient();
  const data = await loadInvitePageData(supabase, slug);
  if (!data) return { title: 'Reserve' };
  return { title: data.wedding.title ?? 'Wedding' };
}

export default async function InvitePage({ params }: Props) {
  const { slug } = await params;
  const publicClient = createPublicClient();

  const cookieStore = await cookies();
  const session = await readRsvpSession(cookieStore);

  // Public content (wedding, events, photos, public questions) is read via
  // the anon client so RLS policies enforce `is_published = true`. Only
  // when we have a signed RSVP session do we touch the admin client — and
  // even then only for the invite row that the session already proves is
  // the guest's.
  const privileged = session ? createAdminClient() : undefined;
  const data = await loadInvitePageData(
    publicClient,
    slug,
    session?.inviteId ?? null,
    privileged
  );
  if (!data) notFound();

  const { wedding, invite, events, rsvps, photos, questions } = data;
  const blocks = resolveVisibleBlocks(wedding);

  const guestName = invite?.guest_name ?? null;
  const maxGuests = invite?.max_guests ?? 1;
  const showLookup = !invite && !wedding.save_the_date_mode;
  const useEnvelope = wedding.envelope_enabled && !wedding.save_the_date_mode;

  const bgColor = wedding.invite_bg_color ?? '#F5F0E8';

  const body = (
    <div style={{
      minHeight: '100vh',
      background: bgColor,
      display: 'flex',
      justifyContent: 'center',
    }}>
      <main style={{
        width: '100%',
        maxWidth: 520,
        padding: '0 0 60px',
      }}>
        {wedding.save_the_date_mode && (
          <div
            role="note"
            style={{
              textAlign: 'center',
              padding: '14px 20px 0',
              fontFamily: 'var(--font-caslon, Libre Caslon Text), Georgia, serif',
              fontSize: 12,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#8B7355',
            }}
          >
            Save the Date · Full details to follow
          </div>
        )}
        <InviteHero wedding={wedding} invite={invite ?? syntheticInvite(wedding.id)} />

        {guestName && (
          <div style={{
            padding: '20px 24px 0',
            textAlign: 'center',
          }}>
            <p style={{
              fontFamily: 'var(--font-caslon, Libre Caslon Text), Georgia, serif',
              fontSize: 15,
              fontStyle: 'italic',
              color: '#6B6560',
              margin: 0,
              lineHeight: 1.6,
            }}>
              Dear {guestName}{maxGuests > 1 ? `, you have ${maxGuests} seats reserved` : ''}
            </p>
          </div>
        )}

        {showLookup && <LookupGate slug={slug} />}

        <div style={{ padding: '28px 24px 0', display: 'flex', flexDirection: 'column', gap: 36 }}>
          {blocks.includes('countdown') && wedding.wedding_date && (
            <CountdownTimer
              targetDate={wedding.wedding_date}
              timezone={wedding.timezone ?? 'UTC'}
            />
          )}

          {blocks.includes('rsvp') && invite && (
            <RsvpForm
              invite={invite}
              existingRsvps={rsvps}
              slug={slug}
              mealOptions={wedding.meal_options}
            />
          )}

          {blocks.includes('table') && invite && (
            <TableReveal invite={invite} />
          )}

          {blocks.includes('itinerary') && events.length > 0 && (
            <ItineraryTimeline events={events} />
          )}

          {blocks.includes('venue') && wedding.venue_lat && wedding.venue_lng && (
            <VenueMap wedding={wedding} />
          )}

          {blocks.includes('photos') && photos.length > 0 && (
            <PhotoGallery photos={photos} />
          )}

          {blocks.includes('qna') && (
            <QnaSection questions={questions} token={slug} />
          )}
        </div>

        <div style={{
          padding: '48px 24px 0',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'var(--font-caslon, Libre Caslon Text), Georgia, serif',
            fontSize: 10,
            fontStyle: 'italic',
            color: '#9E9890',
            letterSpacing: '0.5px',
          }}>
            Powered by Reserve
          </p>
        </div>
      </main>
    </div>
  );

  if (useEnvelope) {
    return (
      <EnvelopeAnimation
        storageKey={wedding.id}
        bgColor={bgColor}
        initials={wedding.envelope_initials ?? undefined}
        coupleName={wedding.title ?? undefined}
      >
        {body}
      </EnvelopeAnimation>
    );
  }

  return body;
}

// Minimal invite stub so the hero still renders for anonymous visitors. The
// `InviteHero` component only reads the wedding for its copy; the invite is
// required for typing but not for visual content.
function syntheticInvite(weddingId: string) {
  return {
    id: '',
    wedding_id: weddingId,
    token: '',
    guest_name: 'Guest',
    max_guests: 1,
    table_number: null,
    table_name: null,
    email: null,
    phone: null,
    status: 'pending' as const,
    responded_at: null,
    created_at: '1970-01-01T00:00:00Z',
  };
}
