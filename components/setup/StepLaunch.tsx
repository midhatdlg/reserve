'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import {
  DEFAULT_LANGUAGES,
  DEFAULT_SELECTED_BLOCKS,
  sanitizeSlug,
  type WizardState,
} from '@/app/setup/page';

interface Props {
  state: WizardState;
}

const STEPS = [
  { label: 'Creating your profile', pct: 20 },
  { label: 'Setting up your wedding page', pct: 45 },
  { label: 'Publishing your page', pct: 75 },
  { label: "You're live!", pct: 100 },
];

function withCollisionSuffix(slug: string): string {
  const base = sanitizeSlug(slug) || 'wedding';
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}

export function StepLaunch({ state }: Props) {
  const [progress, setProgress] = useState(0);
  const [stepLabel, setStepLabel] = useState(STEPS[0].label);
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const launched = useRef(false);

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

  function weddingPayload(slug?: string) {
    return {
      title: `${state.name1.trim()} & ${state.name2.trim()}`,
      wedding_date: state.weddingDate || null,
      venue_name: state.venueName.trim() || null,
      venue_address: state.venueAddress.trim() || null,
      timezone: state.timezone,
      selected_blocks: DEFAULT_SELECTED_BLOCKS,
      languages: DEFAULT_LANGUAGES,
      is_published: true,
      ...(slug ? { slug } : {}),
    };
  }

  async function launch() {
    setStatus('loading');
    setProgress(0);
    try {
      const supabase = createClient();

      await animateTo(20, STEPS[0].label, 200);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('auth');

      await supabase.from('couples').upsert({
        id: user.id,
        email: user.email!,
        name_1: state.name1.trim(),
        name_2: state.name2.trim(),
      });

      await animateTo(45, STEPS[1].label, 300);

      const desiredSlug = sanitizeSlug(state.slug) || withCollisionSuffix('wedding');

      const { data: existing } = await supabase
        .from('weddings')
        .select('id, slug')
        .eq('couple_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        const slugUpdate =
          desiredSlug && desiredSlug !== existing.slug ? desiredSlug : undefined;

        const updatePayload = weddingPayload(slugUpdate);
        let { error: uErr } = await supabase
          .from('weddings')
          .update(updatePayload)
          .eq('id', existing.id);

        // Unique slug collision — keep existing slug rather than failing
        if (uErr && slugUpdate) {
          ({ error: uErr } = await supabase
            .from('weddings')
            .update(weddingPayload())
            .eq('id', existing.id));
        }
        if (uErr) throw uErr;
      } else {
        let slug = desiredSlug;
        let { error: wErr } = await supabase
          .from('weddings')
          .insert({
            couple_id: user.id,
            ...weddingPayload(slug),
          });

        if (wErr) {
          // Likely unique violation on slug — retry once with suffix
          slug = withCollisionSuffix(desiredSlug);
          ({ error: wErr } = await supabase
            .from('weddings')
            .insert({
              couple_id: user.id,
              ...weddingPayload(slug),
            }));
        }
        if (wErr) throw wErr;
      }

      await animateTo(75, STEPS[2].label, 300);
      await animateTo(100, STEPS[3].label, 400);

      window.location.href = '/dashboard';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setErrorMsg(msg === 'auth' ? 'Session expired. Please sign in again.' : msg);
      setStatus('error');
    }
  }

  if (status === 'error') {
    return (
      <div style={{
        maxWidth: 420,
        margin: '48px auto 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        textAlign: 'center',
        background: 'rgba(254,252,249,0.92)',
        border: '1px solid rgba(44,58,46,0.12)',
        borderRadius: 14,
        padding: '40px 32px',
        boxShadow: '0 24px 64px rgba(44,58,46,0.08)',
      }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'rgba(196,86,74,0.1)',
          border: '1px solid #C4564A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          color: '#C4564A',
        }}>
          ✕
        </div>
        <div>
          <p style={{
            fontFamily: 'var(--font-yeseva)',
            fontSize: 22,
            color: '#2C2C2C',
            margin: '0 0 8px',
          }}>
            Something went wrong
          </p>
          <p style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: 13,
            color: '#6B6560',
            margin: 0,
          }}>
            {errorMsg}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" onClick={() => { window.location.href = '/login'; }}>
            Sign in
          </Button>
          <Button onClick={() => { setStatus('loading'); setProgress(0); launch(); }}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 480,
      margin: '48px auto 0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 28,
      textAlign: 'center',
    }}>
      <div>
        <h2 style={{
          fontFamily: 'var(--font-yeseva)',
          fontSize: 32,
          color: '#1F2A22',
          margin: '0 0 8px',
          fontWeight: 500,
        }}>
          {state.name1} &amp; {state.name2}
        </h2>
        <p style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: 18,
          color: 'rgba(31,42,34,0.7)',
          margin: 0,
        }}>
          Building your wedding page
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{
          height: 4,
          background: 'rgba(31,42,34,0.12)',
          borderRadius: 99,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: '#2C3A2E',
            borderRadius: 99,
            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }} />
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 12,
        }}>
          <span style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: 11,
            color: 'rgba(31,42,34,0.6)',
          }}>
            {stepLabel}…
          </span>
          <span style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: 11,
            color: '#2C3A2E',
            fontWeight: 600,
          }}>
            {progress}%
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: progress >= s.pct ? '#2C3A2E' : 'rgba(31,42,34,0.15)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
    </div>
  );
}
