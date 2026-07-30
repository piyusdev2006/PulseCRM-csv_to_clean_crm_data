// ============================================================================
// GrowEasy CRM - Server Entry Point
// ============================================================================

import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root first, then backend/ as fallback
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import config from './config';
import importRoutes from './routes/import.routes';
import { errorHandler } from './middleware/error.middleware';

// ── Create Express app ──────────────────────────────────────────────────────

const app = express();

// ── Security middleware ─────────────────────────────────────────────────────

app.use(helmet());

app.use(
  cors({
    origin: config.FRONTEND_URL,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // 24 hours preflight cache
  })
);

// ── Logging ─────────────────────────────────────────────────────────────────

if (config.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Body parsing ────────────────────────────────────────────────────────────

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate limiting ───────────────────────────────────────────────────────────

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many requests. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
});

app.use(limiter);

// ── Routes ──────────────────────────────────────────────────────────────────

app.use('/api', importRoutes);

// ── Global error handler (MUST be registered last) ──────────────────────────

app.use(errorHandler);

// ── Start server ────────────────────────────────────────────────────────────

app.listen(config.PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════════════╗
  ║   🌱 GrowEasy CSV Importer — Backend                ║
  ╠══════════════════════════════════════════════════════╣
  ║   Port:        ${String(config.PORT).padEnd(37)}║
  ║   Environment: ${config.NODE_ENV.padEnd(37)}║
  ║   Frontend:    ${config.FRONTEND_URL.padEnd(37)}║
  ║   Batch size:  ${String(config.BATCH_SIZE).padEnd(37)}║
  ╚══════════════════════════════════════════════════════╝
  `);
});

export default app;
