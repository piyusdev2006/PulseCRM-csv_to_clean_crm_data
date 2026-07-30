'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: CardPadding;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  hover?: boolean;
  glow?: string;
  aiAccent?: 'none' | 'top' | 'left';
}

const paddingStyles: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4 sm:p-5',
  md: 'p-6 sm:p-8',
  lg: 'p-8 sm:p-12',
};

export function Card({
  children,
  className,
  padding = 'md',
  header,
  footer,
  hover = true,
  glow,
  aiAccent = 'none',
}: CardProps) {
  return (
    <div
      className={cn(
        hover ? 'glass-card' : 'glass-card-static',
        aiAccent === 'top' && 'lumina-ai-card-top',
        aiAccent === 'left' && 'lumina-ai-card-left',
        className
      )}
      style={
        glow
          ? {
              boxShadow: `0 0 30px ${glow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
            }
          : undefined
      }
    >
      {header && (
        <div
          className="px-6 py-4 border-b"
          style={{ borderColor: 'var(--border-color)' }}
        >
          {header}
        </div>
      )}
      <div className={paddingStyles[padding]}>{children}</div>
      {footer && (
        <div
          className="px-6 py-4 border-t"
          style={{ borderColor: 'var(--border-color)' }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
