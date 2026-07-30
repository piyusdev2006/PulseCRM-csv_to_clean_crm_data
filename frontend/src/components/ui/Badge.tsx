'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantConfig: Record<
  BadgeVariant,
  { bg: string; text: string; dot: string }
> = {
  success: {
    bg: 'bg-[var(--success-glow)] border border-emerald-500/10',
    text: 'text-[var(--success)]',
    dot: 'bg-[var(--success)]',
  },
  warning: {
    bg: 'bg-[var(--warning-glow)] border border-amber-500/10',
    text: 'text-[var(--warning)]',
    dot: 'bg-[var(--warning)]',
  },
  error: {
    bg: 'bg-[var(--error-glow)] border border-red-500/10',
    text: 'text-[var(--error)]',
    dot: 'bg-[var(--error)]',
  },
  info: {
    bg: 'bg-[var(--accent-glow)] border border-cyan-500/10',
    text: 'text-[var(--accent)]',
    dot: 'bg-[var(--accent)]',
  },
  default: {
    bg: 'bg-[var(--bg-secondary)] border border-[var(--border-color)]',
    text: 'text-[var(--text-secondary)]',
    dot: 'bg-[var(--text-muted)]',
  },
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const config = variantConfig[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap',
        config.bg,
        config.text,
        className
      )}
    >
      <span
        className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', config.dot)}
      />
      {children}
    </span>
  );
}

/**
 * Map a CRM status string to a Badge variant.
 */
export function getStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'GOOD_LEAD_FOLLOW_UP':
      return 'info';
    case 'DID_NOT_CONNECT':
      return 'warning';
    case 'BAD_LEAD':
      return 'error';
    case 'SALE_DONE':
      return 'success';
    default:
      return 'default';
  }
}

/**
 * Format CRM status for display.
 */
export function formatStatus(status: string): string {
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
