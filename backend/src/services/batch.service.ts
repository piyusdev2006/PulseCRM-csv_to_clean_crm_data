// ============================================================================
// GrowEasy CRM - Batch Processing Service
// ============================================================================

import config from '../config';
import { extractCRMFields } from './ai.service';
import type { CRMRecord, SkippedRecord } from '../types';

/**
 * Process all CSV records in sequential batches, calling the AI service
 * for each batch and aggregating the results.
 *
 * @param headers    CSV column headers
 * @param records    All raw row objects from the CSV
 * @param batchSize  Number of records per batch (default from config)
 * @returns Aggregated records and skipped entries
 */
export async function processBatches(
  headers: string[],
  records: Record<string, string>[],
  batchSize: number = config.BATCH_SIZE
): Promise<{ records: CRMRecord[]; skipped: SkippedRecord[] }> {
  const allRecords: CRMRecord[] = [];
  const allSkipped: SkippedRecord[] = [];

  if (records.length === 0) {
    return { records: allRecords, skipped: allSkipped };
  }

  // Split into batches
  const totalBatches = Math.ceil(records.length / batchSize);

  console.log(
    `📦 Starting batch processing: ${records.length} records → ${totalBatches} batch(es) of up to ${batchSize}`
  );

  for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
    const start = batchIdx * batchSize;
    const end = Math.min(start + batchSize, records.length);
    const batchRecords = records.slice(start, end);

    console.log(
      `\n🔄 Processing batch ${batchIdx + 1} of ${totalBatches} ` +
        `(rows ${start + 1}–${end} of ${records.length})`
    );

    try {
      const result = await extractCRMFields(headers, batchRecords, start);
      allRecords.push(...result.records);
      allSkipped.push(...result.skipped);

      console.log(
        `  ✅ Batch ${batchIdx + 1}: ${result.records.length} imported, ${result.skipped.length} skipped`
      );
    } catch (err: unknown) {
      // If the entire batch fails catastrophically (shouldn't happen since
      // ai.service already handles retries), mark all rows as skipped
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ Batch ${batchIdx + 1} failed completely: ${message}`);

      const skippedBatch: SkippedRecord[] = batchRecords.map((rec, i) => ({
        rowIndex: start + i,
        originalData: rec,
        reason: `Batch processing failed: ${message}`,
      }));
      allSkipped.push(...skippedBatch);
    }
  }

  console.log(
    `\n📊 Batch processing complete: ${allRecords.length} imported, ${allSkipped.length} skipped`
  );

  return { records: allRecords, skipped: allSkipped };
}
