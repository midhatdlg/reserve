import type { Invite, Rsvp } from '@/types';
import type { TemplateTheme } from '@/lib/template-theme';
import { PAD_SECTION } from '@/lib/template-theme';
import { RsvpForm } from '../RsvpForm';
import { LookupGate } from '../LookupGate';

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
