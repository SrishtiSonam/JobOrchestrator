// src/services/job.service.js
// Purpose: Job business logic — create, query, and manage job records + queue interaction

const Job = require('../models/Job.model');
const { enqueueJob } = require('../queues/jobQueue');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

// ── Submit a new job ──────────────────────────────────────────────────────────
const submitJob = async (userId, type, payload, priority = 0) => {
  // 1. Create MongoDB record first (status: pending)
  const job = await Job.create({ userId, type, payload, priority });

  // 2. Enqueue in BullMQ — pass mongoJobId so worker can update DB
  const bullJob = await enqueueJob(
    type,
    { mongoJobId: job._id.toString(), userId: userId.toString(), payload },
    { priority }
  );

  // 3. Store BullMQ job ID reference in MongoDB
  job.bullJobId = bullJob.id;
  await job.save();

  logger.info(`Job submitted: ${job._id} [${type}] by user ${userId}`);
  return job;
};

// ── Get single job (with ownership check) ─────────────────────────────────────
const getJobById = async (jobId, userId, isAdmin = false) => {
  const query = isAdmin ? { _id: jobId } : { _id: jobId, userId };
  const job = await Job.findOne(query).populate('userId', 'name email');
  if (!job) throw ApiError.notFound('Job not found');
  return job;
};

// ── List jobs with pagination and filtering ───────────────────────────────────
const listUserJobs = async (userId, { page = 1, limit = 20, status, type } = {}) => {
  const filter = { userId };
  if (status) filter.status = status;
  if (type) filter.type = type;

  const skip = (page - 1) * limit;
  const [jobs, total] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Job.countDocuments(filter),
  ]);

  return {
    jobs,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

// ── Cancel a pending job ──────────────────────────────────────────────────────
const cancelJob = async (jobId, userId) => {
  const job = await Job.findOne({ _id: jobId, userId });
  if (!job) throw ApiError.notFound('Job not found');
  if (job.status !== 'pending') {
    throw ApiError.badRequest(`Cannot cancel a job with status: ${job.status}`);
  }

  // Remove from BullMQ queue
  const { jobQueue } = require('../queues/jobQueue');
  const bullJob = await jobQueue.getJob(job.bullJobId);
  if (bullJob) await bullJob.remove();

  job.status = 'cancelled';
  await job.save();

  logger.info(`Job cancelled: ${jobId} by user ${userId}`);
  return job;
};

// ── Retry a failed job (admin) ────────────────────────────────────────────────
const retryJob = async (jobId) => {
  const job = await Job.findById(jobId);
  if (!job) throw ApiError.notFound('Job not found');
  if (job.status !== 'failed') throw ApiError.badRequest('Only failed jobs can be retried');

  job.status = 'pending';
  job.errorMessage = null;
  job.retryCount = 0;
  await job.save();

  const bullJob = await enqueueJob(job.type, {
    mongoJobId: job._id.toString(),
    userId: job.userId.toString(),
    payload: job.payload,
  });

  job.bullJobId = bullJob.id;
  await job.save();

  logger.info(`Job manually retried: ${jobId}`);
  return job;
};

module.exports = { submitJob, getJobById, listUserJobs, cancelJob, retryJob };
