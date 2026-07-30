// ============================================================================
// GrowEasy CRM - Batch Service Unit Tests
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processBatches } from '../../src/services/batch.service';

// Mock the AI service so we don't make real API calls during tests
vi.mock('../../src/services/ai.service', () => ({
  extractCRMFields: vi.fn(),
}));

// Import the mocked module
import { extractCRMFields } from '../../src/services/ai.service';

const mockExtractCRMFields = vi.mocked(extractCRMFields);

// ── Test helpers ──────────────────────────────────────────────────────────

function makeCRMRecord(overrides: Record<string, string> = {}) {
  return {
    created_at: '',
    name: overrides.name || 'Test User',
    email: overrides.email || 'test@example.com',
    country_code: '',
    mobile_without_country_code: overrides.phone || '1234567890',
    company: '',
    city: '',
    state: '',
    country: '',
    lead_owner: '',
    crm_status: '' as const,
    crm_note: '',
    data_source: '' as const,
    possession_time: '',
    description: '',
  };
}

function makeRawRecords(count: number): Record<string, string>[] {
  return Array.from({ length: count }, (_, i) => ({
    Name: `Person ${i + 1}`,
    Email: `person${i + 1}@example.com`,
    Phone: `${1000000000 + i}`,
  }));
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('Batch Service — processBatches', () => {
  const headers = ['Name', 'Email', 'Phone'];

  beforeEach(() => {
    vi.clearAllMocks();
    // Default: AI returns one record per input row, no skips
    mockExtractCRMFields.mockImplementation(async (_h, records, startIdx) => {
      return {
        records: records.map((r, i) =>
          makeCRMRecord({
            name: r['Name'] || `Row ${startIdx + i}`,
            email: r['Email'] || '',
            phone: r['Phone'] || '',
          })
        ),
        skipped: [],
      };
    });
  });

  // ── Batch splitting ───────────────────────────────────────────────────

  it('should split 60 records into 3 batches of 25, 25, and 10', async () => {
    const records = makeRawRecords(60);

    const result = await processBatches(headers, records, 25);

    // extractCRMFields should have been called 3 times
    expect(mockExtractCRMFields).toHaveBeenCalledTimes(3);

    // First batch: rows 0–24
    expect(mockExtractCRMFields.mock.calls[0][1]).toHaveLength(25);
    expect(mockExtractCRMFields.mock.calls[0][2]).toBe(0); // startIndex

    // Second batch: rows 25–49
    expect(mockExtractCRMFields.mock.calls[1][1]).toHaveLength(25);
    expect(mockExtractCRMFields.mock.calls[1][2]).toBe(25);

    // Third batch: rows 50–59
    expect(mockExtractCRMFields.mock.calls[2][1]).toHaveLength(10);
    expect(mockExtractCRMFields.mock.calls[2][2]).toBe(50);

    // All records should be returned
    expect(result.records).toHaveLength(60);
    expect(result.skipped).toHaveLength(0);
  });

  it('should process a single batch when records ≤ batch size', async () => {
    const records = makeRawRecords(10);

    const result = await processBatches(headers, records, 25);

    expect(mockExtractCRMFields).toHaveBeenCalledTimes(1);
    expect(result.records).toHaveLength(10);
  });

  it('should handle exact batch size boundary', async () => {
    const records = makeRawRecords(25);

    const result = await processBatches(headers, records, 25);

    expect(mockExtractCRMFields).toHaveBeenCalledTimes(1);
    expect(result.records).toHaveLength(25);
  });

  // ── Empty input ───────────────────────────────────────────────────────

  it('should return empty arrays for zero records', async () => {
    const result = await processBatches(headers, [], 25);

    expect(mockExtractCRMFields).not.toHaveBeenCalled();
    expect(result.records).toHaveLength(0);
    expect(result.skipped).toHaveLength(0);
  });

  // ── Aggregation of results ────────────────────────────────────────────

  it('should aggregate records and skipped from multiple batches', async () => {
    // First batch: 2 records, 1 skip
    // Second batch: 1 record, 2 skips
    mockExtractCRMFields
      .mockResolvedValueOnce({
        records: [
          makeCRMRecord({ name: 'A' }),
          makeCRMRecord({ name: 'B' }),
        ],
        skipped: [
          { rowIndex: 2, originalData: { Name: 'C' }, reason: 'No contact' },
        ],
      })
      .mockResolvedValueOnce({
        records: [makeCRMRecord({ name: 'D' })],
        skipped: [
          { rowIndex: 4, originalData: { Name: 'E' }, reason: 'No contact' },
          { rowIndex: 5, originalData: { Name: 'F' }, reason: 'No contact' },
        ],
      });

    const records = makeRawRecords(6);
    const result = await processBatches(headers, records, 3);

    expect(result.records).toHaveLength(3); // A, B, D
    expect(result.skipped).toHaveLength(3); // C, E, F
  });

  // ── Batch failure handling ────────────────────────────────────────────

  it('should skip all records in a batch if AI throws', async () => {
    mockExtractCRMFields
      .mockResolvedValueOnce({
        records: [makeCRMRecord({ name: 'OK' })],
        skipped: [],
      })
      .mockRejectedValueOnce(new Error('API crashed'));

    const records = makeRawRecords(4);
    const result = await processBatches(headers, records, 2);

    // First batch succeeds (1 record)
    expect(result.records).toHaveLength(1);
    // Second batch fails — both rows should be in skipped
    expect(result.skipped).toHaveLength(2);
    expect(result.skipped[0].reason).toContain('API crashed');
    expect(result.skipped[0].rowIndex).toBe(2);
    expect(result.skipped[1].rowIndex).toBe(3);
  });

  // ── Sequential processing ────────────────────────────────────────────

  it('should process batches sequentially (not in parallel)', async () => {
    const callOrder: number[] = [];

    mockExtractCRMFields.mockImplementation(async (_h, _r, startIdx) => {
      callOrder.push(startIdx);
      // Simulate async work
      await new Promise((r) => setTimeout(r, 10));
      return { records: [makeCRMRecord()], skipped: [] };
    });

    const records = makeRawRecords(6);
    await processBatches(headers, records, 2);

    // Start indices should be in order: 0, 2, 4
    expect(callOrder).toEqual([0, 2, 4]);
  });
});
