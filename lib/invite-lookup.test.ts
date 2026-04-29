import { describe, it, expect } from 'vitest';
import {
  normaliseName,
  resolveInviteMatch,
  type InviteForLookup,
} from './invite-lookup';

function invite(overrides: Partial<InviteForLookup>): InviteForLookup {
  return {
    id: overrides.id ?? 'inv',
    wedding_id: 'wed-1',
    guest_name: overrides.guest_name ?? 'Ada Lovelace',
    email: overrides.email ?? null,
    max_guests: overrides.max_guests ?? 1,
    table_number: overrides.table_number ?? null,
    table_name: overrides.table_name ?? null,
  };
}

describe('normaliseName', () => {
  it('lowercases, trims, and collapses whitespace', () => {
    expect(normaliseName('  Ada   Lovelace ')).toBe('ada lovelace');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(normaliseName('   ')).toBe('');
  });
});

describe('resolveInviteMatch', () => {
  it('returns unmatched when input is empty', () => {
    expect(resolveInviteMatch([invite({ id: 'a' })], '')).toEqual({ kind: 'unmatched' });
    expect(resolveInviteMatch([invite({ id: 'a' })], '   ')).toEqual({ kind: 'unmatched' });
  });

  it('returns unmatched when no invite has that name', () => {
    const result = resolveInviteMatch([invite({ id: 'a', guest_name: 'Ada' })], 'Ben');
    expect(result.kind).toBe('unmatched');
  });

  it('matches case- and whitespace-insensitively', () => {
    const a = invite({ id: 'a', guest_name: 'Ada Lovelace' });
    const r = resolveInviteMatch([a], '  ada   LOVELACE ');
    expect(r).toEqual({ kind: 'matched', invite: a });
  });

  it('returns ambiguous when two invites share the name and no email is given', () => {
    const a = invite({ id: 'a', guest_name: 'Chris Smith', email: 'chris@a.com' });
    const b = invite({ id: 'b', guest_name: 'Chris Smith', email: 'chris@b.com' });
    const r = resolveInviteMatch([a, b], 'chris smith');
    expect(r).toEqual({ kind: 'ambiguous', count: 2 });
  });

  it('disambiguates by email when duplicates exist', () => {
    const a = invite({ id: 'a', guest_name: 'Chris Smith', email: 'chris@a.com' });
    const b = invite({ id: 'b', guest_name: 'Chris Smith', email: 'chris@b.com' });
    const r = resolveInviteMatch([a, b], 'chris smith', 'chris@b.com');
    expect(r).toEqual({ kind: 'matched', invite: b });
  });

  it('treats an unmatched email as unmatched (never silently picks one)', () => {
    const a = invite({ id: 'a', guest_name: 'Chris Smith', email: 'chris@a.com' });
    const b = invite({ id: 'b', guest_name: 'Chris Smith', email: 'chris@b.com' });
    const r = resolveInviteMatch([a, b], 'chris smith', 'nope@example.com');
    expect(r.kind).toBe('unmatched');
  });

  it('ignores the email when there is only one name match', () => {
    const a = invite({ id: 'a', guest_name: 'Ada', email: 'ada@a.com' });
    const r = resolveInviteMatch([a], 'ada', 'different@example.com');
    expect(r).toEqual({ kind: 'matched', invite: a });
  });

  it('surfaces ambiguous if two rows share name AND email (data bug)', () => {
    const a = invite({ id: 'a', guest_name: 'Chris Smith', email: 'chris@a.com' });
    const b = invite({ id: 'b', guest_name: 'Chris Smith', email: 'chris@a.com' });
    const r = resolveInviteMatch([a, b], 'chris smith', 'chris@a.com');
    expect(r).toEqual({ kind: 'ambiguous', count: 2 });
  });

  it('is case-insensitive on email', () => {
    const a = invite({ id: 'a', guest_name: 'Chris', email: 'CHRIS@A.COM' });
    const b = invite({ id: 'b', guest_name: 'Chris', email: 'chris@b.com' });
    const r = resolveInviteMatch([a, b], 'chris', 'chris@a.com');
    expect(r).toEqual({ kind: 'matched', invite: a });
  });
});
