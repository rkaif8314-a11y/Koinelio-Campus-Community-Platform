'use client';

import * as React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padded?: 'none' | 'sm' | 'md' | 'lg';
  bordered?: boolean;
  shadow?: boolean;
}

export function Card({
  className,
  padded = 'md',
  bordered = true,
  shadow = true,
  children,
  ...props
}: CardProps) {
  const padding: Record<string, string> = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8',
  };

  return (
    <div
      className={[
        'rounded-xl',
        bordered ? 'border border-[var(--k-border)]' : '',
        shadow ? 'shadow-sm' : '',
        'bg-[var(--k-surface)]',
        padding[padded],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
}

export function CardHeader({ className, title, subtitle, ...props }: CardHeaderProps) {
  return (
    <div className={['mb-4 flex flex-wrap items-end justify-between gap-3', className].filter(Boolean).join(' ')}>
      {title || subtitle ? (
        <div>
          {title && <h2 className="text-xl font-bold tracking-tight text-[var(--k-ink)]">{title}</h2>}
          {subtitle && <p className="mt-1 text-sm leading-6 text-[var(--k-ink-soft)]">{subtitle}</p>}
        </div>
      ) : (
        <div {...props} />
      )}
    </div>
  );
}

interface CardSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  spaced?: boolean;
}

export function CardSection({ className, spaced = true, children, ...props }: CardSectionProps) {
  return (
    <div
      className={[
        'border-t border-[var(--k-border-soft)]',
        spaced ? 'space-y-4' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}
