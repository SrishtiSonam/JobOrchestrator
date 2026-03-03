// src/app.js
// Purpose: Configure and export Express application

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const { apiLimiter } = require('./middleware/rateLimit.middleware');
const { errorHandler, notFound } = require('./middleware/error.middleware');
const authRoutes = require('./routes/auth.routes');
const jobRoutes = require('./routes/job.routes');
const adminRoutes = require('./routes/admin.routes');
const logger = require('./utils/logger');

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Compression ───────────────────────────────────────────────────────────────
app.use(compression());

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── HTTP request logging ──────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
  stream: { write: (msg) => logger.info(msg.trim()) },
}));

// ── Global rate limiting ──────────────────────────────────────────────────────
app.use('/api/', apiLimiter);

// ── Health check (no auth, no rate limit) ─────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-service',
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',  authRoutes);
app.use('/api/jobs',  jobRoutes);
app.use('/api/admin', adminRoutes);

// ── 404 + Global error handler ────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
