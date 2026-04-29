/**
 * Pure grouping helpers for the couple-facing Q&A / moderation dashboard.
 * Extracted so the UI stays thin and the rules are unit-testable.
 */

export interface ModerationQuestion {
  id: string;
  question_text: string;
  answer_text: string | null;
  is_pinned: boolean;
  is_public: boolean;
  author_name: string | null;
  author_email: string | null;
  invite_id: string | null;
  created_at: string;
}

export interface GroupedQuestions<T extends ModerationQuestion> {
  /** Items marked as pinned FAQs — always shown at the top. */
  pinned: T[];
  /**
   * Items that are waiting for a moderation decision. These are entries
   * that came in from a guest (via /api/question or /api/invite/.../message)
   * and have not yet been approved (`is_public = false`) or answered.
   */
  pending: T[];
  /** Items that are public but still need an answer. */
  unanswered: T[];
  /** Items that have an answer and are public. */
  answered: T[];
  /** Dismissed-but-kept: public=false and has an answer (rare). */
  archived: T[];
}

export function groupQuestions<T extends ModerationQuestion>(qs: T[]): GroupedQuestions<T> {
  const pinned: T[] = [];
  const pending: T[] = [];
  const unanswered: T[] = [];
  const answered: T[] = [];
  const archived: T[] = [];

  for (const q of qs) {
    if (q.is_pinned) { pinned.push(q); continue; }

    const hasAnswer = Boolean(q.answer_text?.trim());
    if (!q.is_public && !hasAnswer) { pending.push(q); continue; }
    if (q.is_public && !hasAnswer) { unanswered.push(q); continue; }
    if (q.is_public && hasAnswer)  { answered.push(q);  continue; }
    archived.push(q);
  }

  return { pinned, pending, unanswered, answered, archived };
}

export function isMessageToCouple(q: ModerationQuestion): boolean {
  return q.invite_id === null && Boolean(q.author_name);
}
