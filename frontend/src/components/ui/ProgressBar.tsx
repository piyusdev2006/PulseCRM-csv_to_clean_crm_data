'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
}

export function ProgressBar({
  progress,
  label,
  showPercentage = true,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full space-y-3">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between">
          {label && (
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              {label}
            </span>
          )}
          {showPercentage && (
            <span
              className="text-sm font-semibold tabular-nums"
              style={{ color: 'var(--accent)' }}
            >
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}

      <div
        className="relative h-3 rounded-full overflow-hidden"
        style={{ background: 'var(--bg-secondary)' }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full progress-stripes pulse-glow"
          style={{
            background: 'linear-gradient(90deg, var(--accent), var(--purple))',
          }}
          initial={{ width: '0%' }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        {/* Shimmer overlay */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full opacity-30"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            width: '30%',
          }}
          animate={{
            x: ['0%', '400%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>
    </div>
  );
}
