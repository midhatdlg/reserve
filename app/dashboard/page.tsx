import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { RsvpTracker } from '@/components/dashboard/RsvpTracker';
import { SeatingWidget } from '@/components/dashboard/SeatingWidget';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function getDaysToGo(dateStr: string): number {
  const target = new Date(dateStr + 'T00:00:00').getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((target - now) / (1000 * 60 * 60 * 24)));
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: couple } = await supabase
    .from('couples')
    .select('name_1, name_2')
    .eq('id', user.id)
    .maybeSingle();

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, slug, title, wedding_date, venue_name, is_published')
    .eq('couple_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!wedding) redirect('/setup');

  const [statsRes, rsvpsRes, invitesRes] = await Promise.all([
    supabase.from('wedding_stats').select('*').eq('wedding_id', wedding.id).maybeSingle(),
    supabase
      .from('rsvps')
      .select('*, invites(guest_name)')
      .eq('wedding_id', wedding.id)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('invites')
      .select('id, guest_name, max_guests, status, table_number')
      .eq('wedding_id', wedding.id)
      .order('created_at'),
  ]);

  const stats = statsRes.data ?? { attending: 0, declined: 0, pending: 0, total_invites: 0, total_seats: 0 };
  const recentRsvps = rsvpsRes.data ?? [];
  const invites = invitesRes.data ?? [];

  const daysToGo = wedding.wedding_date ? getDaysToGo(wedding.wedding_date) : null;
  const firstName = couple?.name_1 ?? 'there';

  // Count new replies today
  const today = new Date().toISOString().slice(0, 10);
  const newToday = recentRsvps.filter((r) => r.created_at?.startsWith(today)).length;

  // Seating data
  const totalTables = new Set(invites.filter((i) => i.table_number).map((i) => i.table_number)).size;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Header — days to go + greeting */}
      <div style={{ marginBottom: 32 }}>
        {daysToGo !== null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--sage)' }} />
            <span style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '2px',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
            }}>
              {daysToGo} days to go
            </span>
          </div>
        )}
        <h1 style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: 38,
          fontWeight: 400,
          color: 'var(--text)',
          margin: '0 0 4px',
          lineHeight: 1.15,
        }}>
          {getGreeting()}, {firstName}.
        </h1>
        <p style={{
          fontFamily: 'var(--font-caslon)',
          fontSize: 16,
          fontStyle: 'italic',
          color: 'var(--text-secondary)',
          margin: 0,
        }}>
          {newToday > 0
            ? `${newToday === 1 ? 'One new reply' : `${newToday} new replies`} since yesterday.`
            : 'No new replies yet.'}
        </p>
      </div>

      {/* 4 stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
        {[
          { label: 'Attending', value: stats.attending },
          { label: 'Regrets',   value: stats.declined },
          { label: 'Pending',   value: stats.pending },
          { label: 'Invited',   value: stats.total_invites },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '20px 18px',
          }}>
            <div style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 40,
              fontStyle: 'italic',
              fontWeight: 400,
              color: 'var(--text)',
              lineHeight: 1,
            }}>
              {value}
            </div>
            <div style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: 12,
              color: 'var(--text-secondary)',
              marginTop: 6,
            }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Two-column: Replies feed + Seating widget */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <RsvpTracker
          weddingId={wedding.id}
          initialRsvps={recentRsvps}
          invites={invites}
        />
        <SeatingWidget
          invites={invites}
          totalInvited={stats.total_invites}
        />
      </div>

      {/* Export */}
      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <a
          href="/api/export/guests"
          style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--accent)',
            textDecoration: 'none',
            letterSpacing: '0.3px',
          }}
        >
          Export guest list (CSV) →
        </a>
      </div>
    </div>
  );
}
