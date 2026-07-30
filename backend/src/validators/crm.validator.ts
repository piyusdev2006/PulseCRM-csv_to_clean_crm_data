// ============================================================================
// GrowEasy CRM - Zod Validators for CRM Records
// ============================================================================

import { z } from 'zod';
import type { CRMRecord, CRMStatus, DataSource } from '../types';
import { sanitizeString } from '../utils/helpers';

// ── Enum schemas ────────────────────────────────────────────────────────────

export const CRMStatusSchema = z.enum([
  'GOOD_LEAD_FOLLOW_UP',
  'DID_NOT_CONNECT',
  'BAD_LEAD',
  'SALE_DONE',
]);

export const DataSourceSchema = z.enum([
  'leads_on_demand',
  'meridian_tower',
  'eden_park',
  'varah_swamy',
  'sarjapur_plots',
]);

// ── Full CRM record schema ─────────────────────────────────────────────────

/**
 * Zod schema for a single CRM record.
 * All fields are strings; most are optional (default to '').
 * Post-processing trims whitespace and normalizes empty values.
 */
export const CRMRecordSchema = z
  .object({
    created_at: z.string().optional().default(''),
    name: z.string().optional().default(''),
    email: z.string().optional().default(''),
    country_code: z.string().optional().default(''),
    mobile_without_country_code: z.string().optional().default(''),
    company: z.string().optional().default(''),
    city: z.string().optional().default(''),
    state: z.string().optional().default(''),
    country: z.string().optional().default(''),
    lead_owner: z.string().optional().default(''),
    crm_status: z
      .union([CRMStatusSchema, z.literal('')])
      .optional()
      .default(''),
    crm_note: z.string().optional().default(''),
    data_source: z
      .union([DataSourceSchema, z.literal('')])
      .optional()
      .default(''),
    possession_time: z.string().optional().default(''),
    description: z.string().optional().default(''),
  })
  .transform((raw) => {
    // Post-process: trim every string field, normalise null/undefined → ''
    const cleaned: CRMRecord = {
      created_at: sanitizeString(raw.created_at ?? ''),
      name: sanitizeString(raw.name ?? ''),
      email: sanitizeString(raw.email ?? '').toLowerCase(),
      country_code: sanitizeString(raw.country_code ?? ''),
      mobile_without_country_code: sanitizeString(
        raw.mobile_without_country_code ?? ''
      ),
      company: sanitizeString(raw.company ?? ''),
      city: sanitizeString(raw.city ?? ''),
      state: sanitizeString(raw.state ?? ''),
      country: sanitizeString(raw.country ?? ''),
      lead_owner: sanitizeString(raw.lead_owner ?? ''),
      crm_status: (raw.crm_status as CRMStatus | '') || '',
      crm_note: sanitizeString(raw.crm_note ?? ''),
      data_source: (raw.data_source as DataSource | '') || '',
      possession_time: sanitizeString(raw.possession_time ?? ''),
      description: sanitizeString(raw.description ?? ''),
    };
    return cleaned;
  });

// ── Validation helpers ──────────────────────────────────────────────────────

/**
 * Validate and clean a raw record object.
 * Returns { success: true, data } or { success: false, error }.
 */
export function validateCRMRecord(raw: unknown): {
  success: boolean;
  data?: CRMRecord;
  error?: string;
} {
  const result = CRMRecordSchema.safeParse(raw);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const messages = result.error.errors
    .map((e) => `${e.path.join('.')}: ${e.message}`)
    .join('; ');
  return { success: false, error: messages };
}

/**
 * Check whether a record has at least one usable contact method
 * (email or mobile phone number).
 */
export function validateRecordHasContact(record: CRMRecord): boolean {
  const hasEmail = record.email.trim().length > 0;
  const hasMobile = record.mobile_without_country_code.trim().length > 0;
  return hasEmail || hasMobile;
}
