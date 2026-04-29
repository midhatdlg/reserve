'use client';

const BLOCKS = [
  { id: 'rsvp',          emoji: '✉️',  label: 'RSVP',           description: 'Collect responses',      locked: true },
  { id: 'itinerary',     emoji: '📋',  label: 'Itinerary',      description: 'Day-of timeline' },
  { id: 'table',         emoji: '🪑',  label: 'Table Numbers',  description: 'Seating assignments' },
  { id: 'qna',           emoji: '💬',  label: 'Q&A',            description: 'Guest questions' },
{ id: 'countdown',     emoji: '⏳',  label: 'Countdown',      description: 'Days until the big day' },
  { id: 'our-story',     emoji: '💕',  label: 'Our Story',      description: 'How you met' },
  { id: 'dress-code',    emoji: '👗',  label: 'Dress Code',     description: 'Attire guidance' },
  { id: 'venue-map',     emoji: '📍',  label: 'Venue Map',      description: 'Location & directions' },
  { id: 'transport',     emoji: '🚗',  label: 'Transport',      description: 'Getting there' },
  { id: 'accommodation', emoji: '🏨',  label: 'Accommodation',  description: 'Where to stay' },
  { id: 'menu',          emoji: '🍽️', label: 'Menu',           description: 'Dinner selections' },
  { id: 'gift-registry', emoji: '🎁',  label: 'Gift Registry',  description: 'Wishlist link' },
  { id: 'pre-wedding',   emoji: '🌸',  label: 'Pre-Wedding',    description: 'Mehndi, Haldi & more' },
];

interface Props {
  selected: string[];
  onChange: (blocks: string[]) => void;
}

export function StepBlockSelector({ selected, onChange }: Props) {
  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((b) => b !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-montserrat)', fontSize: 22, fontWeight: 600, color: 'var(--text)', margin: '0 0 6px' }}>
          What sections do you need?
        </h2>
        <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
          {selected.length} section{selected.length !== 1 ? 's' : ''} selected — guests only see what you turn on.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {BLOCKS.map((block) => {
          const isOn = selected.includes(block.id);
          return (
            <button
              key={block.id}
              onClick={() => !block.locked && toggle(block.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 12,
                border: `1.5px solid ${isOn ? 'var(--sage)' : 'var(--border)'}`,
                background: isOn ? 'var(--sage-dim)' : 'var(--surface)',
                cursor: block.locked ? 'default' : 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <span style={{ fontSize: 20, flexShrink: 0 }}>{block.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
                    {block.label}
                  </span>
                  {block.locked && (
                    <span style={{
                      fontFamily: 'var(--font-montserrat)',
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: '0.3px',
                      color: 'var(--sage)',
                      background: 'var(--sage-dim)',
                      borderRadius: 4,
                      padding: '1px 5px',
                    }}>
                      ALWAYS ON
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1 }}>
                  {block.description}
                </div>
              </div>
              {/* Toggle dot */}
              <div style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                border: `2px solid ${isOn ? 'var(--sage)' : 'var(--border)'}`,
                background: isOn ? 'var(--sage)' : 'transparent',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
              }}>
                {isOn && (
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5 3.5-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
