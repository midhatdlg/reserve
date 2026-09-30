import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login');

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, title')
    .eq('couple_id', user.id)
    .maybeSingle();

  if (!wedding) return new Response('Not found', { status: 404 });

  const { data: invites } = await supabase
    .from('invites')
    .select('*, rsvps(*)')
    .eq('wedding_id', wedding.id)
    .order('created_at');

  if (!invites) return new Response('No data', { status: 404 });

  const mode = new URL(request.url).searchParams.get('status');
  const slug = (wedding.title ?? 'guests').replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

  let csv: string;
  let filename: string;

  if (mode === 'attending') {
    // One row per attending person — for caterer/venue
    const rows: string[] = [
      ['Guest Name', 'Invite Group', 'Side', 'Group', 'Meal', 'Dietary Notes', 'Table'].join(','),
    ];
    type RsvpRow = { person_name: string; attending: boolean; meal_preference: string | null; dietary_notes: string | null; table_number: number | null; table_name: string | null };
    for (const invite of invites) {
      const rsvps = (invite.rsvps as RsvpRow[]) ?? [];
      for (const r of rsvps.filter((r) => r.attending)) {
        const tableLabel = r.table_name ? `${r.table_number ?? ''} ${r.table_name}`.trim() : (r.table_number ?? invite.table_number ?? '');
        const sideLabel = invite.side === 'bride' ? 'Bride' : invite.side === 'groom' ? 'Groom' : '';
        rows.push([esc(r.person_name), esc(invite.guest_name), esc(sideLabel), esc(invite.group_name), esc(r.meal_preference), esc(r.dietary_notes), esc(tableLabel)].join(','));
      }
    }
    csv = rows.join('\n');
    filename = `${slug}-attending.csv`;
  } else {
    const rows: string[] = [
      ['Guest Name', 'Allocation', 'Status', 'Table', 'Side', 'Group', 'Attending', 'Declined', 'Email', 'Phone'].join(','),
    ];
    for (const invite of invites) {
      const rsvps = (invite.rsvps as { attending: boolean }[]) ?? [];
      const attending = rsvps.filter((r) => r.attending).length;
      const declined = rsvps.filter((r) => !r.attending).length;
      const sideLabel = invite.side === 'bride' ? 'Bride' : invite.side === 'groom' ? 'Groom' : '';
      rows.push([
        esc(invite.guest_name),
        invite.max_guests,
        invite.status,
        invite.table_number ?? '',
        esc(sideLabel),
        esc(invite.group_name),
        attending,
        declined,
        esc(invite.email),
        esc(invite.phone),
      ].join(','));
    }
    csv = rows.join('\n');
    filename = `${slug}-guests.csv`;
  }

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
