'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

// ── Resend Button ─────────────────────────────────────────────────────────────
interface ResendButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'emerald' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function ResendButton({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}: ResendButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-2.5 text-base rounded-xl',
  };

  const variantClasses = {
    primary: 'resend-button-primary',
    emerald: 'resend-button-emerald',
    secondary: 'resend-button-secondary',
    ghost: 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] border border-transparent',
    danger: 'bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
}

// ── Resend Badge ──────────────────────────────────────────────────────────────
interface ResendBadgeProps {
  variant?: 'default' | 'emerald' | 'warning' | 'error' | 'purple' | 'zinc';
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ResendBadge({
  variant = 'default',
  dot = true,
  children,
  className = '',
}: ResendBadgeProps) {
  const variantStyles = {
    default: 'bg-[var(--border-subtle)] text-[var(--text-main)] border-[var(--border-subtle)]',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
    error: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/25',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25',
    zinc: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
  };

  const dotColors = {
    default: 'bg-zinc-400',
    emerald: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    purple: 'bg-purple-500',
    zinc: 'bg-zinc-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} animate-pulse`} />
      )}
      {children}
    </span>
  );
}

// ── Resend Card ───────────────────────────────────────────────────────────────
interface ResendCardProps {
  glow?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function ResendCard({ glow = false, children, className = '', onClick }: ResendCardProps) {
  return (
    <div
      onClick={onClick}
      className={`resend-card p-6 ${glow ? 'resend-card-glow' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

// ── Resend Stat Card ──────────────────────────────────────────────────────────
interface ResendStatCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  badgeVariant?: 'default' | 'emerald' | 'warning' | 'error' | 'purple';
}

export function ResendStatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  badgeVariant = 'emerald',
}: ResendStatCardProps) {
  return (
    <ResendCard glow={badgeVariant === 'emerald'}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">{title}</p>
          <div className="mt-2 text-2xl font-bold text-[var(--text-main)] tracking-tight">{value}</div>
          {subtitle && <p className="mt-1 text-xs text-[var(--text-muted)]">{subtitle}</p>}
        </div>
        {icon && (
          <div className="p-2.5 rounded-lg bg-[var(--border-subtle)] border border-[var(--border-subtle)] text-[var(--text-main)]">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center gap-2">
          <ResendBadge variant={badgeVariant} dot={false}>
            {trend}
          </ResendBadge>
        </div>
      )}
    </ResendCard>
  );
}

// ── Resend Tabs ───────────────────────────────────────────────────────────────
interface TabOption {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface ResendTabsProps {
  tabs: TabOption[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function ResendTabs({ tabs, activeTab, onChange }: ResendTabsProps) {
  return (
    <div className="resend-tabs-container">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`resend-tab-item flex items-center gap-2 ${isActive ? 'active' : ''}`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                  isActive ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
