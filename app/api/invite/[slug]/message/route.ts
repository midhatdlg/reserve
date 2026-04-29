import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { messageCoupleSchema } from '@/lib/validators';
import { checkRateLimit } from '@/lib/rate-limit';
import { sendMessageCouple } from '@/lib/resend';

interface Params {
  params: Promise<{ slug: string }>;
}

/**
 * "Message the couple" fallback. A visitor who cannot find their name on the
 * guest list can send a short note to the couple. We:
 *
 *   1. Persist the message as a `questions` row tagged with the author's
 *      name/email but `invite_id = null` and `is_public = false`, so the
 *      couple sees it in their moderation queue alongside Q&A.
 *   2. Fire-and-forget an email via Resend so they can reply right away.
 *      Email failure does not fail the request — the row is the source of
 *      truth.
 */
export async function POST(req: Request, { params }: Params) {
  const { slug } = await params;

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()
    ?? '0.0.0.0';
  const { allowed } = await checkRateLimit(`message:${slug}:${ip}`);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many messages. Please try again shortly.' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = messageCoupleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, title, is_published, couple_id')
    .eq('slug', slug)
    .maybeSingle();

  if (!wedding || !wedding.is_published) {
    return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
  }

  const { data: couple } = await supabase
    .from('couples')
    .select('email')
    .eq('id', wedding.couple_id)
    .maybeSingle();

  const { error: insertErr } = await supabase
    .from('questions')
    .insert({
      wedding_id: wedding.id,
      invite_id: null,
      question_text: parsed.data.message,
      author_name: parsed.data.name,
      author_email: parsed.data.email ?? null,
      is_public: false,
    });

  if (insertErr) {
    return NextResponse.json({ error: 'Could not save your message.' }, { status: 500 });
  }

  if (couple?.email) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://thelovelist.app';
    try {
      await sendMessageCouple({
        to: couple.email,
        weddingTitle: wedding.title ?? 'your wedding',
        guestName: parsed.data.name,
        guestEmail: parsed.data.email ?? null,
        message: parsed.data.message,
        dashboardUrl: `${appUrl}/dashboard/questions`,
      });
    } catch (err) {
      // Never fail the guest-facing response on email delivery issues.
      console.error('sendMessageCouple failed', err);
    }
  }

  return NextResponse.json({ success: true });
}
