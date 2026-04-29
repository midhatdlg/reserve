'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Rsvp {
  id: string;
  invite_id: string;
  person_name: string;
  attending: boolean;
  meal_preference: string | null;
  dietary_notes: string | null;
  created_at: string;
  invites?: { guest_name: string } | null;
}

interface Invite {
  id: string;
  guest_name: string;
  max_guests: number;
  status: string;
  table_number: number | null;
}

interface Props {
  weddingId: string;
  initialRsvps: Rsvp[];
  invites: Invite[];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function RsvpTracker({ weddingId, initialRsvps, invites }: Props) {
  const [rsvps, setRsvps] = useState<Rsvp[]>(initialRsvps);
  const [pulse, setPulse] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`rsvps-${weddingId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'rsvps', filter: `wedding_id=eq.${weddingId}` },
        (payload) => {
          const newRsvp = payload.new as Rsvp;
          setRsvps((prev) => [newRsvp, ...prev].slice(0, 50));
          setPulse(newRsvp.id);
          setTimeout(() => setPulse(null), 2000);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [weddingId]);

  // Group rsvps by invite
  const byInvite: Record<string, Rsvp[]> = {};
  rsvps.forEach((r) => {
    if (!byInvite[r.invite_id]) byInvite[r.invite_id] = [];
    byInvite[r.invite_id].push(r);
  });

  const respondedInvites = invites.filter((i) => i.status === 'responded' || i.status === 'declined');

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '18px 22px',
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
      }}>
        <h3 style={{
          fontFamily: 'var(--font-caslon)',
          fontSize: 18,
          fontStyle: 'italic',
          fontWeight: 400,
          color: 'var(--text)',
          margin: 0,
        }}>
          Replies, lately
        </h3>
        <a
          href="/dashboard/guests"
          style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '1.5px',
            color: 'var(--accent)',
            textDecoration: 'none',
            textTransform: 'uppercase',
          }}
        >
          View all →
        </a>
      </div>

      {/* Feed */}
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {respondedInvites.length === 0 ? (
          <div style={{ padding: '32px 22px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-caslon)', fontSize: 14, fontStyle: 'italic', color: 'var(--text-tertiary)', margin: 0 }}>
              Responses will appear here as guests RSVP
            </p>
          </div>
        ) : (
          respondedInvites.map((invite) => {
            const inviteRsvps = byInvite[invite.id] ?? [];
            const attending = inviteRsvps.filter((r) => r.attending);
            const isNew = inviteRsvps.some((r) => r.id === pulse);
            const latestRsvp = inviteRsvps[0];

            const plusCount = attending.length > 1 ? attending.length - 1 : 0;
            const isAccepted = attending.length > 0;

            return (
              <div
                key={invite.id}
                style={{
                  padding: '14px 22px',
                  borderTop: '1px solid var(--border)',
                  background: isNew ? 'var(--sage-dim)' : 'transparent',
                  transition: 'background 0.5s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                {/* Status dot */}
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: isAccepted ? 'var(--sage)' : 'var(--text-tertiary)',
                  flexShrink: 0,
                }} />

                {/* Name + status */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{
                    fontFamily: 'var(--font-montserrat)',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--text)',
                  }}>
                    {invite.guest_name}
                  </span>
                  <br />
                  <span style={{
                    fontFamily: 'var(--font-caslon)',
                    fontSize: 13,
                    fontStyle: 'italic',
                    color: 'var(--text-secondary)',
                  }}>
                    {isAccepted
                      ? `Accepted${plusCount > 0 ? ` · plus ${plusCount === 1 ? 'one' : plusCount}` : ''}`
                      : 'Sent regrets'}
                  </span>
                </div>

                {/* Time ago */}
                <span style={{
                  fontFamily: 'var(--font-montserrat)',
                  fontSize: 11,
                  color: 'var(--text-tertiary)',
                  flexShrink: 0,
                }}>
                  {latestRsvp ? timeAgo(latestRsvp.created_at) : ''}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
