'use client';

const LANGUAGES = [
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'ar', flag: '🇸🇦', label: 'Arabic' },
  { code: 'bn', flag: '🇧🇩', label: 'Bengali' },
  { code: 'hi', flag: '🇮🇳', label: 'Hindi' },
  { code: 'ur', flag: '🇵🇰', label: 'Urdu' },
  { code: 'fr', flag: '🇫🇷', label: 'French' },
  { code: 'es', flag: '🇪🇸', label: 'Spanish' },
  { code: 'tr', flag: '🇹🇷', label: 'Turkish' },
  { code: 'pt', flag: '🇧🇷', label: 'Portuguese' },
  { code: 'de', flag: '🇩🇪', label: 'German' },
  { code: 'it', flag: '🇮🇹', label: 'Italian' },
  { code: 'nl', flag: '🇳🇱', label: 'Dutch' },
  { code: 'ru', flag: '🇷🇺', label: 'Russian' },
  { code: 'zh', flag: '🇨🇳', label: 'Chinese' },
  { code: 'ja', flag: '🇯🇵', label: 'Japanese' },
  { code: 'ko', flag: '🇰🇷', label: 'Korean' },
  { code: 'fa', flag: '🇮🇷', label: 'Persian' },
  { code: 'sw', flag: '🇰🇪', label: 'Swahili' },
];

const MAX = 3;

interface Props {
  selected: string[];
  onChange: (langs: string[]) => void;
}

export function StepLanguages({ selected, onChange }: Props) {
  function toggle(code: string) {
    if (selected.includes(code)) {
      onChange(selected.filter((l) => l !== code));
    } else if (selected.length < MAX) {
      onChange([...selected, code]);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-montserrat)', fontSize: 22, fontWeight: 600, color: 'var(--text)', margin: '0 0 6px' }}>
          Which languages?
        </h2>
        <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
          {selected.length}/{MAX} selected — guests can switch between them on their invite.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {LANGUAGES.map((lang) => {
          const isOn = selected.includes(lang.code);
          const isDisabled = !isOn && selected.length >= MAX;

          return (
            <button
              key={lang.code}
              onClick={() => toggle(lang.code)}
              disabled={isDisabled}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: '14px 10px',
                borderRadius: 12,
                border: `1.5px solid ${isOn ? 'var(--sage)' : 'var(--border)'}`,
                background: isOn ? 'var(--sage-dim)' : 'var(--surface)',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.4 : 1,
                transition: 'border-color 0.15s, background 0.15s, opacity 0.15s',
              }}
            >
              <span style={{ fontSize: 24 }}>{lang.flag}</span>
              <span style={{
                fontFamily: 'var(--font-montserrat)',
                fontSize: 11,
                fontWeight: isOn ? 600 : 400,
                color: isOn ? 'var(--sage)' : 'var(--text)',
              }}>
                {lang.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
