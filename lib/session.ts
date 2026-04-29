/**
 * RSVP session cookie: a short-lived, HMAC-signed payload identifying which
 * invite a visitor has already matched via the name-lookup endpoint. Stubbed
 * here; the signing/verification implementation lands with the lookup todo.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

export interface RsvpSessionPayload {
  inviteId: string;
  weddingId: string;
  /** Expiry, seconds since epoch. */
  exp: number;
}

export interface CookieLike {
  get(name: string): { value: string } | undefined;
}

export const RSVP_SESSION_COOKIE = 'rsvp_session';
export const RSVP_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function b64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64url(s: string): Buffer {
  const pad = s.length % 4 === 2 ? '==' : s.length % 4 === 3 ? '=' : '';
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
}

function getSecret(): string {
  const s = process.env.RSVP_SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      'RSVP_SESSION_SECRET must be set and at least 32 characters long'
    );
  }
  return s;
}

/**
 * Sign a payload into a compact `base64url(json).base64url(hmac)` token.
 */
export function signRsvpSession(payload: RsvpSessionPayload): string {
  const body = b64url(Buffer.from(JSON.stringify(payload), 'utf8'));
  const mac = createHmac('sha256', getSecret()).update(body).digest();
  return `${body}.${b64url(mac)}`;
}

/**
 * Verify a signed token. Returns the payload on success or `null` on any
 * failure (tampered signature, malformed token, expired, etc.).
 */
export function verifyRsvpSession(token: string | null | undefined): RsvpSessionPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;

  let expected: Buffer;
  let actual: Buffer;
  try {
    expected = createHmac('sha256', getSecret()).update(body).digest();
    actual = fromB64url(sig);
  } catch {
    return null;
  }

  if (expected.length !== actual.length) return null;
  if (!timingSafeEqual(expected, actual)) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(fromB64url(body).toString('utf8'));
  } catch {
    return null;
  }

  if (!isPayload(parsed)) return null;
  if (parsed.exp < Math.floor(Date.now() / 1000)) return null;
  return parsed;
}

function isPayload(x: unknown): x is RsvpSessionPayload {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.inviteId === 'string' &&
    typeof o.weddingId === 'string' &&
    typeof o.exp === 'number'
  );
}

/**
 * Read the RSVP session cookie from a `next/headers` cookie store (or any
 * object with a compatible `.get` method) and verify it.
 */
export async function readRsvpSession(
  cookieStore: CookieLike | Promise<CookieLike>
): Promise<{ inviteId: string; weddingId: string } | null> {
  const store = await cookieStore;
  const raw = store.get(RSVP_SESSION_COOKIE)?.value;
  const payload = verifyRsvpSession(raw);
  return payload ? { inviteId: payload.inviteId, weddingId: payload.weddingId } : null;
}
