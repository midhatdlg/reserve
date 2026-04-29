import { describe, it, expect } from 'vitest';
import {
  civilToUtc,
  isValidTimeZone,
  parseCivilInTz,
  timeUntil,
} from './timezone';

describe('isValidTimeZone', () => {
  it('accepts common IANA zones', () => {
    expect(isValidTimeZone('UTC')).toBe(true);
    expect(isValidTimeZone('Europe/London')).toBe(true);
    expect(isValidTimeZone('America/Los_Angeles')).toBe(true);
    expect(isValidTimeZone('Asia/Kolkata')).toBe(true);
  });

  it('rejects obviously bad strings', () => {
    expect(isValidTimeZone('')).toBe(false);
    expect(isValidTimeZone('Not/A/Zone')).toBe(false);
    expect(isValidTimeZone('Europe/London; DROP TABLE')).toBe(false);
  });

  it('rejects non-strings without throwing', () => {
    expect(isValidTimeZone(null as unknown as string)).toBe(false);
    expect(isValidTimeZone(123 as unknown as string)).toBe(false);
  });
});

describe('civilToUtc', () => {
  it('returns the same instant for UTC civil times', () => {
    const d = civilToUtc(2026, 5, 1, 14, 0, 'UTC');
    expect(d.toISOString()).toBe('2026-05-01T14:00:00.000Z');
  });

  it('shifts London summer time (BST) back one hour', () => {
    // 2026-05-01 14:00 London is BST (UTC+1), so the UTC instant is 13:00.
    const d = civilToUtc(2026, 5, 1, 14, 0, 'Europe/London');
    expect(d.toISOString()).toBe('2026-05-01T13:00:00.000Z');
  });

  it('shifts London winter time (GMT) by zero', () => {
    // 2026-01-15 14:00 London == 14:00 UTC.
    const d = civilToUtc(2026, 1, 15, 14, 0, 'Europe/London');
    expect(d.toISOString()).toBe('2026-01-15T14:00:00.000Z');
  });

  it('shifts New York EDT (summer) by +4h', () => {
    // 2026-07-04 18:00 America/New_York (EDT) == 22:00 UTC.
    const d = civilToUtc(2026, 7, 4, 18, 0, 'America/New_York');
    expect(d.toISOString()).toBe('2026-07-04T22:00:00.000Z');
  });

  it('shifts New York EST (winter) by +5h', () => {
    const d = civilToUtc(2026, 1, 10, 18, 0, 'America/New_York');
    expect(d.toISOString()).toBe('2026-01-10T23:00:00.000Z');
  });

  it('handles DST spring-forward without drifting by an hour', () => {
    // 2026-03-29 London springs forward 01:00 → 02:00. 03:00 is unambiguous.
    const d = civilToUtc(2026, 3, 29, 3, 0, 'Europe/London');
    expect(d.toISOString()).toBe('2026-03-29T02:00:00.000Z');
  });
});

describe('parseCivilInTz', () => {
  it('defaults to midnight when no time is provided', () => {
    const d = parseCivilInTz('2026-05-01', null, 'Europe/London');
    // 2026-05-01 00:00 BST == 2026-04-30 23:00 UTC
    expect(d.toISOString()).toBe('2026-04-30T23:00:00.000Z');
  });

  it('parses HH:MM and HH:MM:SS', () => {
    const a = parseCivilInTz('2026-05-01', '14:00', 'UTC');
    const b = parseCivilInTz('2026-05-01', '14:00:30', 'UTC');
    expect(a.toISOString()).toBe('2026-05-01T14:00:00.000Z');
    expect(b.toISOString()).toBe('2026-05-01T14:00:00.000Z');
  });

  it('falls back to UTC when timezone is invalid', () => {
    const d = parseCivilInTz('2026-05-01', '14:00', 'Not/A/Zone');
    expect(d.toISOString()).toBe('2026-05-01T14:00:00.000Z');
  });

  it('throws on malformed date strings', () => {
    expect(() => parseCivilInTz('nope', '12:00', 'UTC')).toThrow();
    expect(() => parseCivilInTz('2026-05-01', 'bad', 'UTC')).toThrow();
  });
});

describe('timeUntil', () => {
  it('breaks down days/hours/minutes/seconds', () => {
    const now = new Date('2026-05-01T00:00:00.000Z');
    const target = new Date('2026-05-03T04:30:45.000Z');
    expect(timeUntil(target, now)).toEqual({
      totalMs: target.getTime() - now.getTime(),
      days: 2, hours: 4, minutes: 30, seconds: 45,
    });
  });

  it('clamps to zero when the target is in the past', () => {
    const target = new Date('2020-01-01T00:00:00.000Z');
    const res = timeUntil(target, new Date('2026-05-01T00:00:00.000Z'));
    expect(res).toEqual({ totalMs: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
  });
});
