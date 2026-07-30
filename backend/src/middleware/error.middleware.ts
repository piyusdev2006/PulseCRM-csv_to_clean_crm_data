// ============================================================================
// GrowEasy CRM - Global Error Handler Middleware
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';
import { ZodError } from 'zod';
import config from '../config';
import { formatFileSize } from '../utils/helpers';

/**
 * Structured error response body.
 */
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}

/**
 * Global Express error handler.
 * Must be registered AFTER all routes. The 4-arg signature is required
 * so Express recognises it as an error handler.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // ── Multer errors ──────────────────────────────────────────────────────
  if (err instanceof MulterError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        message: getMulterMessage(err),
        code: `UPLOAD_${err.code}`,
      },
    };
    res.status(400).json(response);
    return;
  }

  // ── Zod validation errors ─────────────────────────────────────────────
  if (err instanceof ZodError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    };
    res.status(400).json(response);
    return;
  }

  // ── Multer file-filter errors (thrown as plain Error) ──────────────────
  if (
    err.message &&
    (err.message.includes('Invalid file extension') ||
      err.message.includes('Invalid MIME type') ||
      err.message.includes('Only CSV files'))
  ) {
    const response: ErrorResponse = {
      success: false,
      error: {
        message: err.message,
        code: 'UPLOAD_INVALID_FILE_TYPE',
      },
    };
    res.status(400).json(response);
    return;
  }

  // ── Generic / unexpected errors ────────────────────────────────────────
  console.error('Unhandled error:', err);

  const response: ErrorResponse = {
    success: false,
    error: {
      message:
        config.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : err.message || 'Internal server error',
      code: 'INTERNAL_ERROR',
      ...(config.NODE_ENV !== 'production' && {
        details: err.stack,
      }),
    },
  };
  res.status(500).json(response);
}

/**
 * Map MulterError codes to user-friendly messages.
 */
function getMulterMessage(err: MulterError): string {
  switch (err.code) {
    case 'LIMIT_FILE_SIZE':
      return `File is too large. Maximum size is ${formatFileSize(config.MAX_FILE_SIZE)}.`;
    case 'LIMIT_FILE_COUNT':
      return 'Too many files. Only one file can be uploaded at a time.';
    case 'LIMIT_UNEXPECTED_FILE':
      return `Unexpected field name "${err.field}". Use "file" as the field name.`;
    default:
      return `Upload error: ${err.message}`;
  }
}
