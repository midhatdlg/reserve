'use client';

import { type ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'pill';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const styles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'var(--sage)',
    color: 'var(--accent-text)',
    border: 'none',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--sage)',
    border: '1px solid var(--border)',
  },
  pill: {
    background: 'var(--sage-dim)',
    color: 'var(--sage)',
    border: '1px solid transparent',
    borderRadius: 20,
  },
};

const sizes: Record<Size, React.CSSProperties> = {
  sm: { padding: '7px 14px', fontSize: 11 },
  md: { padding: '10px 20px', fontSize: 12 },
  lg: { padding: '13px 28px', fontSize: 13 },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, children, style, ...props }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderRadius: variant === 'pill' ? 20 : 8,
          fontFamily: 'var(--font-montserrat)',
          fontWeight: 600,
          letterSpacing: '0.5px',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? 0.55 : 1,
          transition: 'opacity 0.15s, border-color 0.15s',
          whiteSpace: 'nowrap',
          ...styles[variant],
          ...sizes[size],
          ...style,
        }}
        {...props}
      >
        {loading ? <Spinner /> : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

function Spinner() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      style={{ animation: 'spin 0.7s linear infinite' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
    </svg>
  );
}
