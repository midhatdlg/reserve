import { type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: number | string;
}

export function Card({ children, style, padding = 24, ...props }: CardProps) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding,
        boxShadow: 'var(--card-shadow)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
