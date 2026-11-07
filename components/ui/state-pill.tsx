'use client';

import * as React from 'react';

interface StatePillProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string;
  className?: string;
}

export function StatePill({ status, className, ...props }: StatePillProps) {
  const normalized = status.replaceAll('_', ' ').toLowerCase();

  const styles: Record<string, string> = {
    approved: 'border-[var(--k-success-light)] bg-[var(--k-success-light)] text-[var(--k-success)]',
    active: 'border-[var(--k-success-light)] bg-[var(--k-success-light)] text-[var(--k-success)]',
    accepted: 'border-[var(--k-success-light)] bg-[var(--k-success-light)] text-[var(--k-success)]',
    pending: 'border-[var(--k-border)] bg-[var(--k-surface-muted)] text-[var(--k-ink-soft)]',
    rejected: 'border-[var(--k-danger-light)] bg-[var(--k-danger-light)] text-[var(--k-danger)]',
    declined: 'border-[var(--k-danger-light)] bg-[var(--k-danger-light)] text-[var(--k-danger)]',
    suspended: 'border-[var(--k-danger-light)] bg-[var(--k-danger-light)] text-[var(--k-danger)]',
    draft: 'border-[var(--k-border)] bg-[var(--k-surface-muted)] text-[var(--k-ink-soft)]',
    open: 'border-[var(--k-success-light)] bg-[var(--k-success-light)] text-[var(--k-success)]',
    closed: 'border-[var(--k-border)] bg-[var(--k-surface-muted)] text-[var(--k-ink-soft)]',
    registered: 'border-[var(--k-success-light)] bg-[var(--k-success-light)] text-[var(--k-success)]',
    cancelled: 'border-[var(--k-danger-light)] bg-[var(--k-danger-light)] text-[var(--k-danger)]',
    attended: 'border-[var(--k-success-light)] bg-[var(--k-success-light)] text-[var(--k-success)]',
    no_show: 'border-[var(--k-danger-light)] bg-[var(--k-danger-light)] text-[var(--k-danger)]',
    submitted: 'border-[var(--k-border)] bg-[var(--k-surface-muted)] text-[var(--k-ink-soft)]',
    under_review: 'border-[var(--k-border)] bg-[var(--k-surface-muted)] text-[var(--k-ink-soft)]',
    shortlisted: 'border-[var(--k-success-light)] bg-[var(--k-success-light)] text-[var(--k-success)]',
    selected: 'border-[var(--k-success-light)] bg-[var(--k-success-light)] text-[var(--k-success)]',
    scheduled: 'border-[var(--k-success-light)] bg-[var(--k-success-light)] text-[var(--k-success)]',
    rescheduled: 'border-[var(--k-border)] bg-[var(--k-surface-muted)] text-[var(--k-ink-soft)]',
    completed: 'border-[var(--k-success-light)] bg-[var(--k-success-light)] text-[var(--k-success)]',
  };

  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize',
        styles[normalized] || styles['pending'],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {normalized}
    </span>
  );
}
