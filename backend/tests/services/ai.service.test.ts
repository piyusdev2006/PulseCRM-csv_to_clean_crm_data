import { describe, it, expect } from 'vitest';
import { extractCRMFields } from '../../src/services/ai.service';

describe('AIService - extractCRMFields', () => {
  it('extracts valid records using fallback when Gemini API key is not set', async () => {
    const headers = ['Full Name', 'Email', 'Phone', 'Company', 'City'];
    const rows = [
      {
        'Full Name': 'John Doe',
        'Email': 'john@example.com',
        'Phone': '+919876543210',
        'Company': 'GrowEasy Inc',
        'City': 'Mumbai',
      },
      {
        'Full Name': 'Invalid Lead',
        'Email': '',
        'Phone': '',
        'Company': 'No Contact Co',
        'City': 'Delhi',
      },
    ];

    const result = await extractCRMFields(headers, rows, 0);

    expect(result.records).toHaveLength(1);
    expect(result.records[0].name).toBe('John Doe');
    expect(result.records[0].email).toBe('john@example.com');
    expect(result.records[0].country_code).toBe('+91');
    expect(result.records[0].mobile_without_country_code).toBe('9876543210');

    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0].reason).toContain('No email');
  });
});
