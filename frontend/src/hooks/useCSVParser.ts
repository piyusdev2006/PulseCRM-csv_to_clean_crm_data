'use client';

import { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import type { CSVPreviewData } from '@/types';

interface UseCSVParserReturn {
  data: CSVPreviewData | null;
  error: string | null;
  isParsing: boolean;
}

/**
 * Custom hook for client-side CSV parsing using PapaParse.
 * Memoizes results to prevent re-parsing the same file.
 */
export function useCSVParser(file: File | null): UseCSVParserReturn {
  const [data, setData] = useState<CSVPreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const parsedFileRef = useRef<string | null>(null);

  useEffect(() => {
    if (!file) {
      setData(null);
      setError(null);
      setIsParsing(false);
      parsedFileRef.current = null;
      return;
    }

    // Skip if already parsed this file (memoize by name+size+lastModified)
    const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
    if (parsedFileRef.current === fileKey && data) {
      return;
    }

    setIsParsing(true);
    setError(null);
    setData(null);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        if (results.errors.length > 0) {
          const criticalErrors = results.errors.filter(
            (e) => e.type === 'FieldMismatch' || e.type === 'Quotes'
          );
          if (criticalErrors.length > 0) {
            setError(
              `CSV parsing error: ${criticalErrors[0].message} (row ${criticalErrors[0].row})`
            );
            setIsParsing(false);
            return;
          }
        }

        if (!results.meta.fields || results.meta.fields.length === 0) {
          setError('No headers found in the CSV file.');
          setIsParsing(false);
          return;
        }

        if (results.data.length === 0) {
          setError('The CSV file is empty (no data rows found).');
          setIsParsing(false);
          return;
        }

        const csvPreview: CSVPreviewData = {
          headers: results.meta.fields,
          rows: results.data,
          totalRows: results.data.length,
        };

        setData(csvPreview);
        parsedFileRef.current = fileKey;
        setIsParsing(false);
      },
      error: (err: Error) => {
        setError(`Failed to parse CSV: ${err.message}`);
        setIsParsing(false);
      },
    });
  }, [file]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, error, isParsing };
}
