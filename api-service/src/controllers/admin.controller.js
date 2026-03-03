// src/controllers/admin.controller.js
// Purpose: HTTP handlers for admin-only endpoints

const adminService = require('../services/admin.service');
const jobService = require('../services/job.service');
const { asyncHandler } = require('../utils/asyncHandler');

// GET /api/admin/jobs
const getAllJobs = asyncHandler(async (req, res) => {
  const result = await adminService.getAllJobs(req.query);
  res.json({ success: true, ...result });
});

// GET /api/admin/stats
const getStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getSystemStats();
  res.json({ success: true, data: stats });
});

// POST /api/admin/jobs/:id/retry
const retryJob = asyncHandler(async (req, res) => {
  const job = await jobService.retryJob(req.params.id);
  res.json({ success: true, message: 'Job requeued for retry', data: job });
});

module.exports = { getAllJobs, getStats, retryJob };
