'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import {
  groupQuestions,
  isMessageToCouple,
  type ModerationQuestion,
} from '@/lib/question-groups';

interface Props {
  weddingId: string;
  initialQuestions: ModerationQuestion[];
}

/**
 * Couple-facing moderation and Q&A dashboard. Inbound guest submissions land
 * with `is_public = false`, so they do not appear on the public invite page
 * until the couple reviews them. This component surfaces those in a
 * dedicated "Pending review" group with approve/dismiss controls, and keeps
 * the existing "pinned / unanswered / answered" groupings for everything
 * already triaged.
 */
export function QuestionsManager({ weddingId, initialQuestions }: Props) {
  const [questions, setQuestions] = useState<ModerationQuestion[]>(initialQuestions);
  const [saving, setSaving] = useState<string | null>(null);
  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');
  const [adding, setAdding] = useState(false);
  const [addingFaq, setAddingFaq] = useState(false);
  const supabase = createClient();

  async function addFaq() {
    if (!newQ.trim()) return;
    setAdding(true);
    const { data, error } = await supabase
      .from('questions')
      .insert({
        wedding_id: weddingId,
        question_text: newQ.trim(),
        answer_text: newA.trim() || null,
        is_pinned: true,
        is_public: true,
      })
      .select()
      .single();
    if (!error && data) {
      setQuestions((prev) => [data as ModerationQuestion, ...prev]);
      setNewQ('');
      setNewA('');
      setAddingFaq(false);
    }
    setAdding(false);
  }

  async function updateQuestion(id: string, patch: Partial<ModerationQuestion>) {
    setSaving(id);
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
    await supabase.from('questions').update(patch).eq('id', id);
    setSaving(null);
  }

  async function deleteQuestion(id: string) {
    if (!confirm('Delete this question?')) return;
    await supabase.from('questions').delete().eq('id', id);
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  async function approveQuestion(id: string) {
    await updateQuestion(id, { is_public: true });
  }

  const groups = groupQuestions(questions);

  return (
    <div>
      {/* Add FAQ */}
      <div style={{ marginBottom: 24 }}>
        {!addingFaq ? (
          <Button size="sm" onClick={() => setAddingFaq(true)}>+ Add FAQ</Button>
        ) : (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px' }}>
            <input
              autoFocus
              value={newQ}
              onChange={(e) => setNewQ(e.target.value)}
              placeholder="Question…"
              style={{ ...inputStyle, marginBottom: 10 }}
              aria-label="New FAQ question"
            />
            <textarea
              value={newA}
              onChange={(e) => setNewA(e.target.value)}
              placeholder="Answer…"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-montserrat)' }}
              aria-label="New FAQ answer"
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <Button size="sm" loading={adding} onClick={addFaq}>Save FAQ</Button>
              <Button size="sm" variant="secondary" onClick={() => setAddingFaq(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </div>

      {groups.pending.length > 0 && (
        <QuestionGroup
          title={`Pending review (${groups.pending.length})`}
          tone="warning"
          questions={groups.pending}
          saving={saving}
          onUpdate={updateQuestion}
          onDelete={deleteQuestion}
          onApprove={approveQuestion}
        />
      )}

      {groups.pinned.length > 0 && (
        <QuestionGroup title="Pinned FAQs" questions={groups.pinned} saving={saving} onUpdate={updateQuestion} onDelete={deleteQuestion} />
      )}

      {groups.unanswered.length > 0 && (
        <QuestionGroup title={`Unanswered (${groups.unanswered.length})`} questions={groups.unanswered} saving={saving} onUpdate={updateQuestion} onDelete={deleteQuestion} />
      )}

      {groups.answered.length > 0 && (
        <QuestionGroup title="Answered" questions={groups.answered} saving={saving} onUpdate={updateQuestion} onDelete={deleteQuestion} />
      )}

      {groups.archived.length > 0 && (
        <QuestionGroup title="Archived" questions={groups.archived} saving={saving} onUpdate={updateQuestion} onDelete={deleteQuestion} />
      )}

      {questions.length === 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '40px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: 'var(--text-tertiary)', margin: 0 }}>
            No questions yet. Add FAQs above, or wait for guests to ask questions from your invite.
          </p>
        </div>
      )}
    </div>
  );
}

function QuestionGroup({ title, tone, questions, saving, onUpdate, onDelete, onApprove }: {
  title: string;
  tone?: 'warning';
  questions: ModerationQuestion[];
  saving: string | null;
  onUpdate: (id: string, patch: Partial<ModerationQuestion>) => void;
  onDelete: (id: string) => void;
  onApprove?: (id: string) => void;
}) {
  const headingColor = tone === 'warning' ? 'var(--warning, #C4564A)' : 'var(--text-tertiary)';
  return (
    <section aria-label={title} style={{ marginBottom: 20 }}>
      <h3 style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, fontWeight: 600, color: headingColor, letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 10px' }}>
        {title}
      </h3>
      {questions.map((q) => (
        <QuestionCard key={q.id} question={q} saving={saving === q.id} onUpdate={onUpdate} onDelete={onDelete} onApprove={onApprove} />
      ))}
    </section>
  );
}

function QuestionCard({ question: q, saving, onUpdate, onDelete, onApprove }: {
  question: ModerationQuestion;
  saving: boolean;
  onUpdate: (id: string, patch: Partial<ModerationQuestion>) => void;
  onDelete: (id: string) => void;
  onApprove?: (id: string) => void;
}) {
  const [answer, setAnswer] = useState(q.answer_text ?? '');
  const messageFromStranger = isMessageToCouple(q);

  return (
    <article style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
      padding: '14px 16px', marginBottom: 10,
    }}>
      {(q.author_name || q.author_email) && (
        <p style={{
          fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'var(--text-tertiary)',
          margin: '0 0 6px',
        }}>
          {messageFromStranger ? 'Message from ' : 'From '}
          <strong style={{ color: 'var(--text)' }}>{q.author_name || q.author_email}</strong>
          {q.author_name && q.author_email ? <> · {q.author_email}</> : null}
        </p>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, fontWeight: 600, color: 'var(--text)', flex: 1, margin: 0 }}>
          {q.question_text}
        </p>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {onApprove && (
            <button
              onClick={() => onApprove(q.id)}
              style={{
                background: 'var(--sage, #2C3A2E)',
                color: 'white', border: 'none', borderRadius: 6,
                padding: '4px 10px', cursor: 'pointer', fontSize: 12,
                fontFamily: 'var(--font-montserrat)', fontWeight: 600,
              }}
            >
              Approve
            </button>
          )}
          <button
            onClick={() => onUpdate(q.id, { is_pinned: !q.is_pinned })}
            title={q.is_pinned ? 'Unpin' : 'Pin to FAQ'}
            style={{
              background: q.is_pinned ? 'var(--sage-dim)' : 'none',
              border: '1px solid var(--border)', borderRadius: 6,
              padding: '3px 8px', cursor: 'pointer', fontSize: 12,
              color: q.is_pinned ? 'var(--sage)' : 'var(--text-tertiary)',
              fontFamily: 'var(--font-montserrat)',
            }}
          >
            {q.is_pinned ? 'Pinned' : 'Pin'}
          </button>
          <button
            aria-label="Delete"
            onClick={() => onDelete(q.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 16, padding: '0 2px' }}
          >
            ×
          </button>
        </div>
      </div>

      <label style={srOnly} htmlFor={`q-answer-${q.id}`}>Answer</label>
      <textarea
        id={`q-answer-${q.id}`}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Write your answer…"
        rows={2}
        style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-montserrat)', marginBottom: 8 }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={() => onUpdate(q.id, { answer_text: answer || null, is_public: true })}
          disabled={saving}
          style={{
            fontFamily: 'var(--font-montserrat)', fontSize: 12, fontWeight: 600,
            color: 'white', background: 'var(--sage)', border: 'none', borderRadius: 7,
            padding: '6px 14px', cursor: 'pointer',
          }}
        >
          {saving ? 'Saving…' : 'Save answer'}
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={q.is_public}
            onChange={(e) => onUpdate(q.id, { is_public: e.target.checked })}
          />
          <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'var(--text-tertiary)' }}>Public</span>
        </label>
      </div>
    </article>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid var(--border)',
  background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-montserrat)',
  fontSize: 13, outline: 'none', boxSizing: 'border-box',
};

const srOnly: React.CSSProperties = {
  position: 'absolute', width: 1, height: 1, padding: 0, margin: -1,
  overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0,
};
