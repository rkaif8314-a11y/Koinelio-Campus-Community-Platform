'use client';

import * as React from 'react';

type AlertVariant = 'error' | 'success';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  className?: string;
}

export function Alert({ variant = 'error', title, className, children, ...props }: AlertProps) {
  const styles: Record<string, string> = {
    error: 'border-[var(--k-danger-light)] bg-[var(--k-danger-light)] text-[var(--k-danger)]',
    success: 'border-[var(--k-success-light)] bg-[var(--k-success-light)] text-[var(--k-success)]',
  };

  const icons: Record<string, React.ReactNode> = {
    error: <span className="mt-0.5 shrink-0" aria-hidden="true">⚠</span>,
    success: <span className="mt-0.5 shrink-0" aria-hidden="true">✓</span>,
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={[
        'mb-4 flex items-start gap-2 rounded-lg border p-3 text-sm',
        styles[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {icons[variant]}
      <div>
        {title && <p className="font-semibold">{title}</p>}
        {children && <p>{children}</p>}
      </div>
    </div>
  );
}
