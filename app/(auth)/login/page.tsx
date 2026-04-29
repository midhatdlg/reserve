'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BlobBackground } from '@/components/marketing/BlobBackground';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState(
    searchParams.get('error') === 'auth' ? 'Authentication failed. Please try again.' : ''
  );

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/callback?next=${next}`,
      },
    });
  }

  async function handleMagicLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    setStatus('sending');
    setErrorMsg('');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/callback?next=${next}`,
        },
      });
      if (error) {
        setErrorMsg(error.message);
        setStatus('error');
      } else {
        setStatus('sent');
      }
    } catch (err) {
      setErrorMsg('Unable to reach the server. Please check your connection and try again.');
      setStatus('error');
    }
  }

  // ── Success state ────────────────────────────────────────────────────────────
  if (status === 'sent') {
    return (
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-yeseva)', fontSize: 28, color: 'var(--sage)', margin: '0 0 8px' }}>
            Reserve
          </h1>
        </div>
        <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✉</div>
          <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 15, fontWeight: 600, color: 'var(--text)', margin: '0 0 8px' }}>
            Check your email
          </p>
          <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 4px' }}>
            We sent a sign-in link to
          </p>
          <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, fontWeight: 600, color: 'var(--sage)', margin: '0 0 20px' }}>
            {email}
          </p>
          <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 12, color: 'var(--text-tertiary)', margin: 0 }}>
            Click the link to sign in. Expires in 1 hour.
          </p>
        </div>
        <button
          onClick={() => { setStatus('idle'); setEmail(''); }}
          style={{
            width: '100%', padding: '11px', borderRadius: 8,
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
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-yeseva)', fontSize: 28, color: 'var(--sage)', margin: '0 0 6px' }}>
          Reserve
        </h1>
        <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: 18, color: 'var(--text-secondary)', margin: 0 }}>
          The R in RSVP
        </p>
      </div>

      {/* Error */}
      {errorMsg && (
        <div style={{
          background: 'rgba(196,86,74,0.08)', border: '1px solid var(--error)',
          borderRadius: 8, padding: '10px 14px', marginBottom: 20,
          fontSize: 13, color: 'var(--error)', fontFamily: 'var(--font-montserrat)',
        }}>
          {errorMsg}
        </div>
      )}

      {/* Google OAuth */}
      <button
        onClick={handleGoogle}
        style={{
          width: '100%', padding: '12px 16px', borderRadius: 8, marginBottom: 20,
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

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: '0.5px' }}>
          OR
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      {/* Magic link form */}
      <form onSubmit={handleMagicLink}>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>EMAIL ADDRESS</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoFocus
            required
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = 'var(--border-active)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>
        <button
          type="submit"
          disabled={status === 'sending' || !email}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 8, border: 'none',
            background: 'var(--sage)', color: 'white',
            fontFamily: 'var(--font-montserrat)', fontSize: 13, fontWeight: 600,
            letterSpacing: '0.5px', cursor: status === 'sending' || !email ? 'not-allowed' : 'pointer',
            opacity: status === 'sending' || !email ? 0.6 : 1,
          }}
        >
          {status === 'sending' ? 'Sending…' : 'Send me a sign-in link'}
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
