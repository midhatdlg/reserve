import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { lookupSchema } from '@/lib/validators';
import { resolveInviteMatch, type InviteForLookup } from '@/lib/invite-lookup';
import { checkRateLimit } from '@/lib/rate-limit';
import {
  RSVP_SESSION_COOKIE,
  RSVP_SESSION_MAX_AGE_SECONDS,
  signRsvpSession,
} from '@/lib/session';

interface Params {
  params: Promise<{ slug: string }>;
}

export async function POST(req: Request, { params }: Params) {
  const { slug } = await params;

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()
    ?? '0.0.0.0';
  const { allowed } = await checkRateLimit(`lookup:${slug}:${ip}`);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many attempts. Please try again shortly.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = lookupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, strict_name_match, is_published')
    .eq('slug', slug)
    .maybeSingle();

  if (!wedding || !wedding.is_published) {
    return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
  }

  const { data: invites } = await supabase
    .from('invites')
    .select('id, wedding_id, guest_name, email, max_guests, table_number, table_name')
    .eq('wedding_id', wedding.id);

  const match = resolveInviteMatch(
    (invites ?? []) as InviteForLookup[],
    parsed.data.name,
    parsed.data.email
  );

  if (match.kind === 'ambiguous') {
    return NextResponse.json({ status: 'ambiguous', count: match.count });
  }

  if (match.kind === 'unmatched') {
    if (wedding.strict_name_match) {
      return NextResponse.json({ status: 'unmatched' });
    }
    // Open RSVP: create a new invite on the fly so the RSVP flow has a row
    // to attach to. Cap auto-created invites to prevent abuse.
    const { count: existingCount } = await supabase
      .from('invites')
      .select('id', { count: 'exact', head: true })
      .eq('wedding_id', wedding.id);
    const MAX_OPEN_INVITES = 500;
    if ((existingCount ?? 0) >= MAX_OPEN_INVITES) {
      return NextResponse.json(
        { error: 'Guest list is full. Please contact the couple directly.' },
        { status: 400 }
      );
    }

    const { data: created, error: createErr } = await supabase
      .from('invites')
      .insert({
        wedding_id: wedding.id,
        guest_name: parsed.data.name.trim(),
        email: parsed.data.email ?? null,
        max_guests: 1,
        status: 'pending',
      })
      .select('id, wedding_id, guest_name, email, max_guests, table_number, table_name')
      .single();

    if (createErr || !created) {
      return NextResponse.json({ error: 'Could not create invite' }, { status: 500 });
    }

    return respondMatched(wedding.id, created as InviteForLookup);
  }

  return respondMatched(wedding.id, match.invite);
}

function respondMatched(weddingId: string, invite: InviteForLookup) {
  const exp = Math.floor(Date.now() / 1000) + RSVP_SESSION_MAX_AGE_SECONDS;
  const token = signRsvpSession({
    inviteId: invite.id,
    weddingId,
    exp,
  });

  const res = NextResponse.json({
    status: 'matched',
    invite: {
      id: invite.id,
      guest_name: invite.guest_name,
      max_guests: invite.max_guests,
      table_number: invite.table_number,
      table_name: invite.table_name,
    },
  });
  res.cookies.set(RSVP_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: RSVP_SESSION_MAX_AGE_SECONDS,
  });
  return res;
}
