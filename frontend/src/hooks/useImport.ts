'use client';

import { useState, useCallback } from 'react';
import { uploadCSV } from '@/lib/api';
import type { ImportResult } from '@/types';

interface UseImportReturn {
  importCSV: (file: File) => Promise<ImportResult>;
  isImporting: boolean;
  progress: number;
  error: string | null;
  result: ImportResult | null;
  reset: () => void;
}

/**
 * Custom hook for managing the CSV import lifecycle.
 * Tracks upload progress, processing state, and results.
 */
export function useImport(): UseImportReturn {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const importCSV = useCallback(async (file: File): Promise<ImportResult> => {
    setIsImporting(true);
    setProgress(0);
    setError(null);
    setResult(null);

    // Simulate processing progress after upload completes (30-90%)
    let progressInterval: ReturnType<typeof setInterval> | null = null;

    try {
      const importResult = await uploadCSV(file, (uploadPercent) => {
        setProgress(uploadPercent);

        // When upload hits 30%, start simulating processing progress
        if (uploadPercent >= 30 && !progressInterval) {
          let currentProgress = 30;
          progressInterval = setInterval(() => {
            currentProgress += Math.random() * 3 + 0.5;
            if (currentProgress >= 90) {
              currentProgress = 90;
              if (progressInterval) {
                clearInterval(progressInterval);
                progressInterval = null;
              }
            }
            setProgress(Math.round(currentProgress));
          }, 500);
        }
      });

      if (progressInterval) {
        clearInterval(progressInterval);
      }

      setProgress(100);
      setResult(importResult);
      setIsImporting(false);
      return importResult;
    } catch (err) {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      setIsImporting(false);
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setIsImporting(false);
    setProgress(0);
    setError(null);
    setResult(null);
  }, []);

  return { importCSV, isImporting, progress, error, result, reset };
}
