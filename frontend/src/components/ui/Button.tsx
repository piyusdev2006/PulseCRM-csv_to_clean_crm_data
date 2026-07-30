'use client';

import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-[#2563eb] to-[#7c3aed] hover:from-[#1d4ed8] hover:to-[#6d28d9] text-white shadow-lg shadow-blue-500/20 font-semibold',
  secondary:
    'border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-color-hover)] font-medium',
  ghost:
    'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] font-medium',
  danger:
    'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-500/20 font-semibold',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs rounded-lg gap-2 font-geist',
  md: 'px-6 py-3 text-sm rounded-xl gap-2.5 font-geist',
  lg: 'px-8 py-4 text-base rounded-2xl gap-3 font-geist',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      className={cn(
        'inline-flex items-center justify-center transition-all duration-200 cursor-pointer',
        'focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]',
        variantStyles[variant],
        sizeStyles[size],
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      whileHover={isDisabled ? undefined : { scale: 1.02 }}
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
      disabled={isDisabled}
      {...props}
    >
      {isLoading && <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" />}
      {children}
    </motion.button>
  );
}
