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
  crm_status: string;
  crm_note: string;
  data_source: string;
  possession_time: string;
  description: string;
}

export interface SkippedRecord {
  rowIndex: number;
  originalData: Record<string, string>;
  reason: string;
}

export interface ImportSummary {
  totalRows: number;
  imported: number;
  skipped: number;
  processingTimeMs: number;
}

export interface ImportResult {
  success: boolean;
  data: {
    records: CRMRecord[];
    skipped: SkippedRecord[];
    summary: ImportSummary;
  };
}

export interface CSVPreviewData {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

export type ImportStep = 'upload' | 'preview' | 'processing' | 'results';
