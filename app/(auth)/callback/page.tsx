'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { EmailOtpType } from '@supabase/supabase-js';

/**
 * Client-side callback so PKCE `code_verifier` is read from the same browser
 * cookie jar that started OAuth/magic-link. A server Route Handler often fails
 * with "PKCE code verifier not found" when Site URL / port drift happens.
 */
function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Signing you in…');

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      const code = searchParams.get('code');
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type') as EmailOtpType | null;
      const nextParam = searchParams.get('next');
      const next =
        nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')
          ? nextParam
          : '/dashboard';

      const supabase = createClient();
      let authError: string | null = 'missing_params';

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        authError = error ? error.message : null;
      } else if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type });
        authError = error ? error.message : null;
      }

      if (cancelled) return;

      if (authError) {
        const login = new URL('/login', window.location.origin);
        login.searchParams.set('error', 'auth');
        login.searchParams.set('reason', authError.slice(0, 120));
        router.replace(`${login.pathname}${login.search}`);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/login?error=auth&reason=no_user');
        return;
      }

      const { data: wedding } = await supabase
        .from('weddings')
        .select('id')
        .eq('couple_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setStatus('Success — redirecting…');
      router.replace(wedding ? next : '/setup');
    }

    void finish().catch(() => {
      if (!cancelled) {
        router.replace('/login?error=auth&reason=callback_failed');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-montserrat), system-ui, sans-serif',
        color: 'var(--text-secondary, #666)',
        fontSize: 14,
      }}
    >
      {status}
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-montserrat), system-ui, sans-serif',
            color: 'var(--text-secondary, #666)',
            fontSize: 14,
          }}
        >
          Signing you in…
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
