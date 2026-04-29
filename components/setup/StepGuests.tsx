'use client';

import type { GuestRow } from '@/app/setup/page';

interface Props {
  guests: GuestRow[];
  onChange: (guests: GuestRow[]) => void;
}

export function StepGuests({ guests, onChange }: Props) {
  const totalInvites = guests.length;
  const totalSeats = guests.reduce((sum, g) => sum + g.allocation, 0);

  function updateGuest(i: number, patch: Partial<GuestRow>) {
    const next = guests.map((g, idx) => (idx === i ? { ...g, ...patch } : g));
    onChange(next);
  }

  function addGuest() {
    onChange([...guests, { name: '', allocation: 1 }]);
  }

  function removeGuest(i: number) {
    onChange(guests.filter((_, idx) => idx !== i));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-montserrat)', fontSize: 22, fontWeight: 600, color: 'var(--text)', margin: '0 0 6px' }}>
          Add your guests
        </h2>
        <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
          Each guest gets their own link with a seat cap. They can only bring what you allocate.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16 }}>
        {[
          { label: 'Invites', value: totalInvites },
          { label: 'Total Seats', value: totalSeats },
        ].map(({ label, value }) => (
          <div key={label} style={{
            flex: 1,
            background: 'var(--sage-dim)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '16px 20px',
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'var(--font-montserrat)', fontSize: 28, fontWeight: 600, color: 'var(--sage)' }}>
              {value}
            </div>
            <div style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, letterSpacing: '0.3px' }}>
              {label.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      {/* Guest list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {guests.map((guest, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '10px 14px',
          }}>
            <input
              type="text"
              placeholder={`Guest ${i + 1} name`}
              value={guest.name}
              onChange={(e) => updateGuest(i, { name: e.target.value })}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                fontFamily: 'var(--font-montserrat)',
                fontSize: 14,
                color: 'var(--text)',
                outline: 'none',
              }}
            />
            {/* Allocation stepper */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => updateGuest(i, { allocation: Math.max(1, guest.allocation - 1) })}
                style={stepperBtn}
              >
                −
              </button>
              <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 14, fontWeight: 600, color: 'var(--text)', minWidth: 16, textAlign: 'center' }}>
                {guest.allocation}
              </span>
              <button
                onClick={() => updateGuest(i, { allocation: Math.min(10, guest.allocation + 1) })}
                style={stepperBtn}
              >
                +
              </button>
              <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 2 }}>
                seat{guest.allocation !== 1 ? 's' : ''}
              </span>
            </div>
            {/* Remove */}
            {guests.length > 1 && (
              <button
                onClick={() => removeGuest(i)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-tertiary)',
                  fontSize: 16,
                  padding: '0 4px',
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addGuest}
        style={{
          background: 'none',
          border: '1.5px dashed var(--border)',
          borderRadius: 10,
          padding: '12px',
          cursor: 'pointer',
          fontFamily: 'var(--font-montserrat)',
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--text-secondary)',
          letterSpacing: '0.3px',
          transition: 'border-color 0.15s',
        }}
      >
        + ADD GUEST
      </button>

      {/* Tip */}
      <div style={{
        background: 'var(--sage-dim)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '14px 16px',
      }}>
        <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
          💡 Each entry gets a unique link. If Uncle Ahmed gets 4 seats, his link enforces exactly that — no extras.
        </p>
      </div>
    </div>
  );
}

const stepperBtn: React.CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: 6,
  border: '1px solid var(--border)',
  background: 'var(--surface-alt)',
  color: 'var(--text)',
  fontFamily: 'var(--font-montserrat)',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
};
