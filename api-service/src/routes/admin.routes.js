// src/routes/admin.routes.js
const router = require('express').Router();
const { getAllJobs, getStats, retryJob } = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.use(authenticate, requireRole('admin')); // All admin routes need admin role

router.get('/jobs',              getAllJobs);
router.get('/stats',             getStats);
router.post('/jobs/:id/retry',   retryJob);

module.exports = router;
