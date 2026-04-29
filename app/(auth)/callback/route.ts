import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/dashboard';

  const supabase = await createClient();
  let authError = true;

  // PKCE flow (OAuth + newer magic links)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) authError = false;
  }
  // Implicit flow (magic link with token_hash)
  else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) authError = false;
  }

  if (!authError) {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: wedding } = await supabase
        .from('weddings')
        .select('id')
        .eq('couple_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const destination = wedding ? next : '/setup';
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
