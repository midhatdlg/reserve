import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  signRsvpSession,
  verifyRsvpSession,
  readRsvpSession,
  RSVP_SESSION_COOKIE,
} from './session';

const SECRET = 'test-session-secret-at-least-32-chars-long';

describe('RSVP session signing', () => {
  beforeEach(() => {
    process.env.RSVP_SESSION_SECRET = SECRET;
  });

  it('round-trips a valid payload', () => {
    const now = Math.floor(Date.now() / 1000);
    const token = signRsvpSession({ inviteId: 'inv-1', weddingId: 'wed-1', exp: now + 60 });
    expect(verifyRsvpSession(token)).toEqual({
      inviteId: 'inv-1',
      weddingId: 'wed-1',
      exp: now + 60,
    });
  });

  it('rejects tampered bodies', () => {
    const token = signRsvpSession({ inviteId: 'inv-1', weddingId: 'wed-1', exp: Math.floor(Date.now() / 1000) + 60 });
    const [, sig] = token.split('.');
    const tampered = `eyJoYWNrIjoxfQ.${sig}`;
    expect(verifyRsvpSession(tampered)).toBeNull();
  });

  it('rejects tampered signatures', () => {
    const token = signRsvpSession({ inviteId: 'inv-1', weddingId: 'wed-1', exp: Math.floor(Date.now() / 1000) + 60 });
    const [body] = token.split('.');
    const tampered = `${body}.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`;
    expect(verifyRsvpSession(tampered)).toBeNull();
  });

  it('rejects malformed tokens', () => {
    expect(verifyRsvpSession('')).toBeNull();
    expect(verifyRsvpSession(undefined)).toBeNull();
    expect(verifyRsvpSession(null)).toBeNull();
    expect(verifyRsvpSession('not-a-token')).toBeNull();
    expect(verifyRsvpSession('one.two.three')).toBeNull();
  });

  it('rejects expired tokens', () => {
    const token = signRsvpSession({ inviteId: 'inv-1', weddingId: 'wed-1', exp: Math.floor(Date.now() / 1000) - 5 });
    expect(verifyRsvpSession(token)).toBeNull();
  });

  it('rejects payloads missing required fields', () => {
    const sig = signRsvpSession({ inviteId: 'inv-1', weddingId: 'wed-1', exp: Math.floor(Date.now() / 1000) + 60 });
    // Re-sign a malformed payload with the real secret
    const { createHmac } = require('node:crypto') as typeof import('node:crypto');
    const badBody = Buffer.from(JSON.stringify({ hello: 'world' }))
      .toString('base64')
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const mac = createHmac('sha256', SECRET).update(badBody).digest();
    const forged = `${badBody}.${mac.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`;
    expect(verifyRsvpSession(forged)).toBeNull();
    expect(verifyRsvpSession(sig)).not.toBeNull();
  });

  it('throws when the secret is missing or too short', () => {
    process.env.RSVP_SESSION_SECRET = 'short';
    expect(() => signRsvpSession({ inviteId: 'x', weddingId: 'y', exp: 1 })).toThrow();
    delete process.env.RSVP_SESSION_SECRET;
    expect(() => signRsvpSession({ inviteId: 'x', weddingId: 'y', exp: 1 })).toThrow();
  });

  it('returns null (not throw) when verify is called without a configured secret', () => {
    // Craft a structurally valid token against an unrelated secret and then
    // strip the env var. `verifyRsvpSession` must swallow the resulting
    // `getSecret()` throw and return null — we never want a 500 just because
    // env is misconfigured on the read path.
    const token = signRsvpSession({ inviteId: 'i', weddingId: 'w', exp: Math.floor(Date.now()/1000)+60 });
    delete process.env.RSVP_SESSION_SECRET;
    expect(() => verifyRsvpSession(token)).not.toThrow();
    expect(verifyRsvpSession(token)).toBeNull();
  });

  it('returns null when the signature length differs from the HMAC length', () => {
    const token = signRsvpSession({ inviteId: 'i', weddingId: 'w', exp: Math.floor(Date.now()/1000)+60 });
    const [body] = token.split('.');
    // 3 bytes is a valid base64url string, but clearly not a 32-byte HMAC.
    const shortSig = Buffer.from([1, 2, 3]).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    expect(verifyRsvpSession(`${body}.${shortSig}`)).toBeNull();
  });

  it('returns null when the decoded body is valid JSON but not an object', () => {
    const { createHmac } = require('node:crypto') as typeof import('node:crypto');
    const body = Buffer.from(JSON.stringify(42), 'utf8')
      .toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const mac = createHmac('sha256', SECRET).update(body).digest()
      .toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    expect(verifyRsvpSession(`${body}.${mac}`)).toBeNull();
  });

  it('returns null when the decoded body is not valid JSON', () => {
    // Build a body whose bytes are valid base64url but not valid JSON, then
    // sign it with the real secret so the HMAC check passes and we reach
    // the JSON.parse catch branch.
    const { createHmac } = require('node:crypto') as typeof import('node:crypto');
    const body = Buffer.from('\u0001\u0002not-json\u00ff', 'utf8')
      .toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const mac = createHmac('sha256', SECRET).update(body).digest()
      .toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    expect(verifyRsvpSession(`${body}.${mac}`)).toBeNull();
  });

  afterEach(() => {
    process.env.RSVP_SESSION_SECRET = SECRET;
  });
});

describe('readRsvpSession', () => {
  beforeEach(() => {
    process.env.RSVP_SESSION_SECRET = SECRET;
  });

  it('returns null when no cookie is present', async () => {
    const store = { get: () => undefined };
    expect(await readRsvpSession(store)).toBeNull();
  });

  it('returns the parsed session when the cookie is valid', async () => {
    const token = signRsvpSession({ inviteId: 'inv-42', weddingId: 'wed-1', exp: Math.floor(Date.now() / 1000) + 60 });
    const store = { get: (n: string) => (n === RSVP_SESSION_COOKIE ? { value: token } : undefined) };
    expect(await readRsvpSession(store)).toEqual({ inviteId: 'inv-42', weddingId: 'wed-1' });
  });

  it('returns null when the cookie is invalid', async () => {
    const store = { get: () => ({ value: 'not-a-token' }) };
    expect(await readRsvpSession(store)).toBeNull();
  });

  it('awaits a promise-like cookie store', async () => {
    const token = signRsvpSession({ inviteId: 'inv-1', weddingId: 'wed-1', exp: Math.floor(Date.now() / 1000) + 60 });
    const storeP = Promise.resolve({ get: () => ({ value: token }) });
    expect(await readRsvpSession(storeP)).toEqual({ inviteId: 'inv-1', weddingId: 'wed-1' });
  });
});
