import type { CSSProperties, ReactNode } from 'react';
import type { TemplateTheme } from '@/lib/template-theme';

type Surface = 'paper' | 'dark';

interface PhotoDropHintProps {
  label: string;
  surface?: Surface;
  style?: CSSProperties;
  theme: TemplateTheme;
}

export function PhotoDropHint({ label, surface = 'paper', style, theme: t }: PhotoDropHintProps) {
  const dark = surface === 'dark';
  return (
    <div
      style={{
        border: dark ? t.placeholderBorderOnDark : t.placeholderBorder,
        background: dark ? t.placeholderFillOnDark : t.placeholderFill,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'clamp(14px, 4cqi, 22px)',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <span
        style={{
          fontFamily: t.bodyFont,
          fontSize: 'clamp(10px, 2.75cqi, 11px)',
          color: dark ? t.placeholderMutedOnDark : t.placeholderMuted,
          fontWeight: 500,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          lineHeight: 1.45,
        }}
      >
        {label}
      </span>
    </div>
  );
}

interface LineHintProps {
  children: ReactNode;
  surface?: Surface;
  style?: CSSProperties;
  theme: TemplateTheme;
}

export function LineHint({ children, surface = 'paper', style, theme: t }: LineHintProps) {
  const dark = surface === 'dark';
  return (
    <p
      style={{
        fontFamily: t.bodyFont,
        fontSize: 'clamp(11px, 2.85cqi, 12px)',
        fontStyle: 'italic',
        color: dark ? t.placeholderMutedOnDark : t.placeholderMuted,
        margin: 0,
        lineHeight: 1.55,
        ...style,
      }}
    >
      {children}
    </p>
  );
}
