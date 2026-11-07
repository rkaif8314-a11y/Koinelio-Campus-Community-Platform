'use client';

import * as React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
  isLoading?: boolean;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg border border-transparent px-4 py-2.5 text-sm font-semibold transition-colors active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed';

  const variants: Record<string, string> = {
    primary: 'bg-[var(--k-accent)] text-[var(--k-on-accent)] hover:bg-[var(--k-accent-hover)]',
    secondary:
      'border border-[var(--k-border)] bg-[var(--k-surface)] text-[var(--k-ink)] hover:bg-[var(--k-surface-hover)] hover:border-[var(--k-accent)]',
    danger: 'bg-[var(--k-danger)] text-[var(--k-on-danger)] hover:bg-[var(--k-danger-hover)]',
    ghost:
      'border border-transparent bg-transparent text-[var(--k-ink-soft)] hover:bg-[var(--k-surface-hover)] hover:text-[var(--k-ink)]',
  };

  const sizes: Record<string, string> = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-4 py-2.5 text-sm',
  };

  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={React.isValidElement(children) ? className : `${base} ${variants[variant]} ${sizes[size]} ${className ?? ''}`.trim()}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
}
