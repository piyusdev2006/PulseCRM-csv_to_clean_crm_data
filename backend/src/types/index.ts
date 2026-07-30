// ============================================================================
// GrowEasy CRM - Shared Types
// ============================================================================

/**
 * Allowed CRM status values for lead qualification.
 */
export type CRMStatus =
  | 'GOOD_LEAD_FOLLOW_UP'
  | 'DID_NOT_CONNECT'
  | 'BAD_LEAD'
  | 'SALE_DONE';

/**
 * Allowed data source identifiers.
 */
export type DataSource =
  | 'leads_on_demand'
  | 'meridian_tower'
  | 'eden_park'
  | 'varah_swamy'
  | 'sarjapur_plots';

/**
 * A single CRM record with all 15 required fields.
 */
export interface CRMRecord {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: CRMStatus | '';
  crm_note: string;
  data_source: DataSource | '';
  possession_time: string;
  description: string;
}

/**
 * Final import result returned to the client.
 */
export interface ImportResult {
  success: boolean;
  data: {
    records: CRMRecord[];
    skipped: SkippedRecord[];
    summary: ImportSummary;
  };
}

/**
 * A record that was skipped during import, with reason.
 */
export interface SkippedRecord {
  rowIndex: number;
  originalData: Record<string, string>;
  reason: string;
}

/**
 * Summary statistics for the import operation.
 */
export interface ImportSummary {
  totalRows: number;
  imported: number;
  skipped: number;
  processingTimeMs: number;
}

/**
 * Result from processing a single batch of records through the AI.
 */
export interface BatchResult {
  records: CRMRecord[];
  skipped: SkippedRecord[];
}
