// src/middleware/validate.middleware.js
// Purpose: Run express-validator chains and return 400 on violations

const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (validations) => async (req, res, next) => {
  // Run all validation chains
  await Promise.all(validations.map((v) => v.run(req)));

  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const formatted = errors.array().map((e) => ({
    field: e.path,
    message: e.msg,
  }));

  next(ApiError.badRequest('Validation failed', formatted));
};

module.exports = { validate };
