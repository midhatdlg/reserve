'use client';

import { useState } from 'react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { StepBlockSelector } from '@/components/setup/StepBlockSelector';
import { StepLanguages } from '@/components/setup/StepLanguages';
import { StepGuests } from '@/components/setup/StepGuests';
import { StepLaunch } from '@/components/setup/StepLaunch';

// ── Types ─────────────────────────────────────────────────────────────────────

export type GuestRow = { name: string; allocation: number };

export type WizardState = {
  name1: string;
  name2: string;
  weddingDate: string;
  selectedBlocks: string[];
  languages: string[];
  guests: GuestRow[];
};

// ── Wizard shell ──────────────────────────────────────────────────────────────

const TOTAL_STEPS = 5;

export default function SetupPage() {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<WizardState>({
    name1: '',
    name2: '',
    weddingDate: '',
    selectedBlocks: ['rsvp', 'itinerary', 'table', 'qna', 'countdown'],
    languages: ['en'],
    guests: [{ name: '', allocation: 2 }],
  });

  function update(partial: Partial<WizardState>) {
    setState((s) => ({ ...s, ...partial }));
  }

  function canContinue() {
    if (step === 1) return state.name1.trim() && state.name2.trim() && state.weddingDate;
    if (step === 4) return state.guests.length > 0 && state.guests.every((g) => g.name.trim());
    return true;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-warm)', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky top bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
      }}>
        {/* Logo + theme toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 16, position: 'relative' }}>
          <span style={{ fontFamily: 'var(--font-yeseva)', fontSize: 20, color: 'var(--sage)' }}>
            Reserve
          </span>
          <div style={{ position: 'absolute', right: 16 }}>
            <ThemeToggle />
          </div>
        </div>
        <ProgressBar currentStep={step} />
      </div>

      {/* Step content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px 120px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          {step === 1 && <StepDetails state={state} update={update} />}
          {step === 2 && <StepBlockSelector selected={state.selectedBlocks} onChange={(b) => update({ selectedBlocks: b })} />}
          {step === 3 && <StepLanguages selected={state.languages} onChange={(l) => update({ languages: l })} />}
          {step === 4 && <StepGuests guests={state.guests} onChange={(g) => update({ guests: g })} />}
          {step === 5 && <StepLaunch state={state} />}
        </div>
      </div>

      {/* Sticky bottom nav */}
      {step < 5 && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--bg)',
          borderTop: '1px solid var(--border)',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
        }}>
          <Button
            variant="secondary"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
          >
            Back
          </Button>
          <span style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: 11,
            color: 'var(--text-tertiary)',
            letterSpacing: '0.3px',
          }}>
            {step} of {TOTAL_STEPS}
          </span>
          <Button
            variant="primary"
            onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))}
            disabled={!canContinue()}
          >
            {step === 4 ? 'Launch →' : 'Continue →'}
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Step 1: Couple Details ────────────────────────────────────────────────────

function StepDetails({ state, update }: { state: WizardState; update: (p: Partial<WizardState>) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <h2 style={{
          fontFamily: 'var(--font-montserrat)',
          fontSize: 22,
          fontWeight: 600,
          color: 'var(--text)',
          margin: '0 0 6px',
        }}>
          Let&apos;s get started
        </h2>
        <p style={{
          fontFamily: 'var(--font-montserrat)',
          fontSize: 14,
          color: 'var(--text-secondary)',
          margin: 0,
        }}>
          Tell us about yourselves and your big day.
        </p>
      </div>

      {/* Names */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Input
            label="Your name"
            placeholder="Aisha"
            value={state.name1}
            onChange={(e) => update({ name1: e.target.value })}
          />
        </div>
        <span style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: 28,
          color: 'var(--text-tertiary)',
          paddingBottom: 8,
          flexShrink: 0,
          fontStyle: 'italic',
        }}>
          &
        </span>
        <div style={{ flex: 1 }}>
          <Input
            label="Partner's name"
            placeholder="Omar"
            value={state.name2}
            onChange={(e) => update({ name2: e.target.value })}
          />
        </div>
      </div>

      {/* Date */}
      <Input
        label="Wedding date"
        type="date"
        value={state.weddingDate}
        onChange={(e) => update({ weddingDate: e.target.value })}
      />
    </div>
  );
}
