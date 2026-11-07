'use client';

import * as React from 'react';

type Status = 'ok' | 'warn' | 'danger' | 'neutral';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: Status;
  label?: string;
  className?: string;
}

export function Badge({ status = 'neutral', label, className, ...props }: BadgeProps) {
  const styles: Record<string, string> = {
    ok: 'border-[var(--k-success-light)] bg-[var(--k-success-light)] text-[var(--k-success)]',
    warn: 'border-[var(--k-warning-light)] bg-[var(--k-warning-light)] text-[var(--k-warning)]',
    danger: 'border-[var(--k-danger-light)] bg-[var(--k-danger-light)] text-[var(--k-danger)]',
    neutral: 'border-[var(--k-border)] bg-[var(--k-surface-muted)] text-[var(--k-ink-soft)]',
  };

  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize',
        styles[status],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {label}
    </span>
  );
}
