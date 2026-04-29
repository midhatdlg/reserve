/**
 * Pure name-matching logic for the Joy-style RSVP flow.
 *
 * Given an input name (+ optional email) and the list of invites for a
 * wedding, decide whether to let the visitor proceed. The HTTP handler calls
 * this, sets a session cookie on `matched`, and renders a form for
 * `ambiguous` or a fallback for `unmatched`.
 */

export type InviteForLookup = {
  id: string;
  wedding_id: string;
  guest_name: string;
  email: string | null;
  max_guests: number;
  table_number: number | null;
  table_name: string | null;
};

export type LookupResult =
  | {
      kind: 'matched';
      invite: InviteForLookup;
    }
  | {
      kind: 'ambiguous';
      /** How many invites share the typed name (case-insensitive). */
      count: number;
    }
  | { kind: 'unmatched' };

/**
 * Normalise a name for comparison. We lower-case and collapse whitespace so
 * "  Ada  LoveLace " and "ada lovelace" match. We intentionally do not strip
 * accents because the couple may have authored names with diacritics; users
 * can always hit the "message the couple" fallback.
 */
export function normaliseName(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

function normaliseEmail(s: string | null | undefined): string {
  return (s ?? '').trim().toLowerCase();
}

export function resolveInviteMatch(
  invites: readonly InviteForLookup[],
  name: string,
  email?: string | null
): LookupResult {
  const needle = normaliseName(name);
  if (!needle) return { kind: 'unmatched' };

  const nameMatches = invites.filter(
    (i) => normaliseName(i.guest_name) === needle
  );

  if (nameMatches.length === 0) return { kind: 'unmatched' };
  if (nameMatches.length === 1) return { kind: 'matched', invite: nameMatches[0] };

  // Multiple invites share this name — try the email tiebreaker.
  const emailNeedle = normaliseEmail(email);
  if (emailNeedle) {
    const byEmail = nameMatches.filter(
      (i) => normaliseEmail(i.email) === emailNeedle
    );
    if (byEmail.length === 1) return { kind: 'matched', invite: byEmail[0] };
    // If the email matches none, treat as unmatched so the user gets a clear
    // error rather than a silent wrong-invite assignment.
    if (byEmail.length === 0) return { kind: 'unmatched' };
    // More than one with the same name *and* email is a data-integrity bug;
    // surface it as ambiguous so the couple can clean up via the dashboard.
    return { kind: 'ambiguous', count: byEmail.length };
  }

  return { kind: 'ambiguous', count: nameMatches.length };
}
