/**
 * Sage template — RSVP block (owned copy).
 * Monochrome and civil-classic continue to use `components/invite/sections/RsvpSection`.
 */
import type { Invite, Rsvp } from '@/types';
import type { TemplateTheme } from '@/lib/template-theme';
import { PAD_SECTION } from '@/lib/template-theme';
import { RsvpForm } from '@/components/invite/RsvpForm';
import { LookupGate } from '@/components/invite/LookupGate';

interface Props {
  theme: TemplateTheme;
  invite: Invite | null;
  rsvps: Rsvp[];
  slug: string;
  mealOptions: string[];
  showLookup: boolean;
}

export function RsvpSection({ theme: t, invite, rsvps, slug, mealOptions, showLookup }: Props) {
  const needsLookup = showLookup && !invite;
  const needsRsvp = invite && invite.status === 'pending';

  if (!needsLookup && !needsRsvp) return null;

  return (
    <section
      id="rsvp"
      style={{
        background: t.pageBg,
        padding: PAD_SECTION,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: 440 }}>
        {needsLookup && <LookupGate slug={slug} />}
        {needsRsvp && (
          <RsvpForm
            invite={invite}
            existingRsvps={rsvps}
            slug={slug}
            mealOptions={mealOptions}
            theme={t}
          />
        )}
      </div>
    </section>
  );
}
