// src/queues/jobQueue.js
// Purpose: BullMQ Queue singleton — used by api-service to enqueue jobs into Redis

const { Queue } = require('bullmq');
const { redisConnection } = require('../config/redis');
const logger = require('../utils/logger');

const DEFAULT_JOB_OPTIONS = {
  attempts: 3, // Retry up to 3 times on failure
  backoff: {
    type: 'exponential', // 2s -> 4s -> 8s
    delay: 2000,
  },
  removeOnComplete: {
    age: 24 * 3600,  // Keep completed jobs in Redis for 24 hours
    count: 1000,
  },
  removeOnFail: {
    age: 7 * 24 * 3600, // Keep failed jobs for 7 days for debugging
  },
};

const jobQueue = new Queue(process.env.QUEUE_NAME || 'job-processing', {
  connection: redisConnection,
  defaultJobOptions: DEFAULT_JOB_OPTIONS,
});

// ── Enqueue a job ─────────────────────────────────────────────────────────────
const enqueueJob = async (jobType, data, options = {}) => {
  const mergedOptions = { ...DEFAULT_JOB_OPTIONS, ...options };
  const job = await jobQueue.add(jobType, data, mergedOptions);
  logger.info(`Job enqueued: ${job.id} [${jobType}]`, { jobId: job.id, userId: data.userId });
  return job;
};

// ── Queue health metrics ──────────────────────────────────────────────────────
const getQueueStats = async () => {
  const counts = await jobQueue.getJobCounts(
    'waiting', 'active', 'completed', 'failed', 'delayed', 'paused'
  );
  return counts;
};

// ── Pause / resume queue (admin) ──────────────────────────────────────────────
const pauseQueue = async () => jobQueue.pause();
const resumeQueue = async () => jobQueue.resume();

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const closeQueue = async () => {
  await jobQueue.close();
  logger.info('Job queue closed');
};

module.exports = { jobQueue, enqueueJob, getQueueStats, pauseQueue, resumeQueue, closeQueue };
