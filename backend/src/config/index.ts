// ============================================================================
// GrowEasy CRM - Centralized Configuration
// ============================================================================

import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root (one level above backend/) first,
// then from backend/ as fallback. process.cwd() = backend/ when running npm scripts.
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Application configuration derived from environment variables.
 * Throws at startup if required variables are missing in production.
 */
export interface AppConfig {
  PORT: number;
  GEMINI_API_KEY: string;
  GEMINI_MODEL: string;
  FRONTEND_URL: string;
  NODE_ENV: string;
  MAX_FILE_SIZE: number;
  BATCH_SIZE: number;
  MAX_RETRIES: number;
}

function loadConfig(): AppConfig {
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
  const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  // Require GEMINI_API_KEY in production; warn in development
  if (!GEMINI_API_KEY && NODE_ENV === 'production') {
    throw new Error(
      'GEMINI_API_KEY environment variable is required in production. ' +
        'Set it in your .env file or environment.'
    );
  }

  if (!GEMINI_API_KEY && NODE_ENV !== 'test') {
    console.warn(
      '⚠️  GEMINI_API_KEY is not set. AI extraction will fail at runtime.'
    );
  }

  return {
    PORT: parseInt(process.env.PORT || '3001', 10),
    GEMINI_API_KEY,
    GEMINI_MODEL,
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    NODE_ENV,
    MAX_FILE_SIZE: parseInt(
      process.env.MAX_FILE_SIZE || String(10 * 1024 * 1024), // 10 MB
      10
    ),
    BATCH_SIZE: parseInt(process.env.BATCH_SIZE || '25', 10),
    MAX_RETRIES: parseInt(process.env.MAX_RETRIES || '3', 10),
  };
}

const config = loadConfig();
export default config;
