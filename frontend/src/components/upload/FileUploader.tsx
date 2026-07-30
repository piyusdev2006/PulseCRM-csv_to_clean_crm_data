'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileSpreadsheet,
  FileType,
  FileText,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import type { CSVPreviewData } from '@/types';
import { formatFileSize } from '@/lib/utils';
import { ResendBadge, ResendButton } from '@/components/ui/ResendComponents';

interface FileUploaderProps {
  onParsed: (data: CSVPreviewData, file: File) => void;
  onSelectSample?: (sampleName: string) => void;
}

type UploadState = 'idle' | 'dragover' | 'selected' | 'parsing' | 'error';

export function FileUploader({ onParsed, onSelectSample }: FileUploaderProps) {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parseFile = useCallback(
    (file: File) => {
      setUploadState('parsing');
      setError(null);

      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: 'greedy',
        dynamicTyping: false,
        delimiter: '', // Auto-detect delimiter
        complete: (results) => {
          if (results.errors.length > 0) {
            const criticalErrors = results.errors.filter(
              (e) => e.type !== 'FieldMismatch'
            );
            if (criticalErrors.length > 5) {
              setError(`Too many parsing errors (${criticalErrors.length}). Please check your file format.`);
              setUploadState('error');
              return;
            }
          }

          if (!results.meta.fields || results.meta.fields.length === 0) {
            setError('No column headers found in the uploaded file.');
            setUploadState('error');
            return;
          }

          if (results.data.length === 0) {
            setError('The uploaded file contains no valid data rows.');
            setUploadState('error');
            return;
          }

          const csvPreview: CSVPreviewData = {
            headers: results.meta.fields,
            rows: results.data,
            totalRows: results.data.length,
          };

          setUploadState('selected');
          onParsed(csvPreview, file);
        },
        error: (err: Error) => {
          setError(`Failed to parse file: ${err.message}`);
          setUploadState('error');
        },
      });
    },
    [onParsed]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        parseFile(file);
      }
    },
    [parseFile]
  );

  const onDropRejected = useCallback(() => {
    setError('Invalid file format or size. Please upload a .csv, .tsv, or .txt file under 10MB.');
    setUploadState('error');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      'text/csv': ['.csv'],
      'text/tsv': ['.tsv', '.txt'],
      'application/vnd.ms-excel': ['.csv', '.tsv'],
      'text/plain': ['.csv', '.tsv', '.txt'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const currentState: UploadState = isDragActive ? 'dragover' : uploadState;

  const samples = [
    { name: 'facebook_leads.csv', label: 'Facebook Leads' },
    { name: 'google_ads.csv', label: 'Google Ads' },
    { name: 'real_estate_crm.csv', label: 'Real Estate CRM' },
    { name: 'messy_spreadsheet.csv', label: 'Messy Spreadsheet' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto flex flex-col items-center space-y-6"
    >
      {/* Dropzone Card Box */}
      <div
        {...getRootProps()}
        className="w-full relative cursor-pointer rounded-2xl border transition-all duration-200 overflow-hidden bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] group shadow-xl"
        style={{
          borderColor:
            currentState === 'dragover'
              ? '#10b981'
              : currentState === 'error'
              ? '#ef4444'
              : currentState === 'selected'
              ? '#34d399'
              : 'var(--border-subtle)',
          boxShadow:
            currentState === 'selected'
              ? '0 0 30px rgba(16, 185, 129, 0.18)'
              : 'var(--shadow-resend)',
        }}
      >
        <input {...getInputProps()} />

        <div className="relative flex flex-col items-center justify-center p-10 sm:p-12 text-center space-y-4">
          <AnimatePresence mode="wait">
            {currentState === 'selected' && selectedFile ? (
              <motion.div
                key="selected"
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                className="flex flex-col items-center space-y-3"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 size={28} className="text-emerald-500" />
                </div>
                <div className="space-y-1.5 text-center">
                  <p className="text-base font-semibold text-[var(--text-main)] tracking-tight">
                    {selectedFile.name}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <ResendBadge variant="emerald">
                      <ShieldCheck size={12} />
                      {formatFileSize(selectedFile.size)}
                    </ResendBadge>
                    <ResendBadge variant="default">
                      Auto-Detected Delimiter
                    </ResendBadge>
                  </div>
                </div>
              </motion.div>
            ) : currentState === 'error' ? (
              <motion.div
                key="error"
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                className="flex flex-col items-center space-y-3"
              >
                <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                  <AlertCircle size={28} className="text-red-500" />
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-sm font-semibold text-red-500">
                    {error || 'Error uploading file'}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Click or drag a valid file to try again.
                  </p>
                </div>
              </motion.div>
            ) : currentState === 'parsing' ? (
              <motion.div
                key="parsing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center space-y-3"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center animate-spin">
                  <Sparkles size={24} className="text-emerald-500" />
                </div>
                <p className="text-sm font-medium text-[var(--text-main)]">
                  Parsing CSV headers & detecting column structure...
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center space-y-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-[var(--border-subtle)] border border-[var(--border-subtle)] flex items-center justify-center group-hover:scale-105 group-hover:border-emerald-500/40 transition-all duration-200">
                  <Upload size={24} className="text-[var(--text-muted)] group-hover:text-[var(--text-main)]" />
                </div>

                <div className="space-y-1.5 max-w-sm text-center">
                  <p className="text-lg font-bold text-[var(--text-main)] tracking-tight">
                    Drop CSV spreadsheet, or{' '}
                    <span className="text-emerald-600 dark:text-emerald-400 underline underline-offset-4 decoration-emerald-500/40">
                      browse
                    </span>
                  </p>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Supports Facebook Ads, Google Ads, Real Estate CRMs & raw spreadsheets up to 10MB
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <ResendBadge variant="zinc">
                    <FileSpreadsheet size={12} className="text-emerald-500" /> .csv
                  </ResendBadge>
                  <ResendBadge variant="zinc">
                    <FileType size={12} className="text-purple-500" /> .tsv
                  </ResendBadge>
                  <ResendBadge variant="zinc">
                    <FileText size={12} className="text-blue-500" /> .txt
                  </ResendBadge>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Preset Sample CSV Toolbar */}
      {onSelectSample && (
        <div className="w-full flex flex-col items-center space-y-2.5 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
            <Zap size={13} className="text-amber-500" />
            <span>Or load a sample CSV preset</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {samples.map((sample) => (
              <ResendButton
                key={sample.name}
                variant="secondary"
                size="sm"
                onClick={() => onSelectSample(sample.name)}
              >
                {sample.label}
              </ResendButton>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
