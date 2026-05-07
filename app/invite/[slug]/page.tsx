import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createPublicClient } from '@/lib/supabase/public';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  loadInvitePageData,
} from '@/lib/invite-page';
import { readRsvpSession } from '@/lib/session';
import { GuestConfirmation } from '@/components/invite/GuestConfirmation';
import type { TemplateTheme } from '@/lib/template-theme';
import { MonochromeInvite } from '@/components/invite/templates/monochrome/MonochromeInvite';
import { theme as monochromeTheme } from '@/components/invite/templates/monochrome/shared';
import { SageInvite } from '@/components/invite/templates/sage/SageInvite';
import { theme as sageTheme } from '@/components/invite/templates/sage/shared';
import type { Wedding, Event, Invite, Rsvp, Photo, Question } from '@/types';

type TemplateEntry = {
  Component: React.ComponentType<{
    wedding: Wedding; events: Event[]; invite: Invite | null;
    rsvps: Rsvp[]; photos: Photo[]; questions: Question[]; slug: string;
  }>;
  theme: TemplateTheme;
};

const TEMPLATE_MAP: Record<string, TemplateEntry> = {
  'monochrome': { Component: MonochromeInvite, theme: monochromeTheme },
  'civil-classic': { Component: MonochromeInvite, theme: monochromeTheme },
  'sage': { Component: SageInvite, theme: sageTheme },
};

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ edit?: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = createPublicClient();
  const data = await loadInvitePageData(supabase, slug);
  if (!data) return { title: 'Reserve' };
  return { title: data.wedding.title ?? 'Wedding' };
}

export default async function InvitePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { edit } = await searchParams;
  if (edit === 'true') {
    redirect(`/invite/${encodeURIComponent(slug)}/edit`);
  }
  const publicClient = createPublicClient();

  const cookieStore = await cookies();
  const session = await readRsvpSession(cookieStore);

  // Create an admin client when there's a valid guest session so unpublished
  // weddings remain accessible to returning guests.
  const needsPrivileged = !!session;
  const privileged = needsPrivileged ? createAdminClient() : undefined;
  const data = await loadInvitePageData(
    publicClient,
    slug,
    session?.inviteId ?? null,
    privileged
  );
  if (!data) notFound();

  const { wedding, invite, events, rsvps, photos, questions } = data;

  const guestName = invite?.guest_name ?? null;
  const maxGuests = invite?.max_guests ?? 1;
  const showLookup = !invite && !wedding.save_the_date_mode;

  // Guest has already RSVP'd — show confirmation / details page
  const hasResponded = invite && (invite.status === 'responded' || invite.status === 'declined');
  if (hasResponded) {
    const templateTheme = TEMPLATE_MAP[wedding.template_id]?.theme;
    return (
      <GuestConfirmation
        wedding={wedding}
        invite={invite}
        rsvps={rsvps}
        events={events}
        slug={slug}
        theme={templateTheme}
      />
    );
  }

  // Full-page template takeover
  const templateEntry = TEMPLATE_MAP[wedding.template_id];
  if (templateEntry) {
    const { Component } = templateEntry;
    return (
      <Component
        wedding={wedding}
        events={events}
        invite={invite}
        rsvps={rsvps}
        photos={photos}
        questions={questions}
        slug={slug}
      />
    );
  }

  // Fallback — should not normally reach here for monochrome/civil-classic
  return notFound();
}
