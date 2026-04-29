'use client';

import { type InputHTMLAttributes, forwardRef, useState } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, style, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.5px',
              color: error ? 'var(--error)' : 'var(--text-secondary)',
            }}
          >
            {label.toUpperCase()}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            border: `1px solid ${error ? 'var(--error)' : focused ? 'var(--border-active)' : 'var(--border)'}`,
            background: 'var(--bg)',
            color: 'var(--text)',
            fontFamily: 'var(--font-montserrat)',
            fontSize: 14,
            outline: 'none',
            width: '100%',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s',
            ...style,
          }}
          {...props}
        />
        {error && (
          <span style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: 11,
            color: 'var(--error)',
          }}>
            {error}
          </span>
        )}
        {hint && !error && (
          <span style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: 11,
            color: 'var(--text-tertiary)',
          }}>
            {hint}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
