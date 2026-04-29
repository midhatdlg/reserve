'use client';

import { useState } from 'react';

interface Props {
  slug: string;
  initialName?: string;
  initialEmail?: string;
  onCancel: () => void;
  onSent: () => void;
}

/**
 * Full implementation (with the real endpoint and email notifier) lands with
 * the `message-couple` todo. This stub keeps the UX self-consistent: the
 * guest can go back to the lookup flow, and pressing "send" posts to
 * `/api/invite/[slug]/message` and closes on success.
 */
export function MessageCoupleModal({ slug, initialName = '', initialEmail = '', onCancel, onSent }: Props) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !message.trim()) {
      setError('Please add your name and a short message.');
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`/api/invite/${encodeURIComponent(slug)}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() || undefined, message: message.trim() }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? 'Could not send your message. Please try again.');
        setSending(false);
        return;
      }
      setSent(true);
      setSending(false);
      // Give the guest a moment to see the confirmation, then return them to
      // the lookup flow.
      setTimeout(onSent, 1600);
    } catch {
      setError('Network error — please try again.');
      setSending(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="msg-title"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <form
        onSubmit={submit}
        style={{
          background: '#F5F0E8', borderRadius: 12, padding: '28px 24px',
          width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}
      >
        <h2 id="msg-title" style={{ fontFamily: 'var(--font-caslon, Georgia), serif', fontSize: 22, margin: '0 0 6px', color: '#2C3A2E', textAlign: 'center' }}>
          Message the couple
        </h2>
        <p style={{ fontSize: 14, color: '#6B6560', textAlign: 'center', margin: '0 0 20px' }}>
          We'll forward this to the couple so they can add you or reply directly.
        </p>

        {sent ? (
          <p role="status" style={{ padding: 14, borderRadius: 8, background: '#E3EDE3', color: '#2C3A2E', textAlign: 'center' }}>
            Thanks — your message is on its way.
          </p>
        ) : (
          <>
            <label htmlFor="msg-name" style={labelStyle}>Your name</label>
            <input id="msg-name" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />

            <label htmlFor="msg-email" style={labelStyle}>Email (optional)</label>
            <input id="msg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />

            <label htmlFor="msg-body" style={labelStyle}>Message</label>
            <textarea id="msg-body" value={message} onChange={(e) => setMessage(e.target.value)} required rows={4} style={{ ...inputStyle, resize: 'vertical' }} />

            {error && <p role="alert" style={{ fontSize: 13, color: '#B03A2E', margin: '0 0 12px' }}>{error}</p>}

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={onCancel} style={{ ...buttonStyle, background: 'transparent', color: '#2C3A2E', border: '1px solid #2C3A2E' }}>
                Back
              </button>
              <button type="submit" disabled={sending} style={{ ...buttonStyle, opacity: sending ? 0.7 : 1, cursor: sending ? 'wait' : 'pointer' }}>
                {sending ? 'Sending…' : 'Send message'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, color: '#2C3A2E', marginBottom: 6 };
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  border: '1px solid #CFC9BF', background: 'white', fontSize: 15, marginBottom: 14,
};
const buttonStyle: React.CSSProperties = {
  flex: 1, padding: '12px 16px', borderRadius: 8, border: 'none',
  background: '#2C3A2E', color: '#F5F0E8', fontSize: 15, cursor: 'pointer',
};
