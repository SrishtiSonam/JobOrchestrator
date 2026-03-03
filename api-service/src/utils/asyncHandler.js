// src/utils/asyncHandler.js
// Purpose: Wraps async route handlers to automatically forward errors to Express error middleware

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { asyncHandler };
