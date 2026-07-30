// ============================================================================
// GrowEasy CRM - Gemini AI Service
// ============================================================================

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import config from '../config';
import { SYSTEM_PROMPT, buildUserPrompt } from '../prompts/extraction.prompt';
import { validateCRMRecord, validateRecordHasContact } from '../validators/crm.validator';
import type { BatchResult, CRMRecord, SkippedRecord } from '../types';

// ── Singleton model instance ────────────────────────────────────────────────

let model: GenerativeModel | null = null;

function getModel(): GenerativeModel | null {
  if (!model) {
    if (!config.GEMINI_API_KEY) {
      console.warn('⚠️ GEMINI_API_KEY missing - using rule-based AI parser fallback.');
      return null;
    }
    try {
      const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
      model = genAI.getGenerativeModel({
        model: config.GEMINI_MODEL || 'gemini-2.5-flash',
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });
    } catch (err) {
      console.warn('⚠️ Could not initialize Gemini AI model:', err);
      return null;
    }
  }
  return model;
}

// ── Interfaces for AI response parsing ──────────────────────────────────────

interface AIResponse {
  records: Record<string, unknown>[];
  skipped: { rowIndex: number; reason: string }[];
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Send a batch of CSV records to Gemini for CRM field extraction.
 *
 * @param headers          Original CSV column headers
 * @param records          Raw row objects for this batch
 * @param batchStartIndex  Global 0-based index of the first row in this batch
 * @returns BatchResult with validated CRM records and skipped entries
 */
export async function extractCRMFields(
  headers: string[],
  records: Record<string, string>[],
  batchStartIndex: number
): Promise<BatchResult> {
  const userPrompt = buildUserPrompt(headers, records, batchStartIndex);
  const aiModel = getModel();

  if (!aiModel) {
    return ruleBasedFallbackExtract(records, batchStartIndex);
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= config.MAX_RETRIES; attempt++) {
    try {
      console.log(
        `  AI extraction attempt ${attempt}/${config.MAX_RETRIES} ` +
          `(rows ${batchStartIndex}–${batchStartIndex + records.length - 1})`
      );

      const result = await aiModel.generateContent(userPrompt);
      const response = result.response;
      const text = response.text();

      // Parse the JSON response
      const parsed = parseAIResponse(text);

      // Validate each record through Zod and filter by contact info
      return processAIRecords(parsed, records, batchStartIndex);
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (shouldRetry(lastError, attempt)) {
        const serverDelay = getRetryDelayFromError(lastError);
        const delayMs = serverDelay !== null ? serverDelay + 1000 : getBackoffDelay(attempt); // add 1s buffer
        console.warn(
          `  ⚠️  Attempt ${attempt} failed: ${lastError.message}. ` +
            `Retrying in ${delayMs}ms…`
        );
        await sleep(delayMs);
        continue;
      }

      // Non-retryable error — bail out
      break;
    }
  }

  // If AI fails after all retries, fall back to rule-based mapping instead of failing the batch completely
  console.warn(
    `  ⚠️ AI extraction unavailable or failed for batch at index ${batchStartIndex}. Using rule-based fallback.`
  );

  return ruleBasedFallbackExtract(records, batchStartIndex);
}

/**
 * Intelligent rule-based fallback mapper when Gemini API is unavailable or missing key.
 */
function ruleBasedFallbackExtract(
  records: Record<string, string>[],
  batchStartIndex: number
): BatchResult {
  const validRecords: CRMRecord[] = [];
  const skippedRecords: SkippedRecord[] = [];

  records.forEach((row, i) => {
    const keys = Object.keys(row);
    const getVal = (...names: string[]) => {
      for (const name of names) {
        const foundKey = keys.find(
          (k) => k.toLowerCase().trim() === name.toLowerCase().trim()
        ) || keys.find((k) => k.toLowerCase().includes(name.toLowerCase()));
        if (foundKey && row[foundKey]?.trim()) {
          return row[foundKey].trim();
        }
      }
      return '';
    };

    const firstName = getVal('first_name', 'first name', 'given name');
    const lastName = getVal('last_name', 'last name', 'surname');
    let name = getVal('full_name', 'name', 'buyer name', 'person name', 'lead name', 'contact person');
    if (!name && (firstName || lastName)) {
      name = `${firstName} ${lastName}`.trim();
    }

    const email = getVal('email', 'email address', 'email id', 'e-mail');
    let phoneRaw = getVal('phone', 'mobile', 'phone_number', 'contact number', 'mobile no', 'phone number', 'contact');
    
    let country_code = '';
    let mobile_without_country_code = phoneRaw;
    if (phoneRaw.startsWith('+')) {
      const parts = phoneRaw.match(/^(\+\d{1,3})[\s-]?(\d+)$/);
      if (parts) {
        country_code = parts[1];
        mobile_without_country_code = parts[2];
      }
    } else if (phoneRaw.length === 10 && !phoneRaw.startsWith('0')) {
      country_code = '+91'; // default standard
    }

    const company = getVal('company', 'organisation', 'organization', 'org');
    const city = getVal('city', 'town');
    const state = getVal('state', 'province', 'region');
    const country = getVal('country', 'nation');
    const lead_owner = getVal('owner', 'assigned to', 'sales rep', 'agent');
    
    const rawStatus = getVal('status', 'crm_status', 'lead status').toLowerCase();
    let crm_status: CRMRecord['crm_status'] = 'GOOD_LEAD_FOLLOW_UP';
    if (rawStatus.includes('bad') || rawStatus.includes('junk') || rawStatus.includes('invalid')) {
      crm_status = 'BAD_LEAD';
    } else if (rawStatus.includes('not') || rawStatus.includes('unreachable')) {
      crm_status = 'DID_NOT_CONNECT';
    } else if (rawStatus.includes('sale') || rawStatus.includes('won') || rawStatus.includes('closed')) {
      crm_status = 'SALE_DONE';
    }

    const rawSource = getVal('source', 'lead source', 'campaign', 'data_source').toLowerCase();
    let data_source: CRMRecord['data_source'] = 'leads_on_demand';
    if (rawSource.includes('meridian')) data_source = 'meridian_tower';
    else if (rawSource.includes('eden')) data_source = 'eden_park';
    else if (rawSource.includes('varah')) data_source = 'varah_swamy';
    else if (rawSource.includes('sarjapur')) data_source = 'sarjapur_plots';

    const possession_time = getVal('possession', 'possession timeline', 'move in', 'budget', 'timeline');
    const crm_note = getVal('notes', 'remarks', 'comments', 'ad_name', 'ad name');
    const description = getVal('description', 'details');
    const created_at = getVal('date', 'created', 'created_at', 'timestamp');

    const record: CRMRecord = {
      created_at,
      name: name || 'Lead Record',
      email,
      country_code,
      mobile_without_country_code,
      company,
      city,
      state,
      country,
      lead_owner,
      crm_status,
      crm_note,
      data_source,
      possession_time,
      description,
    };

    if (!validateRecordHasContact(record)) {
      skippedRecords.push({
        rowIndex: batchStartIndex + i,
        originalData: row,
        reason: 'No email or mobile number found',
      });
    } else {
      validRecords.push(record);
    }
  });

  return { records: validRecords, skipped: skippedRecords };
}

// ── Internal helpers ────────────────────────────────────────────────────────

/**
 * Parse raw text from the AI into our expected JSON structure.
 */
function parseAIResponse(text: string): AIResponse {
  try {
    const data = JSON.parse(text);

    // Normalise: if the AI returns a bare array, wrap it
    if (Array.isArray(data)) {
      return { records: data, skipped: [] };
    }

    return {
      records: Array.isArray(data.records) ? data.records : [],
      skipped: Array.isArray(data.skipped) ? data.skipped : [],
    };
  } catch {
    throw new Error(`Failed to parse AI response as JSON: ${text.slice(0, 200)}`);
  }
}

/**
 * Run Zod validation on each AI-produced record, check contact info,
 * and separate valid records from skipped ones.
 */
function processAIRecords(
  aiResponse: AIResponse,
  originalRecords: Record<string, string>[],
  batchStartIndex: number
): BatchResult {
  const validRecords: CRMRecord[] = [];
  const skippedRecords: SkippedRecord[] = [];

  // Process validated records
  for (let i = 0; i < aiResponse.records.length; i++) {
    const raw = aiResponse.records[i];
    const validation = validateCRMRecord(raw);

    if (!validation.success || !validation.data) {
      skippedRecords.push({
        rowIndex: batchStartIndex + i,
        originalData: originalRecords[i] || {},
        reason: `Validation failed: ${validation.error}`,
      });
      continue;
    }

    // Ensure record has at least one contact method
    if (!validateRecordHasContact(validation.data)) {
      skippedRecords.push({
        rowIndex: batchStartIndex + i,
        originalData: originalRecords[i] || {},
        reason: 'No email or phone number found',
      });
      continue;
    }

    validRecords.push(validation.data);
  }

  // Include AI-reported skipped records (adjust rowIndex to global)
  for (const skip of aiResponse.skipped) {
    const globalIndex = batchStartIndex + skip.rowIndex;
    skippedRecords.push({
      rowIndex: globalIndex,
      originalData: originalRecords[skip.rowIndex] || {},
      reason: skip.reason,
    });
  }

  return { records: validRecords, skipped: skippedRecords };
}

/**
 * Decide whether to retry based on error type and attempt count.
 */
function shouldRetry(err: Error, attempt: number): boolean {
  if (attempt >= config.MAX_RETRIES) return false;

  const message = err.message.toLowerCase();

  // Retry on rate limits (429)
  if (message.includes('429') || message.includes('rate limit') || message.includes('quota')) {
    return true;
  }

  // Retry on server errors (5xx)
  if (message.includes('500') || message.includes('502') || message.includes('503') || message.includes('504')) {
    return true;
  }

  // Retry on network errors
  if (message.includes('econnreset') || message.includes('etimedout') || message.includes('fetch failed')) {
    return true;
  }

  // Retry on JSON parse failures (AI may return bad JSON occasionally)
  if (message.includes('failed to parse')) {
    return true;
  }

  return false;
}

/**
 * Parse retry delay from error messages if specified by Google's API (e.g. 429 rate limit delay)
 */
function getRetryDelayFromError(err: Error): number | null {
  const message = err.message;
  
  // Look for "Please retry in 20.418082147s"
  const pleaseRetryMatch = message.match(/Please retry in ([\d.]+)s/i);
  if (pleaseRetryMatch && pleaseRetryMatch[1]) {
    const seconds = parseFloat(pleaseRetryMatch[1]);
    if (!isNaN(seconds)) {
      return Math.ceil(seconds) * 1000;
    }
  }

  // Look for "retryDelay":"20s"
  const retryDelayMatch = message.match(/retryDelay":"(\d+)s"/i);
  if (retryDelayMatch && retryDelayMatch[1]) {
    const seconds = parseInt(retryDelayMatch[1], 10);
    if (!isNaN(seconds)) {
      return seconds * 1000;
    }
  }

  return null;
}

/**
 * Exponential backoff delay: 1s, 3s, 9s, …
 */
function getBackoffDelay(attempt: number): number {
  return Math.pow(3, attempt - 1) * 1000;
}

/**
 * Simple sleep helper.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
