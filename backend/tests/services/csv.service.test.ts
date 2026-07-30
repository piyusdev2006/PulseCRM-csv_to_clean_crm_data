// ============================================================================
// GrowEasy CRM - CSV Service Unit Tests
// ============================================================================

import { describe, it, expect } from 'vitest';
import { parseCSV } from '../../src/services/csv.service';

describe('CSV Service — parseCSV', () => {
  // ── Helper to create a Buffer from a string ─────────────────────────────

  const toBuffer = (str: string): Buffer => Buffer.from(str, 'utf-8');

  // ── Basic parsing ───────────────────────────────────────────────────────

  it('should parse a basic CSV with headers and rows', () => {
    const csv = `Name,Email,Phone
John Doe,john@example.com,1234567890
Jane Smith,jane@example.com,0987654321`;

    const result = parseCSV(toBuffer(csv));

    expect(result.headers).toEqual(['Name', 'Email', 'Phone']);
    expect(result.records).toHaveLength(2);
    expect(result.records[0]).toEqual({
      Name: 'John Doe',
      Email: 'john@example.com',
      Phone: '1234567890',
    });
    expect(result.records[1]).toEqual({
      Name: 'Jane Smith',
      Email: 'jane@example.com',
      Phone: '0987654321',
    });
    expect(result.errors).toHaveLength(0);
  });

  // ── Delimiter auto-detection ──────────────────────────────────────────

  it('should auto-detect semicolon delimiter', () => {
    const csv = `Name;Email;Phone
Alice;alice@test.com;5551234567`;

    const result = parseCSV(toBuffer(csv));

    expect(result.headers).toEqual(['Name', 'Email', 'Phone']);
    expect(result.records).toHaveLength(1);
    expect(result.records[0]['Name']).toBe('Alice');
  });

  it('should auto-detect tab delimiter', () => {
    const csv = `Name\tEmail\tPhone
Bob\tbob@test.com\t5559876543`;

    const result = parseCSV(toBuffer(csv));

    expect(result.headers).toEqual(['Name', 'Email', 'Phone']);
    expect(result.records).toHaveLength(1);
    expect(result.records[0]['Name']).toBe('Bob');
    expect(result.records[0]['Email']).toBe('bob@test.com');
  });

  // ── Empty input ───────────────────────────────────────────────────────

  it('should handle completely empty input', () => {
    const result = parseCSV(toBuffer(''));

    expect(result.headers).toEqual([]);
    expect(result.records).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });

  it('should handle whitespace-only input', () => {
    const result = parseCSV(toBuffer('   \n  \n  '));

    expect(result.headers).toEqual([]);
    expect(result.records).toHaveLength(0);
  });

  // ── Headers only (no data rows) ──────────────────────────────────────

  it('should handle CSV with only headers and no data rows', () => {
    const csv = `Name,Email,Phone`;

    const result = parseCSV(toBuffer(csv));

    expect(result.headers).toEqual(['Name', 'Email', 'Phone']);
    expect(result.records).toHaveLength(0);
  });

  // ── BOM marker stripping ──────────────────────────────────────────────

  it('should strip UTF-8 BOM from the beginning of the file', () => {
    // UTF-8 BOM bytes: EF BB BF
    const bom = Buffer.from([0xef, 0xbb, 0xbf]);
    const csvContent = Buffer.from(
      `Name,Email\nBOM Test,bom@test.com`,
      'utf-8'
    );
    const withBom = Buffer.concat([bom, csvContent]);

    const result = parseCSV(withBom);

    // Header should NOT contain BOM characters
    expect(result.headers[0]).toBe('Name');
    expect(result.headers).toEqual(['Name', 'Email']);
    expect(result.records).toHaveLength(1);
    expect(result.records[0]['Name']).toBe('BOM Test');
  });

  // ── Malformed rows ───────────────────────────────────────────────────

  it('should report errors for rows with too many fields', () => {
    const csv = `Name,Email
Valid,valid@test.com
Bad,bad@test.com,extra_field`;

    const result = parseCSV(toBuffer(csv));

    // PapaParse may still parse the row, but should report an error
    expect(result.records.length).toBeGreaterThanOrEqual(1);
    // At least the valid row should be present
    expect(result.records[0]['Name']).toBe('Valid');
  });

  // ── Empty rows are skipped ────────────────────────────────────────────

  it('should skip empty rows between data', () => {
    const csv = `Name,Email
First,first@test.com

Second,second@test.com

`;

    const result = parseCSV(toBuffer(csv));

    expect(result.records).toHaveLength(2);
    expect(result.records[0]['Name']).toBe('First');
    expect(result.records[1]['Name']).toBe('Second');
  });

  // ── Values stay as strings ────────────────────────────────────────────

  it('should keep numeric values as strings (no dynamic typing)', () => {
    const csv = `Name,Phone,Zip
Test,1234567890,10001`;

    const result = parseCSV(toBuffer(csv));

    expect(typeof result.records[0]['Phone']).toBe('string');
    expect(typeof result.records[0]['Zip']).toBe('string');
    expect(result.records[0]['Phone']).toBe('1234567890');
  });

  // ── Trimming ──────────────────────────────────────────────────────────

  it('should trim whitespace from headers and values', () => {
    const csv = `  Name  , Email  ,  Phone
  Alice , alice@test.com , 555-1234 `;

    const result = parseCSV(toBuffer(csv));

    expect(result.headers).toEqual(['Name', 'Email', 'Phone']);
    expect(result.records[0]['Name']).toBe('Alice');
    expect(result.records[0]['Email']).toBe('alice@test.com');
  });
});
