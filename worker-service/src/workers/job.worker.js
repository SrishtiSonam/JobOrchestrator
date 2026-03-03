// src/workers/job.worker.js
// Purpose: BullMQ Worker — dequeues jobs from Redis and routes to processors
// Retry config: 3 attempts with exponential backoff (set in api-service's jobQueue.js)

const { Worker } = require('bullmq');
const { redisConnection } = require('../config/redis');
const { updateJobStatus } = require('../services/jobUpdate.service');
const pdfProcessor = require('../processors/pdf.processor');
const imageProcessor = require('../processors/image.processor');
const reportProcessor = require('../processors/report.processor');
const logger = require('../utils/logger');

// ── Processor registry ────────────────────────────────────────────────────────
const PROCESSORS = {
  PDF_GENERATION:    pdfProcessor,
  IMAGE_COMPRESSION: imageProcessor,
  REPORT_GENERATION: reportProcessor,
};

// ── Main job handler ──────────────────────────────────────────────────────────
const processJob = async (job) => {
  const { mongoJobId, userId, payload } = job.data;
  const startedAt = new Date();

  logger.info(`Processing job ${job.id} [${job.name}]`, { mongoJobId, userId, attempt: job.attemptsMade + 1 });

  // 1. Mark as 'processing' in MongoDB
  await updateJobStatus(mongoJobId, 'processing', { startedAt, bullJobId: job.id });

  // 2. Get the correct processor
  const processor = PROCESSORS[job.name];
  if (!processor) {
    throw new Error(`No processor registered for job type: ${job.name}`);
  }

  // 3. Execute processor (throws on failure → BullMQ triggers retry)
  const result = await processor.execute(payload, job);

  // 4. Mark as 'completed' in MongoDB
  const completedAt = new Date();
  await updateJobStatus(mongoJobId, 'completed', {
    result,
    completedAt,
    retryCount: job.attemptsMade,
  });

  // 5. Return value is captured by QueueEvents 'completed' listener in api-service
  return JSON.stringify({ mongoJobId, userId, result });
};

// ── Worker instance ───────────────────────────────────────────────────────────
const createWorker = () => {
  const worker = new Worker(
    process.env.QUEUE_NAME || 'job-processing',
    processJob,
    {
      connection: redisConnection,
      concurrency: Number(process.env.WORKER_CONCURRENCY) || 5,
      // Drain delay: wait 5s for new jobs before shutting down gracefully
      drainDelay: 5,
    }
  );

  // ── Event: failed attempt (not necessarily final) ─────────────────────────
  worker.on('failed', async (job, err) => {
    logger.error(`Job ${job.id} attempt ${job.attemptsMade}/${job.opts.attempts} failed: ${err.message}`);

    // Only mark as permanently failed after all retries exhausted
    if (job.attemptsMade >= job.opts.attempts) {
      await updateJobStatus(job.data.mongoJobId, 'failed', {
        errorMessage: err.message,
        retryCount: job.attemptsMade,
        completedAt: new Date(),
      });
      logger.error(`Job ${job.id} permanently failed after ${job.attemptsMade} attempts`);
    } else {
      // Update retry count in DB but keep status as 'pending' for next attempt
      await updateJobStatus(job.data.mongoJobId, 'pending', {
        retryCount: job.attemptsMade,
        errorMessage: `Attempt ${job.attemptsMade} failed: ${err.message}`,
      });
      logger.warn(`Job ${job.id} will retry (attempt ${job.attemptsMade + 1}/${job.opts.attempts})`);
    }
  });

  worker.on('completed', (job) => {
    logger.info(`Job ${job.id} [${job.name}] completed successfully`);
  });

  worker.on('error', (err) => {
    logger.error(`Worker error: ${err.message}`, { stack: err.stack });
  });

  worker.on('stalled', (jobId) => {
    logger.warn(`Job ${jobId} stalled — will be retried`);
  });

  return worker;
};

module.exports = { createWorker };
