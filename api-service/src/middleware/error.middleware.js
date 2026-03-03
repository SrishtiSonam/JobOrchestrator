// src/middleware/error.middleware.js
// Purpose: Global Express error handler — formats and logs all errors uniformly

const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log every error with request context
  logger.error(err.message, {
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    userId: req.user?._id,
    ip: req.ip,
  });

  // ── Mongoose CastError (invalid ObjectId) ─────────────────────────────────
  if (err.name === 'CastError') {
    error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
  }

  // ── Mongoose ValidationError ─────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    error = ApiError.badRequest('Validation failed', errors);
  }

  // ── Mongoose Duplicate Key (code 11000) ───────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = ApiError.conflict(`${field} already exists`);
  }

  // ── JWT errors (caught by verifyToken utility, but just in case) ──────────
  if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid token');
  }
  if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Token expired');
  }

  // ── Build response ────────────────────────────────────────────────────────
  const statusCode = error.statusCode || 500;
  const message =
    error.isOperational
      ? error.message
      : process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

// ── 404 handler (mount before errorHandler) ───────────────────────────────────
const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

module.exports = { errorHandler, notFound };
