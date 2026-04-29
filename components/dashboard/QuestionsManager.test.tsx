import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuestionsManager } from './QuestionsManager';
import type { ModerationQuestion } from '@/lib/question-groups';

type UpdateCall = { table: string; patch: Partial<ModerationQuestion>; id: string };
const updateCalls: UpdateCall[] = [];
let lastInsertResponse: { data: ModerationQuestion | null; error: Error | null } = { data: null, error: null };

vi.mock('@/lib/supabase/client', () => {
  return {
    createClient: () => ({
      from: (table: string) => ({
        insert: (_payload: unknown) => ({
          select: () => ({
            single: async () => lastInsertResponse,
          }),
        }),
        update: (patch: Partial<ModerationQuestion>) => ({
          eq: async (_col: string, id: string) => {
            updateCalls.push({ table, patch, id });
            return { error: null };
          },
        }),
        delete: () => ({
          eq: async (_col: string, _id: string) => ({ error: null }),
        }),
      }),
    }),
  };
});

function q(partial: Partial<ModerationQuestion>): ModerationQuestion {
  return {
    id: partial.id ?? Math.random().toString(36).slice(2),
    question_text: partial.question_text ?? 'Question?',
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

describe('<QuestionsManager />', () => {
  beforeEach(() => {
    updateCalls.length = 0;
    lastInsertResponse = { data: null, error: null };
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('shows a dedicated "Pending review" section for is_public=false items with no answer', () => {
    const initial = [
      q({ id: '1', question_text: 'Dress code?', is_public: false }),
      q({ id: '2', question_text: 'Kids welcome?', is_public: true, answer_text: 'Yes' }),
    ];
    render(<QuestionsManager weddingId="w" initialQuestions={initial} />);

    const pending = screen.getByRole('region', { name: /pending review \(1\)/i });
    expect(pending).toBeInTheDocument();
    expect(pending.textContent).toContain('Dress code?');
    expect(pending.textContent).not.toContain('Kids welcome?');
  });

  it('renders the author badge for "message the couple" entries', () => {
    render(
      <QuestionsManager
        weddingId="w"
        initialQuestions={[
          q({
            id: 'msg',
            question_text: 'Can I come?',
            invite_id: null,
            author_name: 'Stranger',
            author_email: 's@example.com',
          }),
        ]}
      />
    );
    expect(screen.getByText(/message from/i)).toBeInTheDocument();
    expect(screen.getByText('Stranger')).toBeInTheDocument();
    expect(screen.getByText(/s@example\.com/i)).toBeInTheDocument();
  });

  it('Approve button flips is_public=true via an update call', async () => {
    render(
      <QuestionsManager
        weddingId="w"
        initialQuestions={[q({ id: 'pending-1', is_public: false })]}
      />
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /approve/i }));

    expect(updateCalls).toContainEqual({
      table: 'questions',
      patch: { is_public: true },
      id: 'pending-1',
    });

    // Optimistic UI: the pending section should now be empty.
    expect(screen.queryByRole('region', { name: /pending review/i })).toBeNull();
  });

  it('Delete button removes the row (after confirm)', async () => {
    render(
      <QuestionsManager
        weddingId="w"
        initialQuestions={[q({ id: 'del-1', question_text: 'Nope?' })]}
      />
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /delete/i }));
    expect(screen.queryByText('Nope?')).toBeNull();
  });

  it('does not show any groups when initialQuestions is empty', () => {
    render(<QuestionsManager weddingId="w" initialQuestions={[]} />);
    expect(screen.queryByRole('region', { name: /pending review/i })).toBeNull();
    expect(screen.getByText(/no questions yet/i)).toBeInTheDocument();
  });
});
