// ============================================================================
// GrowEasy CRM - Import Controller
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { parseCSV } from '../services/csv.service';
import { processBatches } from '../services/batch.service';
import type { ImportResult } from '../types';

/**
 * Handle CSV file upload and CRM data import.
 *
 * POST /api/import
 * Content-Type: multipart/form-data
 * Body: file (CSV)
 */
export async function handleImport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // ── 1. Validate uploaded file ─────────────────────────────────────────
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: {
          message: 'No file uploaded. Please attach a CSV file using the "file" field.',
          code: 'NO_FILE',
        },
      });
      return;
    }

    console.log(
      `📄 Received file: ${req.file.originalname} (${req.file.size} bytes)`
    );

    // ── 2. Parse CSV ──────────────────────────────────────────────────────
    const csvResult = parseCSV(req.file.buffer);

    if (csvResult.headers.length === 0) {
      res.status(400).json({
        success: false,
        error: {
          message: 'The CSV file appears to be empty or has no headers.',
          code: 'EMPTY_CSV',
        },
      });
      return;
    }

    if (csvResult.records.length === 0) {
      res.status(400).json({
        success: false,
        error: {
          message:
            'The CSV file has headers but no data rows. Please upload a file with at least one data row.',
          code: 'NO_RECORDS',
        },
      });
      return;
    }

    console.log(
      `📊 Parsed CSV: ${csvResult.headers.length} columns, ${csvResult.records.length} rows` +
        (csvResult.errors.length > 0
          ? `, ${csvResult.errors.length} parse warnings`
          : '')
    );

    // ── 3. Process through AI in batches ──────────────────────────────────
    const startTime = Date.now();
    const { records, skipped } = await processBatches(
      csvResult.headers,
      csvResult.records
    );
    const processingTimeMs = Date.now() - startTime;

    // ── 4. Build and return result ────────────────────────────────────────
    const result: ImportResult = {
      success: true,
      data: {
        records,
        skipped,
        summary: {
          totalRows: csvResult.records.length,
          imported: records.length,
          skipped: skipped.length,
          processingTimeMs,
        },
      },
    };

    console.log(
      `✅ Import complete: ${records.length} imported, ${skipped.length} skipped ` +
        `in ${processingTimeMs}ms`
    );

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
