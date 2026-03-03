// src/validators/job.validator.js
const { body } = require('express-validator');

const JOB_TYPES = ['PDF_GENERATION', 'IMAGE_COMPRESSION', 'REPORT_GENERATION'];

const submitJobValidator = [
  body('type')
    .notEmpty().withMessage('Job type is required')
    .isIn(JOB_TYPES).withMessage(`Job type must be one of: ${JOB_TYPES.join(', ')}`),
  body('payload')
    .notEmpty().withMessage('Job payload is required')
    .isObject().withMessage('Payload must be an object'),
  body('priority')
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage('Priority must be between 0 and 10'),
];

module.exports = { submitJobValidator };
