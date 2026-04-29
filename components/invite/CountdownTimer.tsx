'use client';

import { useEffect, useMemo, useState } from 'react';
import { parseCivilInTz, timeUntil } from '@/lib/timezone';

interface Props {
  /** ISO date `YYYY-MM-DD`. */
  targetDate: string;
  /** Optional wall-clock start time as `HH:MM[:SS]`. Defaults to 14:00. */
  startTime?: string | null;
  /** IANA timezone, e.g. `Europe/London`. Falls back to UTC. */
  timezone?: string;
}

export function CountdownTimer({ targetDate, startTime = null, timezone = 'UTC' }: Props) {
  const target = useMemo(
    () => parseCivilInTz(targetDate, startTime ?? '14:00', timezone),
    [targetDate, startTime, timezone]
  );

  // Initialise with zeros to avoid SSR/client hydration mismatch (Date.now()
  // differs between server render and client hydrate).
  const [time, setTime] = useState({ totalMs: 1, days: 0, hours: 0, minutes: 0, seconds: 0 });
  const isPast = time.totalMs === 0;

  useEffect(() => {
    setTime(timeUntil(target));
    if (target.getTime() <= Date.now()) return;
    const id = setInterval(() => setTime(timeUntil(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (isPast) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <p style={{ fontFamily: 'var(--font-caslon, Libre Caslon Text), Georgia, serif', fontSize: 18, color: '#2C2C2C', fontStyle: 'italic' }}>
          The celebration has begun
        </p>
      </div>
    );
  }

  const units = [
    { label: 'Days',  value: time.days },
    { label: 'Hours', value: time.hours },
    { label: 'Min',   value: time.minutes },
    { label: 'Sec',   value: time.seconds },
  ];

  return (
    <div style={{ textAlign: 'center' }} aria-label="Countdown to the wedding">
      <div style={{
        display: 'inline-flex',
        border: '1px solid #D4CFC6',
        borderRadius: 0,
        overflow: 'hidden',
      }}>
        {units.map(({ label, value }, i) => (
          <div key={label} style={{
            textAlign: 'center',
            padding: '14px 16px 12px',
            minWidth: 64,
            borderLeft: i > 0 ? '1px solid #D4CFC6' : 'none',
          }}>
            <div style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: 32, fontWeight: 400, color: '#2C2C2C', lineHeight: 1,
            }}>
              {String(value).padStart(2, '0')}
            </div>
            <div style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: 10, letterSpacing: '2px',
              color: '#9E9890', textTransform: 'uppercase', marginTop: 6,
            }}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
