// src/middleware/rateLimit.middleware.js
// Purpose: Multi-tier rate limiting backed by Redis for distributed deployments

const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { redisConnection } = require('../config/redis');

const makeStore = (prefix) =>
  new RedisStore({
    sendCommand: (...args) => redisConnection.call(...args),
    prefix: `rl:${prefix}:`,
  });

// ── General API limiter: 100 req / 15 min ────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore('api'),
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

// ── Auth routes: 10 req / 15 min (brute-force protection) ───────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore('auth'),
  message: { success: false, message: 'Too many login attempts. Please wait 15 minutes.' },
  skipSuccessfulRequests: true, // Don't count successful logins
});

// ── Job submission: 5 jobs / min per user ────────────────────────────────────
const jobSubmitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore('job-submit'),
  keyGenerator: (req) => req.user?._id?.toString() || req.ip, // Per-user limit
  message: { success: false, message: 'Job submission limit reached. Max 5 jobs per minute.' },
});

module.exports = { apiLimiter, authLimiter, jobSubmitLimiter };
