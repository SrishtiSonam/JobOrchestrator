// src/controllers/job.controller.js
// Purpose: HTTP handlers for job endpoints

const jobService = require('../services/job.service');
const { asyncHandler } = require('../utils/asyncHandler');

// POST /api/jobs
const submitJob = asyncHandler(async (req, res) => {
  const { type, payload, priority } = req.body;
  const job = await jobService.submitJob(req.user._id, type, payload, priority);
  res.status(202).json({ success: true, message: 'Job submitted successfully', data: job });
});

// GET /api/jobs
const listJobs = asyncHandler(async (req, res) => {
  const result = await jobService.listUserJobs(req.user._id, req.query);
  res.json({ success: true, ...result });
});

// GET /api/jobs/:id
const getJob = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const job = await jobService.getJobById(req.params.id, req.user._id, isAdmin);
  res.json({ success: true, data: job });
});

// DELETE /api/jobs/:id
const cancelJob = asyncHandler(async (req, res) => {
  const job = await jobService.cancelJob(req.params.id, req.user._id);
  res.json({ success: true, message: 'Job cancelled', data: job });
});

module.exports = { submitJob, listJobs, getJob, cancelJob };
