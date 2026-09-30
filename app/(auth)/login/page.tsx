'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BlobBackground } from '@/components/marketing/BlobBackground';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [formKey, setFormKey] = useState(0);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'verifying' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState(() => {
    if (searchParams.get('error') !== 'auth') return '';
    const reason = searchParams.get('reason');
    return reason
      ? `Authentication failed: ${reason}`
      : 'Authentication failed. Please try again.';
  });
  const isLocalSupabase =
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL === 'string' &&
    /127\.0\.0\.1|localhost/.test(process.env.NEXT_PUBLIC_SUPABASE_URL);

  // Callback on the same host that started login (PKCE cookie is host-bound).
  // Use https://reserve-guest.vercel.app/login in production — not localhost.
  const authRedirectTo = `${window.location.origin}/callback`;

  async function handleGoogle() {
    setErrorMsg('');
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: authRedirectTo,
        skipBrowserRedirect: true,
      },
    });
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    if (data.url) window.location.assign(data.url);
  }

  async function handleSendOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEmail = new FormData(e.currentTarget).get('email');
    const resolved = (typeof formEmail === 'string' ? formEmail : email).trim();
    if (!resolved) return;
    setEmail(resolved);
    setStatus('sending');
    setErrorMsg('');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: resolved,
        options: {
          shouldCreateUser: true,
          // Prefer OTP code entry in-app (avoids email-client link prefetch killing the token).
          // Keep redirect for templates that still render a link.
          emailRedirectTo: authRedirectTo,
        },
      });
      if (error) {
        setErrorMsg(error.message);
        setStatus('error');
      } else {
        setStatus('sent');
        setOtp('');
      }
    } catch {
      setErrorMsg('Unable to reach the server. Please check your connection and try again.');
      setStatus('error');
    }
  }

  async function handleVerifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const token = otp.replace(/\s/g, '');
    if (!email || token.length < 6) return;
    setStatus('verifying');
    setErrorMsg('');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });
      if (error) {
        setErrorMsg(error.message);
        setStatus('sent');
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setErrorMsg('Signed in, but no user was returned. Please try again.');
        setStatus('sent');
        return;
      }

      const { data: wedding } = await supabase
        .from('weddings')
        .select('id')
        .eq('couple_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      router.replace(wedding ? '/dashboard' : '/setup');
    } catch {
      setErrorMsg('Unable to verify that code. Please try again.');
      setStatus('sent');
    }
  }

  // ── OTP entry ────────────────────────────────────────────────────────────────
  if (status === 'sent' || status === 'verifying') {
    return (
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'var(--font-yeseva)', fontSize: 28, color: 'var(--sage)', margin: '0 0 8px' }}>
            Reserve
          </h1>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 15, fontWeight: 600, color: 'var(--text)', margin: '0 0 8px' }}>
            Check your email
          </p>
          <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 4px' }}>
            We sent a sign-in email to
          </p>
          <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, fontWeight: 600, color: 'var(--sage)', margin: '0 0 12px' }}>
            {email}
          </p>
          <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 12, color: 'var(--text-tertiary)', margin: '0 0 16px', lineHeight: 1.5 }}>
            {isLocalSupabase ? (
              <>
                Open{' '}
                <a href="http://127.0.0.1:54324" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--sage)' }}>
                  Inbucket
                </a>
                , copy the 6-digit code (or click the link on this same computer).
              </>
            ) : (
              'Enter the 6-digit code from the email. If you only see a link, open it on this same computer.'
            )}
          </p>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(196,86,74,0.08)', border: '1px solid var(--error)',
            borderRadius: 8, padding: '10px 14px', marginBottom: 16,
            fontSize: 13, color: 'var(--error)', fontFamily: 'var(--font-montserrat)',
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleVerifyOtp}>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>ONE-TIME CODE</label>
            <input
              type="text"
              name="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={8}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, '').slice(0, 8))}
              placeholder="123456"
              autoFocus
              required
              style={{ ...inputStyle, letterSpacing: '0.35em', fontWeight: 600, textAlign: 'center' }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--border-active)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>
          <button
            type="submit"
            disabled={status === 'verifying' || otp.replace(/\s/g, '').length < 6}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 8, border: 'none',
              background: 'var(--sage)', color: 'white',
              fontFamily: 'var(--font-montserrat)', fontSize: 13, fontWeight: 600,
              letterSpacing: '0.5px',
              cursor: status === 'verifying' ? 'not-allowed' : 'pointer',
              opacity: status === 'verifying' || otp.replace(/\s/g, '').length < 6 ? 0.6 : 1,
            }}
          >
            {status === 'verifying' ? 'Verifying…' : 'Verify and continue'}
          </button>
        </form>

        <button
          onClick={() => {
            setStatus('idle');
            setEmail('');
            setOtp('');
            setErrorMsg('');
            setFormKey((k) => k + 1);
          }}
          style={{
            width: '100%', padding: '11px', borderRadius: 8, marginTop: 12,
            border: '1px solid var(--border)', background: 'var(--surface-alt)',
            fontFamily: 'var(--font-montserrat)', fontSize: 12, fontWeight: 600,
            color: 'var(--text-secondary)', cursor: 'pointer', letterSpacing: '0.3px',
          }}
        >
          Use a different email
        </button>
      </div>
    );
  }

  // ── Default state ─────────────────────────────────────────────────────────────
  return (
    <div style={cardStyle}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-yeseva)', fontSize: 28, color: 'var(--sage)', margin: '0 0 6px' }}>
          Reserve
        </h1>
        <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: 18, color: 'var(--text-secondary)', margin: 0 }}>
          The R in RSVP
        </p>
      </div>

      {errorMsg && (
        <div style={{
          background: 'rgba(196,86,74,0.08)', border: '1px solid var(--error)',
          borderRadius: 8, padding: '10px 14px', marginBottom: 20,
          fontSize: 13, color: 'var(--error)', fontFamily: 'var(--font-montserrat)',
        }}>
          {errorMsg}
        </div>
      )}

      <button
        onClick={handleGoogle}
        style={{
          width: '100%', padding: '12px 16px', borderRadius: 8, marginBottom: 8,
          border: '1px solid var(--border)', background: 'var(--surface-alt)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          fontFamily: 'var(--font-montserrat)', fontSize: 13, fontWeight: 600,
          color: 'var(--text)', cursor: 'pointer', transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface-alt)')}
      >
        <GoogleIcon />
        Continue with Google
      </button>
      {isLocalSupabase && (
        <p style={{
          fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'var(--text-tertiary)',
          margin: '0 0 16px', lineHeight: 1.5,
        }}>
          Local Supabase Google is not configured (`supabase/.env` client ID/secret are empty).
          Use the email code below, or point `.env.local` at the hosted project.
        </p>
      )}
      {!isLocalSupabase && <div style={{ marginBottom: 12 }} />}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: '0.5px' }}>
          OR
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      <form onSubmit={handleSendOtp}>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>EMAIL ADDRESS</label>
          <input
            key={formKey}
            type="email"
            name="email"
            defaultValue=""
            placeholder="you@example.com"
            autoFocus
            autoComplete="email"
            required
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = 'var(--border-active)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>
        <button
          type="submit"
          disabled={status === 'sending'}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 8, border: 'none',
            background: 'var(--sage)', color: 'white',
            fontFamily: 'var(--font-montserrat)', fontSize: 13, fontWeight: 600,
            letterSpacing: '0.5px', cursor: status === 'sending' ? 'not-allowed' : 'pointer',
            opacity: status === 'sending' ? 0.6 : 1,
          }}
        >
          {status === 'sending' ? 'Sending…' : 'Email me a code'}
        </button>
      </form>

      <p style={{
        textAlign: 'center', fontFamily: 'var(--font-montserrat)', fontSize: 11,
        color: 'var(--text-tertiary)', marginTop: 24, marginBottom: 0,
      }}>
        By continuing, you agree to our Terms &amp; Privacy Policy
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

const cardStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  padding: '40px 36px',
  width: '100%',
  maxWidth: 420,
  position: 'relative',
  zIndex: 1,
  boxShadow: 'var(--card-shadow)',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-montserrat)', fontSize: 11,
  fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.5px', marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 12px', borderRadius: 8,
  border: '1px solid var(--border)', background: 'var(--bg)',
  color: 'var(--text)', fontFamily: 'var(--font-montserrat)',
  fontSize: 14, outline: 'none', boxSizing: 'border-box',
};

export default function LoginPage() {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative',
    }}>
      <BlobBackground />
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
