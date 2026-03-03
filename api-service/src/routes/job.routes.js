// src/routes/job.routes.js
const router = require('express').Router();
const { submitJob, listJobs, getJob, cancelJob } = require('../controllers/job.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { jobSubmitLimiter } = require('../middleware/rateLimit.middleware');
const { validate } = require('../middleware/validate.middleware');
const { submitJobValidator } = require('../validators/job.validator');

router.use(authenticate); // All job routes require auth

router.post('/',     jobSubmitLimiter, validate(submitJobValidator), submitJob);
router.get('/',      listJobs);
router.get('/:id',   getJob);
router.delete('/:id', cancelJob);

module.exports = router;
