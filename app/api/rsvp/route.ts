import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { rsvpSubmitSchema } from '@/lib/validators';
import { readRsvpSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const session = await readRsvpSession(cookies());
    if (!session) {
      return NextResponse.json({ error: 'Please look up your name first.' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = rsvpSubmitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { guests } = parsed.data;

    const { allowed } = await checkRateLimit(`rsvp:${session.inviteId}`);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const supabase = createAdminClient();

    const { data: invite, error: inviteErr } = await supabase
      .from('invites')
      .select('id, wedding_id, max_guests, table_number, table_name, status')
      .eq('id', session.inviteId)
      .eq('wedding_id', session.weddingId)
      .maybeSingle();

    if (inviteErr || !invite) {
      return NextResponse.json({ error: 'Invite not found.' }, { status: 404 });
    }

    if (guests.length > invite.max_guests) {
      return NextResponse.json(
        {
          error: `This invite allows a maximum of ${invite.max_guests} guest${invite.max_guests !== 1 ? 's' : ''}.`,
        },
        { status: 400 }
      );
    }

    // Atomic: delete old RSVPs + insert new ones + update invite status in a
    // single transaction so a failed insert can't leave the guest with zero rows.
    const anyAttending = guests.some((g) => g.attending);
    const rsvpRows = guests.map((g) => ({
      invite_id: invite.id,
      wedding_id: invite.wedding_id,
      person_name: g.person_name,
      attending: g.attending,
      meal_preference: g.meal_preference ?? null,
      dietary_notes: g.dietary_notes ?? null,
    }));

    const { error: rpcErr } = await supabase.rpc('replace_rsvps', {
      p_invite_id: invite.id,
      p_status: anyAttending ? 'responded' : 'declined',
      p_rows: rsvpRows,
    });
    if (rpcErr) throw rpcErr;

    // The guest page relies on ISR; invalidate it so the RSVP summary is
    // immediate rather than stale for up to `revalidate` seconds.
    const { data: wedding } = await supabase
      .from('weddings')
      .select('slug')
      .eq('id', invite.wedding_id)
      .maybeSingle();
    if (wedding?.slug) {
      revalidatePath(`/invite/${wedding.slug}`);
    }

    return NextResponse.json({
      success: true,
      table_number: invite.table_number,
      table_name: invite.table_name,
    });
  } catch (err) {
    console.error('RSVP error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
