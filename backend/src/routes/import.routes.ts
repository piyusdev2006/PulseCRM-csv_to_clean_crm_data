// ============================================================================
// GrowEasy CRM - Import Routes
// ============================================================================

import { Router } from 'express';
import upload from '../middleware/upload.middleware';
import { handleImport } from '../controllers/import.controller';

const router = Router();

/**
 * POST /api/import
 * Upload a CSV file and import records into CRM format.
 */
router.post('/import', upload.single('file'), handleImport);

/**
 * GET /api/health
 * Simple health check endpoint.
 */
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;
