import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { questionSubmitSchema } from '@/lib/validators';
import { readRsvpSession } from '@/lib/session';

/**
 * Accept a guest question. Two entry points:
 *   1. Authenticated-as-invite: the guest has a valid RSVP session cookie.
 *      We link the question to their invite and accept it as a named question.
 *   2. Anonymous (session missing): the guest must supply an `author_name`
 *      so the couple can respond. Anonymous submissions land unlinked.
 *
 * In both cases the question is inserted with `is_public = false`. The
 * couple promotes it from the dashboard (moderation todo).
 *
 * The request URL is expected to contain `?slug=<wedding-slug>` so we know
 * which wedding to attach the question to when there is no session.
 */
export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug') ?? '';

    const body = await request.json().catch(() => null);
    const parsed = questionSubmitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const session = await readRsvpSession(cookies());
    const supabase = createAdminClient();

    let weddingId: string | null = session?.weddingId ?? null;
    let inviteId: string | null = session?.inviteId ?? null;

    if (!weddingId) {
      if (!slug) {
        return NextResponse.json({ error: 'Missing wedding context.' }, { status: 400 });
      }
      if (!parsed.data.author_name) {
        return NextResponse.json({ error: 'Please include your name.' }, { status: 400 });
      }
      const { data: wedding } = await supabase
        .from('weddings')
        .select('id, is_published')
        .eq('slug', slug)
        .maybeSingle();
      if (!wedding || !wedding.is_published) {
        return NextResponse.json({ error: 'Wedding not found.' }, { status: 404 });
      }
      weddingId = wedding.id;
    }

    const identifier = inviteId ?? slug ?? 'anon';
    const { allowed } = await checkRateLimit(`question:${identifier}`);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const { data: question, error } = await supabase
      .from('questions')
      .insert({
        wedding_id: weddingId,
        invite_id: inviteId,
        question_text: parsed.data.question_text,
        author_name: parsed.data.author_name ?? null,
        author_email: parsed.data.author_email ?? null,
        is_public: false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, question });
  } catch (err) {
    console.error('Question error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
