'use client';

import * as React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export function Input({
  className,
  label,
  error,
  helper,
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-xs font-semibold text-[var(--k-ink-soft)]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-lg border border-[var(--k-border)] bg-[var(--k-surface)] px-3.5 py-2.5 text-sm text-[var(--k-ink)] outline-none transition-colors focus:border-[var(--k-accent)] focus:ring-4 focus:ring-[var(--k-accent-light)] ${className ?? ''}`.trim()}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error || helper ? `${inputId}-message` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-message`} className="mt-1 text-xs text-[var(--k-danger)]" role="alert">
          {error}
        </p>
      )}
      {helper && !error && (
        <p id={`${inputId}-message`} className="mt-1 text-xs text-[var(--k-muted)]">
          {helper}
        </p>
      )}
    </div>
  );
}
