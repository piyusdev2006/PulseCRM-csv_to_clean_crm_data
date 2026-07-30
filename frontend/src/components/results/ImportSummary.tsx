'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileSpreadsheet, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import type { ImportSummary as ImportSummaryType } from '@/types';
import { formatDuration } from '@/lib/utils';
import { ResendStatCard } from '@/components/ui/ResendComponents';

interface ImportSummaryProps {
  summary: ImportSummaryType;
}

interface AnimatedNumberProps {
  value: number;
  duration?: number;
}

function AnimatedNumber({ value, duration = 800 }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setDisplay(0);
      return;
    }

    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (value - startValue) * eased);

      setDisplay(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{display.toLocaleString()}</>;
}

export function ImportSummaryCards({ summary }: ImportSummaryProps) {
  const successRate =
    summary.totalRows > 0
      ? ((summary.imported / summary.totalRows) * 100).toFixed(1)
      : '0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ResendStatCard
          title="Total Rows Ingested"
          value={<AnimatedNumber value={summary.totalRows} />}
          subtitle="CSV spreadsheet records"
          icon={<FileSpreadsheet size={18} className="text-zinc-300" />}
          trend="Raw Batch Dataset"
          badgeVariant="default"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08 }}
      >
        <ResendStatCard
          title="Successfully Mapped"
          value={<AnimatedNumber value={summary.imported} />}
          subtitle={`${successRate}% conversion rate`}
          icon={<CheckCircle2 size={18} className="text-emerald-400" />}
          trend={`${successRate}% Success`}
          badgeVariant="emerald"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.16 }}
      >
        <ResendStatCard
          title="Skipped / Filtered"
          value={<AnimatedNumber value={summary.skipped} />}
          subtitle="Missing email & phone"
          icon={<AlertTriangle size={18} className="text-amber-400" />}
          trend={`${summary.skipped} records`}
          badgeVariant="warning"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.24 }}
      >
        <ResendStatCard
          title="AI Processing Time"
          value={formatDuration(summary.processingTimeMs)}
          subtitle="Gemini 2.0 Flash engine"
          icon={<Clock size={18} className="text-purple-400" />}
          trend="Realtime Gemini Pipeline"
          badgeVariant="purple"
        />
      </motion.div>
    </div>
  );
}
