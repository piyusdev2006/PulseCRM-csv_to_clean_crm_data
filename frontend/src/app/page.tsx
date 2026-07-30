'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Eye,
  Cpu,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Zap,
  ArrowRight,
  ArrowLeft,
  Wand2,
  Database,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';
import { FileUploader } from '@/components/upload/FileUploader';
import { PreviewTable } from '@/components/preview/PreviewTable';
import { ResultsTable } from '@/components/results/ResultsTable';
import { ImportSummaryCards } from '@/components/results/ImportSummary';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useImport } from '@/hooks/useImport';
import type { CSVPreviewData, ImportResult } from '@/types';
import { toast } from 'sonner';
import { ResendBadge, ResendButton, ResendCard } from '@/components/ui/ResendComponents';
import Papa from 'papaparse';

type Step = 'upload' | 'preview' | 'processing' | 'results';

const steps: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: 'upload', label: '1. Upload CSV', icon: Upload },
  { key: 'preview', label: '2. Preview & Filter', icon: Eye },
  { key: 'processing', label: '3. AI Extraction', icon: Cpu },
  { key: 'results', label: '4. CRM Results', icon: CheckCircle2 },
];

const PROCESSING_STAGES = [
  'Parsing header fields & detecting delimiter structure...',
  'Chunking records into parallel AI batches...',
  'Querying Google Gemini 2.0 Flash for semantic column mapping...',
  'Extracting names, normalizing phone numbers & locations...',
  'Validating CRM schema strictness with Zod runtime checks...',
  'Finalizing lead intelligence records & summary metrics...',
];

const FEATURE_CARDS = [
  {
    icon: Wand2,
    title: 'Zero Manual Mapping',
    description: 'AI understands any column header format automatically without manual setup.',
  },
  {
    icon: Database,
    title: 'Smart Normalization',
    description: 'Standardizes names, international phone formats, and location data instantly.',
  },
  {
    icon: ShieldCheck,
    title: 'Zod Runtime Safety',
    description: 'Strict schema validation ensures clean, error-free database imports every time.',
  },
  {
    icon: BarChart3,
    title: 'Skip Reason Auditing',
    description: 'Transparent tracking of invalid rows and missing contact details.',
  },
];

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [csvData, setCsvData] = useState<CSVPreviewData | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { progress, importCSV, reset: resetImport } = useImport();

  const handleFileParsed = useCallback((data: CSVPreviewData, uploadedFile: File) => {
    setCsvData(data);
    setFile(uploadedFile);
    setCurrentStep('preview');
  }, []);

  // Quick preset loader for sample CSVs
  const handleSelectSample = useCallback(async (sampleName: string) => {
    try {
      const response = await fetch(`/sample-csvs/${sampleName}`);
      if (!response.ok) {
        toast.error(`Sample CSV file ${sampleName} not found.`);
        return;
      }
      const text = await response.text();
      const sampleFile = new File([text], sampleName, { type: 'text/csv' });

      Papa.parse<Record<string, string>>(sampleFile, {
        header: true,
        skipEmptyLines: 'greedy',
        complete: (results) => {
          if (results.meta.fields && results.data.length > 0) {
            setCsvData({
              headers: results.meta.fields,
              rows: results.data,
              totalRows: results.data.length,
            });
            setFile(sampleFile);
            setCurrentStep('preview');
            toast.success(`Loaded ${sampleName} preset!`);
          }
        },
      });
    } catch {
      toast.error('Failed to load sample CSV.');
    }
  }, []);

  const handleConfirmImport = useCallback(async () => {
    if (!file) {
      toast.error('No file selected. Please upload a file first.');
      return;
    }

    setCurrentStep('processing');
    setError(null);

    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % PROCESSING_STAGES.length);
    }, 1800);

    try {
      const result = await importCSV(file);
      clearInterval(interval);
      setImportResult(result);
      setCurrentStep('results');
      toast.success(
        `Import completed! ${result.data.summary.imported} leads imported successfully.`
      );
    } catch (err) {
      clearInterval(interval);
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      setCurrentStep('preview');
      toast.error(message);
    }
  }, [file, importCSV]);

  const handleReset = useCallback(() => {
    setCsvData(null);
    setImportResult(null);
    setFile(null);
    setError(null);
    resetImport();
    setCurrentStep('upload');
  }, [resetImport]);

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] bg-resend-radial text-[var(--text-main)] flex flex-col justify-between w-full selection:bg-emerald-500 selection:text-white">
      {/* Main Content Wrapper */}
      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Resend Navbar Header */}
        <header className="w-full border-b border-[var(--border-subtle)] bg-[var(--bg-header)] backdrop-blur-md sticky top-0 z-50">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 w-full">
              {/* Brand & Badge */}
              <div className="flex items-center gap-3 cursor-pointer" onClick={handleReset}>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <Zap size={16} className="text-emerald-500" />
                </div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-[var(--text-main)] tracking-tight">
                    PulseCRM
                  </h1>
                  <ResendBadge variant="emerald">AI Importer</ResendBadge>
                </div>
              </div>

              {/* Status Indicator & Theme Toggle */}
              <div className="flex items-center gap-3">
                <ResendBadge variant="emerald">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Gemini 2.0 Flash Active
                </ResendBadge>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-16 flex flex-col items-center">
          {/* Stepper Toolbar */}
          <div className="w-full mb-10 flex items-center justify-center">
            <div className="resend-tabs-container max-w-full overflow-x-auto">
              {steps.map((step) => {
                const isActive = step.key === currentStep;
                const Icon = step.icon;
                return (
                  <button
                    key={step.key}
                    onClick={() => {
                      if (step.key === 'upload' && currentStep !== 'upload') handleReset();
                    }}
                    className={`resend-tab-item flex items-center gap-2 ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={14} className={isActive ? 'text-emerald-500' : 'text-[var(--text-muted)]'} />
                    <span>{step.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Views */}
          <AnimatePresence mode="wait">
            {/* Step 1: Upload Page */}
            {currentStep === 'upload' && (
              <motion.div
                key="upload"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="w-full flex flex-col items-center space-y-12"
              >
                {/* Resend Hero Section */}
                <div className="text-center flex flex-col items-center space-y-4 max-w-2xl mx-auto px-2">
                  <ResendBadge variant="emerald">
                    <Sparkles size={12} />
                    Autonomous Field Mapping Engine
                  </ResendBadge>

                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--text-main)] tracking-tight leading-[1.12]">
                    Import any CSV to PulseCRM
                  </h2>

                  <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed max-w-xl">
                    Powered by Google Gemini 2.0 Flash. Automatically maps and extracts names, phone numbers with country codes, locations, notes, and CRM lead statuses from any spreadsheet format.
                  </p>
                </div>

                {/* Dropzone Container */}
                <div className="w-full max-w-3xl">
                  <FileUploader
                    onParsed={handleFileParsed}
                    onSelectSample={handleSelectSample}
                  />
                </div>

                {/* Pipeline Capabilities Section */}
                <div className="w-full pt-10 border-t border-[var(--border-subtle)] space-y-6">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] px-1">
                    <span>Enterprise Pipeline Capabilities</span>
                    <span>Zero Manual Configuration</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    {FEATURE_CARDS.map((feature) => {
                      const Icon = feature.icon;
                      return (
                        <ResendCard key={feature.title} className="h-full flex flex-col justify-between">
                          <div>
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                              <Icon size={17} className="text-emerald-500" />
                            </div>
                            <h4 className="text-sm font-bold text-[var(--text-main)] mb-1">
                              {feature.title}
                            </h4>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                              {feature.description}
                            </p>
                          </div>
                        </ResendCard>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Preview */}
            {currentStep === 'preview' && csvData && (
              <motion.div
                key="preview"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="w-full space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">
                      Preview CSV Dataset
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Verify raw column headers before initiating Gemini AI extraction.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <ResendButton variant="secondary" size="sm" onClick={handleReset} icon={<ArrowLeft size={14} />}>
                      Back
                    </ResendButton>

                    <ResendButton variant="emerald" size="md" onClick={handleConfirmImport} icon={<Sparkles size={14} />}>
                      Confirm Import
                      <ArrowRight size={14} />
                    </ResendButton>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-medium">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <PreviewTable data={csvData} />
              </motion.div>
            )}

            {/* Step 3: Processing */}
            {currentStep === 'processing' && (
              <motion.div
                key="processing"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="w-full flex items-center justify-center py-12"
              >
                <ResendCard glow className="max-w-lg w-full text-center p-8 space-y-6">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center animate-spin">
                    <Cpu size={32} className="text-emerald-500" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-[var(--text-main)]">
                      AI Lead Extraction in Progress
                    </h3>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={stageIndex}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="text-xs font-mono text-emerald-500 font-semibold"
                      >
                        {PROCESSING_STAGES[stageIndex]}
                      </motion.p>
                    </AnimatePresence>
                  </div>

                  <ProgressBar
                    progress={progress}
                    label="Gemini 2.0 Flash Processing Batch..."
                  />

                  <p className="text-xs text-[var(--text-muted)]">
                    Executing parallel batch extraction with Zod schema validation
                  </p>
                </ResendCard>
              </motion.div>
            )}

            {/* Step 4: Results */}
            {currentStep === 'results' && importResult && (
              <motion.div
                key="results"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="w-full space-y-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">
                      CRM Import Dashboard
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Structured lead records mapped to PulseCRM format.
                    </p>
                  </div>

                  <ResendButton variant="secondary" size="md" onClick={handleReset} icon={<RotateCcw size={14} />}>
                    Import Another File
                  </ResendButton>
                </div>

                <ImportSummaryCards summary={importResult.data.summary} />

                <ResultsTable
                  records={importResult.data.records}
                  skipped={importResult.data.skipped}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Resend Footer */}
      <footer className="w-full border-t border-[var(--border-subtle)] bg-[var(--bg-canvas)] py-6 relative z-10">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--text-main)]">PulseCRM AI</span>
            <span>•</span>
            <span>AI-Powered CSV Importer</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Next.js 15 App Router</span>
            <span>•</span>
            <span>Express & Gemini 2.0 Flash</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
