'use client';

import { useState } from 'react';
import type { Question } from '@/types';

interface Props {
  questions: Question[];
  token: string;
}

export function QnaSection({ questions: initial, token }: Props) {
  const [questions, setQuestions] = useState(initial);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [askText, setAskText] = useState('');
  const [askStatus, setAskStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');

  async function submitQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!askText.trim()) return;
    setAskStatus('loading');

    try {
      const res = await fetch('/api/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, question_text: askText.trim() }),
      });
      if (!res.ok) throw new Error();
      const { question } = await res.json();
      if (question) setQuestions((q) => [...q, question]);
      setAskText('');
      setAskStatus('sent');
      setTimeout(() => setAskStatus('idle'), 3000);
    } catch {
      setAskStatus('error');
      setTimeout(() => setAskStatus('idle'), 3000);
    }
  }

  const pinned = questions.filter((q) => q.is_pinned && q.answer_text);
  const others = questions.filter((q) => !q.is_pinned && q.answer_text);

  return (
    <div>
      <p style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: 13,
        letterSpacing: '3px',
        color: '#1A1A1A',
        textTransform: 'uppercase',
        textAlign: 'center',
        margin: '0 0 20px',
      }}>
        Questions &amp; Answers
      </p>

      {/* Pinned FAQs */}
      {pinned.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {pinned.map((q) => (
            <QnaItem
              key={q.id}
              question={q}
              isExpanded={expanded === q.id}
              onToggle={() => setExpanded(expanded === q.id ? null : q.id)}
              pinned
            />
          ))}
        </div>
      )}

      {/* Other answered questions */}
      {others.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {others.map((q) => (
            <QnaItem
              key={q.id}
              question={q}
              isExpanded={expanded === q.id}
              onToggle={() => setExpanded(expanded === q.id ? null : q.id)}
            />
          ))}
        </div>
      )}

      {/* Ask a question */}
      <form onSubmit={submitQuestion} style={{ marginTop: 8 }}>
        <label style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 13,
          letterSpacing: '1.5px',
          color: '#9E9E9E',
          textTransform: 'uppercase',
          display: 'block',
          marginBottom: 8,
        }}>
          Have a question?
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={askText}
            onChange={(e) => setAskText(e.target.value)}
            placeholder="Ask the couple anything…"
            disabled={askStatus === 'loading'}
            style={{
              flex: 1,
              border: '1px solid rgba(26,26,26,0.15)',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.7)',
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: 15,
              color: '#1A1A1A',
              padding: '10px 12px',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={!askText.trim() || askStatus === 'loading'}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: 'none',
              background: '#1A1A1A',
              color: '#FFFFFF',
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: 14,
              cursor: askText.trim() ? 'pointer' : 'not-allowed',
              opacity: askText.trim() ? 1 : 0.5,
              whiteSpace: 'nowrap',
            }}
          >
            {askStatus === 'loading' ? '…' : 'Send'}
          </button>
        </div>
        {askStatus === 'sent' && (
          <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 13, color: '#5C5C5C', margin: '8px 0 0' }}>
            ✓ Question sent — the couple will reply soon.
          </p>
        )}
        {askStatus === 'error' && (
          <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 13, color: '#C62828', margin: '8px 0 0' }}>
            Something went wrong. Please try again.
          </p>
        )}
      </form>
    </div>
  );
}

function QnaItem({ question, isExpanded, onToggle, pinned }: {
  question: Question;
  isExpanded: boolean;
  onToggle: () => void;
  pinned?: boolean;
}) {
  return (
    <div style={{
      borderBottom: '1px solid rgba(26,26,26,0.1)',
      marginBottom: 2,
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '14px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {pinned && (
            <span style={{ fontSize: 12, color: '#1A1A1A' }}>📌</span>
          )}
          <span style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: 16,
            color: '#1A1A1A',
            lineHeight: 1.4,
          }}>
            {question.question_text}
          </span>
        </span>
        <span style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 18,
          color: '#1A1A1A',
          flexShrink: 0,
          transform: isExpanded ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s',
          display: 'inline-block',
        }}>
          ∨
        </span>
      </button>

      {isExpanded && question.answer_text && (
        <div style={{
          paddingBottom: 14,
          paddingLeft: pinned ? 22 : 0,
        }}>
          <p style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: 15,
            color: '#5C5C5C',
            margin: 0,
            lineHeight: 1.6,
            fontStyle: 'italic',
          }}>
            {question.answer_text}
          </p>
        </div>
      )}
    </div>
  );
}
