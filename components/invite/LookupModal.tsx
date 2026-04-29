'use client';

import { useEffect, useRef, useState } from 'react';

type Status = 'idle' | 'submitting' | 'ambiguous' | 'unmatched' | 'error';

interface Props {
  slug: string;
  /** Called after a successful match. Parent usually reloads the page or
   *  re-fetches so the RSVP form renders with the matched invite. */
  onMatched: () => void;
  /** Called when the guest chooses to message the couple instead. */
  onMessageCouple: (name: string, email: string) => void;
}

export function LookupModal({ slug, onMatched, onMessageCouple }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [needsEmail, setNeedsEmail] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    setStatus('submitting');
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/invite/${encodeURIComponent(slug)}/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() || undefined }),
      });

      if (res.status === 429) {
        setStatus('error');
        setErrorMsg('Too many attempts — please wait a moment and try again.');
        return;
      }
      if (res.status === 404) {
        setStatus('error');
        setErrorMsg("We couldn't find this invite.");
        return;
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setStatus('error');
        setErrorMsg(body.error ?? 'Something went wrong. Please try again.');
        return;
      }

      const body = (await res.json()) as
        | { status: 'matched' }
        | { status: 'ambiguous'; count: number }
        | { status: 'unmatched' };

      if (body.status === 'matched') {
        onMatched();
        return;
      }
      if (body.status === 'ambiguous') {
        setStatus('ambiguous');
        setNeedsEmail(true);
        return;
      }
      setStatus('unmatched');
    } catch {
      setStatus('error');
      setErrorMsg('Network error — please check your connection.');
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lookup-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <form
        onSubmit={submit}
        style={{
          background: '#F5F0E8',
          borderRadius: 12,
          padding: '28px 24px',
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}
      >
        <h2
          id="lookup-title"
          style={{
            fontFamily: 'var(--font-caslon, Libre Caslon Text), Georgia, serif',
            fontSize: 22,
            margin: '0 0 6px',
            color: '#2C3A2E',
            textAlign: 'center',
          }}
        >
          Find your invitation
        </h2>
        <p
          style={{
            fontSize: 14,
            color: '#6B6560',
            textAlign: 'center',
            margin: '0 0 20px',
          }}
        >
          Please enter your full name exactly as the couple has it.
        </p>

        <label
          htmlFor="lookup-name"
          style={{ display: 'block', fontSize: 13, color: '#2C3A2E', marginBottom: 6 }}
        >
          Full name
        </label>
        <input
          id="lookup-name"
          ref={nameRef}
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setStatus('idle');
            setErrorMsg(null);
          }}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #CFC9BF',
            background: 'white',
            fontSize: 15,
            marginBottom: 14,
          }}
        />

        {needsEmail && (
          <>
            <p role="alert" style={{ fontSize: 13, color: '#8A4A2A', margin: '0 0 10px' }}>
              We found more than one guest with that name. Please add your email to continue.
            </p>
            <label
              htmlFor="lookup-email"
              style={{ display: 'block', fontSize: 13, color: '#2C3A2E', marginBottom: 6 }}
            >
              Email
            </label>
            <input
              id="lookup-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #CFC9BF',
                background: 'white',
                fontSize: 15,
                marginBottom: 14,
              }}
            />
          </>
        )}

        {errorMsg && (
          <p role="alert" style={{ fontSize: 13, color: '#B03A2E', margin: '0 0 12px' }}>
            {errorMsg}
          </p>
        )}

        {status === 'unmatched' && (
          <div
            role="alert"
            style={{
              padding: 12,
              borderRadius: 8,
              background: '#F3E9DD',
              fontSize: 13,
              color: '#4A3A2E',
              marginBottom: 14,
            }}
          >
            We couldn't find that name on the guest list.
            {' '}
            <button
              type="button"
              onClick={() => onMessageCouple(name.trim(), email.trim())}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: '#2C3A2E',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              Message the couple
            </button>
            {' '}and they'll be in touch.
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 8,
            border: 'none',
            background: '#2C3A2E',
            color: '#F5F0E8',
            fontSize: 15,
            cursor: status === 'submitting' ? 'wait' : 'pointer',
            opacity: status === 'submitting' ? 0.7 : 1,
          }}
        >
          {status === 'submitting' ? 'Looking…' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
