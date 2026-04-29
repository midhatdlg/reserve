'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import type { WizardState } from '@/app/setup/page';

interface Props {
  state: WizardState;
}

function slugify(name1: string, name2: string): string {
  const clean = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  return `${clean(name1)}-and-${clean(name2)}-${Math.random().toString(36).slice(2, 7)}`;
}

const STEPS = [
  { label: 'Creating your profile',      pct: 20 },
  { label: 'Setting up your wedding page', pct: 45 },
  { label: 'Generating invite links',     pct: 70 },
  { label: 'Publishing your page',        pct: 90 },
  { label: 'You\'re live!',              pct: 100 },
];

export function StepLaunch({ state }: Props) {
  const [progress, setProgress] = useState(0);
  const [stepLabel, setStepLabel] = useState(STEPS[0].label);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [weddingSlug, setWeddingSlug] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const launched = useRef(false);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  useEffect(() => {
    if (!launched.current) {
      launched.current = true;
      launch();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function animateTo(pct: number, label: string, delay = 0) {
    await new Promise<void>((res) => setTimeout(res, delay));
    setStepLabel(label);
    setProgress(pct);
  }

  async function launch() {
    setStatus('loading');
    setProgress(0);
    try {
      const supabase = createClient();

      await animateTo(20, STEPS[0].label, 200);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('auth');

      // Upsert couple
      await supabase.from('couples').upsert({
        id: user.id,
        email: user.email!,
        name_1: state.name1,
        name_2: state.name2,
      });

      await animateTo(45, STEPS[1].label, 300);

      // Check for existing wedding to avoid duplicates on re-run
      const { data: existing } = await supabase
        .from('weddings')
        .select('id, slug')
        .eq('couple_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let wedding: { id: string; slug: string };

      if (existing) {
        // Update the existing wedding instead of creating a new one
        const { data: updated, error: uErr } = await supabase
          .from('weddings')
          .update({
            title: `${state.name1} & ${state.name2}`,
            wedding_date: state.weddingDate || null,
            selected_blocks: state.selectedBlocks,
            languages: state.languages,
            is_published: true,
          })
          .eq('id', existing.id)
          .select('id, slug')
          .single();
        if (uErr) throw uErr;
        wedding = updated;
      } else {
        const slug = slugify(state.name1, state.name2);
        const { data: inserted, error: wErr } = await supabase
          .from('weddings')
          .insert({
            couple_id: user.id,
            slug,
            title: `${state.name1} & ${state.name2}`,
            wedding_date: state.weddingDate || null,
            selected_blocks: state.selectedBlocks,
            languages: state.languages,
            is_published: true,
          })
          .select('id, slug')
          .single();
        if (wErr) throw wErr;
        wedding = inserted;
      }

      await animateTo(70, STEPS[2].label, 300);

      const inviteRows = state.guests
        .filter((g) => g.name.trim())
        .map((g) => ({
          wedding_id: wedding.id,
          guest_name: g.name.trim(),
          max_guests: g.allocation,
        }));

      if (inviteRows.length > 0) {
        const { error: iErr } = await supabase.from('invites').insert(inviteRows);
        if (iErr) throw iErr;
      }

      await animateTo(90, STEPS[3].label, 300);
      await animateTo(100, STEPS[4].label, 500);

      setWeddingSlug(wedding.slug);
      await new Promise<void>((res) => setTimeout(res, 600));
      setStatus('success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setErrorMsg(msg === 'auth' ? 'Session expired. Please sign in again.' : msg);
      setStatus('error');
    }
  }

  const inviteLink = `${appUrl}/invite/${weddingSlug}`;
  const totalSeats = state.guests.reduce((s, g) => s + g.allocation, 0);

  function copy() {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', gap: 28 }}>
        {/* Names */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            fontFamily: 'var(--font-yeseva)',
            fontSize: 24,
            color: 'var(--sage)',
            margin: '0 0 4px',
          }}>
            {state.name1} &amp; {state.name2}
          </h2>
          <p style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: 12,
            color: 'var(--text-tertiary)',
            margin: 0,
            letterSpacing: '0.3px',
          }}>
            Building your wedding page
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{
            height: 6,
            background: 'var(--border)',
            borderRadius: 99,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'var(--sage)',
              borderRadius: 99,
              transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }} />
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 10,
          }}>
            <span style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: 11,
              color: 'var(--text-secondary)',
            }}>
              {stepLabel}…
            </span>
            <span style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: 11,
              color: 'var(--sage)',
              fontWeight: 600,
            }}>
              {progress}%
            </span>
          </div>
        </div>

        {/* Step dots */}
        <div style={{ display: 'flex', gap: 8 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: progress >= s.pct ? 'var(--sage)' : 'var(--border)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '48px 0' }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'rgba(196,86,74,0.1)',
          border: '1px solid var(--error)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
        }}>
          ✕
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text)',
            margin: '0 0 6px',
          }}>
            Something went wrong
          </p>
          <p style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: 13,
            color: 'var(--text-secondary)',
            margin: 0,
          }}>
            {errorMsg}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" onClick={() => window.location.href = '/login'}>
            Sign in
          </Button>
          <Button onClick={() => { setStatus('loading'); setProgress(0); launch(); }}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🎉</div>
        <h2 style={{
          fontFamily: 'var(--font-yeseva)',
          fontSize: 26,
          color: 'var(--sage)',
          margin: '0 0 6px',
        }}>
          {state.name1} &amp; {state.name2}
        </h2>
        <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
          Your wedding page is live!
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10 }}>
        {[
          { label: 'Invites',   value: state.guests.length },
          { label: 'Seats',     value: totalSeats },
          { label: 'Sections',  value: state.selectedBlocks.length },
        ].map(({ label, value }) => (
          <div key={label} style={{
            flex: 1,
            background: 'var(--sage-dim)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '14px 12px',
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'var(--font-montserrat)', fontSize: 22, fontWeight: 600, color: 'var(--sage)' }}>
              {value}
            </div>
            <div style={{ fontFamily: 'var(--font-montserrat)', fontSize: 10, color: 'var(--text-secondary)', marginTop: 2, letterSpacing: '0.3px' }}>
              {label.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      {/* Completed progress bar */}
      <div>
        <div style={{ height: 6, background: 'var(--sage)', borderRadius: 99 }} />
        <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'var(--sage)', fontWeight: 600, margin: '8px 0 0', letterSpacing: '0.3px' }}>
          ✓ All done — 100%
        </p>
      </div>

      {/* Invite link */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
        <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', color: 'var(--text-secondary)', margin: '0 0 8px' }}>
          YOUR INVITE LINK
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: 'var(--text)', flex: 1, wordBreak: 'break-all' }}>
            {inviteLink}
          </span>
          <Button variant="secondary" size="sm" onClick={copy}>
            {copied ? '✓ Copied' : 'Copy'}
          </Button>
        </div>
      </div>

      {/* Share */}
      <div style={{ display: 'flex', gap: 10 }}>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`You're invited! ${inviteLink}`)}`}
          target="_blank" rel="noopener noreferrer"
          style={shareBtn('#25D366')}
        >
          WhatsApp
        </a>
        <a
          href={`mailto:?subject=${encodeURIComponent(`You're invited to ${state.name1} & ${state.name2}'s wedding`)}&body=${encodeURIComponent(`Join us! ${inviteLink}`)}`}
          style={shareBtn('var(--sage)')}
        >
          Email
        </a>
      </div>

      {/* What's next */}
      <div style={{ background: 'var(--surface-alt)', borderRadius: 10, padding: '16px 18px' }}>
        <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 12, fontWeight: 600, color: 'var(--text)', margin: '0 0 10px' }}>
          What&apos;s next
        </p>
        {[
          'Add your itinerary in the dashboard',
          'Assign table numbers once RSVPs come in',
          'Upload engagement photos to the gallery',
          'Enable the envelope animation in Settings',
        ].map((item) => (
          <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 7 }}>
            <span style={{ color: 'var(--sage)', flexShrink: 0 }}>✓</span>
            <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 12, color: 'var(--text-secondary)' }}>{item}</span>
          </div>
        ))}
      </div>

      <a
        href="/dashboard"
        style={{
          display: 'block',
          textAlign: 'center',
          background: 'var(--sage)',
          color: 'var(--accent-text)',
          borderRadius: 8,
          padding: '13px',
          fontFamily: 'var(--font-montserrat)',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.5px',
          textDecoration: 'none',
        }}
      >
        GO TO DASHBOARD →
      </a>
    </div>
  );
}

function shareBtn(bg: string): React.CSSProperties {
  return {
    flex: 1,
    display: 'block',
    textAlign: 'center',
    padding: '10px',
    borderRadius: 8,
    background: bg,
    color: '#fff',
    fontFamily: 'var(--font-montserrat)',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.3px',
    textDecoration: 'none',
  };
}
