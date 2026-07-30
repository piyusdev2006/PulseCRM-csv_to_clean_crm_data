// ============================================================================
// GrowEasy CRM - CSV Parsing Service
// ============================================================================

import Papa from 'papaparse';

export interface CSVParseResult {
  headers: string[];
  records: Record<string, string>[];
  errors: CSVParseError[];
}

export interface CSVParseError {
  row: number;
  message: string;
  type: string;
}

/**
 * Strip UTF-8 BOM (Byte Order Mark) from the beginning of a buffer.
 * BOM bytes: EF BB BF
 */
function stripBOM(buffer: Buffer): Buffer {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xef &&
    buffer[1] === 0xbb &&
    buffer[2] === 0xbf
  ) {
    return buffer.subarray(3);
  }
  return buffer;
}

/**
 * Parse a CSV file from a Buffer.
 *
 * Features:
 * - Auto-detects delimiter (comma, semicolon, tab, pipe)
 * - Skips empty lines
 * - Strips BOM markers
 * - Dynamic typing OFF (everything stays as strings)
 * - Returns detailed error info for malformed rows
 */
export function parseCSV(buffer: Buffer): CSVParseResult {
  const cleanBuffer = stripBOM(buffer);
  const csvString = cleanBuffer.toString('utf-8');

  // Handle completely empty input
  if (csvString.trim().length === 0) {
    return { headers: [], records: [], errors: [] };
  }

  const parsed = Papa.parse<Record<string, string>>(csvString, {
    header: true,
    skipEmptyLines: 'greedy',  // skip lines that are empty or whitespace-only
    dynamicTyping: false,       // keep everything as strings
    transformHeader: (header: string) => header.trim(),
    transform: (value: string) => value.trim(),
  });

  // Collect parse errors with row info
  const errors: CSVParseError[] = (parsed.errors || []).map((err) => ({
    row: typeof err.row === 'number' ? err.row : -1,
    message: err.message,
    type: err.type,
  }));

  // Extract headers from the meta information
  const headers: string[] = parsed.meta.fields || [];

  // Filter out completely empty records (all values are empty strings)
  const records = (parsed.data || []).filter((record) =>
    Object.values(record).some((val) => val !== '')
  );

  return { headers, records, errors };
}
