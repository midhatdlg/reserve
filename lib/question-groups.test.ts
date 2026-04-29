import { describe, it, expect } from 'vitest';
import { groupQuestions, isMessageToCouple, type ModerationQuestion } from './question-groups';

function q(partial: Partial<ModerationQuestion>): ModerationQuestion {
  return {
    id: partial.id ?? Math.random().toString(36).slice(2),
    question_text: 'Q?',
    answer_text: null,
    is_pinned: false,
    is_public: false,
    author_name: null,
    author_email: null,
    invite_id: 'inv',
    created_at: '2026-04-01T00:00:00.000Z',
    ...partial,
  };
}

describe('groupQuestions', () => {
  it('sorts into pinned / pending / unanswered / answered / archived', () => {
    const pinned     = q({ id: 'p', is_pinned: true, is_public: true, answer_text: 'Yes' });
    const pending    = q({ id: 'new', is_public: false, answer_text: null });
    const unanswered = q({ id: 'un', is_public: true,  answer_text: null });
    const answered   = q({ id: 'an', is_public: true,  answer_text: 'Yes' });
    const archived   = q({ id: 'ar', is_public: false, answer_text: 'Yes, but private' });

    const g = groupQuestions([pinned, pending, unanswered, answered, archived]);
    expect(g.pinned.map((x) => x.id)).toEqual(['p']);
    expect(g.pending.map((x) => x.id)).toEqual(['new']);
    expect(g.unanswered.map((x) => x.id)).toEqual(['un']);
    expect(g.answered.map((x) => x.id)).toEqual(['an']);
    expect(g.archived.map((x) => x.id)).toEqual(['ar']);
  });

  it('treats whitespace-only answers as no answer', () => {
    const g = groupQuestions([q({ id: 'w', is_public: true, answer_text: '   ' })]);
    expect(g.unanswered).toHaveLength(1);
    expect(g.answered).toHaveLength(0);
  });

  it('pinned always wins regardless of other flags', () => {
    const g = groupQuestions([q({ id: 'pz', is_pinned: true, is_public: false })]);
    expect(g.pinned).toHaveLength(1);
    expect(g.pending).toHaveLength(0);
  });
});

describe('isMessageToCouple', () => {
  it('flags anonymous messages (no invite_id, but has author_name)', () => {
    expect(isMessageToCouple(q({ invite_id: null, author_name: 'Stranger' }))).toBe(true);
  });

  it('does not flag ordinary invited-guest questions', () => {
    expect(isMessageToCouple(q({ invite_id: 'inv-1', author_name: 'Ada' }))).toBe(false);
  });

  it('does not flag rows that lack an author_name', () => {
    expect(isMessageToCouple(q({ invite_id: null, author_name: null }))).toBe(false);
  });
});
