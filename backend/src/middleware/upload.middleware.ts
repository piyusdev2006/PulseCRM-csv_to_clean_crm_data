// ============================================================================
// GrowEasy CRM - Multer Upload Middleware
// ============================================================================

import multer from 'multer';
import path from 'path';
import config from '../config';

/**
 * Allowed MIME types for CSV uploads.
 */
const ALLOWED_MIME_TYPES = [
  'text/csv',
  'application/csv',
  'text/plain',                     // Some systems serve CSV as text/plain
  'application/vnd.ms-excel',       // Windows sometimes assigns this to .csv
];

/**
 * Allowed file extensions.
 */
const ALLOWED_EXTENSIONS = ['.csv'];

/**
 * Multer storage configuration using memory storage (no disk writes).
 */
const storage = multer.memoryStorage();

/**
 * File filter that validates both MIME type and file extension.
 */
const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeOk = ALLOWED_MIME_TYPES.includes(file.mimetype);
  const extOk = ALLOWED_EXTENSIONS.includes(ext);

  if (mimeOk && extOk) {
    cb(null, true);
  } else {
    const reason = !extOk
      ? `Invalid file extension "${ext}". Only .csv files are accepted.`
      : `Invalid MIME type "${file.mimetype}". Only CSV files are accepted.`;
    cb(new Error(reason));
  }
};

/**
 * Configured multer instance for single CSV file uploads.
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.MAX_FILE_SIZE,
    files: 1,
  },
});

export default upload;
