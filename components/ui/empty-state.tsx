'use client';

import * as React from 'react';

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  subtitle,
  icon,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={[
        'rounded-xl border border-dashed border-[var(--k-border)] bg-[var(--k-surface)] p-10 text-center',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {icon && <div className="mx-auto mb-3 h-10 w-10 text-[var(--k-muted)]">{icon}</div>}
      <h2 className="font-bold text-[var(--k-ink)]">{title}</h2>
      {subtitle && <p className="mt-2 text-sm leading-6 text-[var(--k-muted)]">{subtitle}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
