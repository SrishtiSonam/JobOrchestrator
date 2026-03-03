// worker.js
// Purpose: Worker service entrypoint — connects to DB/Redis and starts processing

require('dotenv').config();
const connectDB = require('./src/config/db');
const { redisConnection } = require('./src/config/redis');
const { createWorker } = require('./src/workers/job.worker');
const logger = require('./src/utils/logger');

const start = async () => {
  logger.info('🔧 Worker service starting...');

  // 1. Connect to MongoDB
  await connectDB();

  // 2. Start BullMQ worker
  const worker = createWorker();
  logger.info(`✅ Worker listening on queue: "${process.env.QUEUE_NAME || 'job-processing'}" | concurrency: ${process.env.WORKER_CONCURRENCY || 5}`);

  // ── Graceful shutdown ─────────────────────────────────────────────────────
  const shutdown = async (signal) => {
    logger.info(`${signal} received — shutting down worker gracefully`);
    // Close worker — waits for active jobs to complete
    await worker.close();
    await redisConnection.quit();
    const mongoose = require('mongoose');
    await mongoose.connection.close();
    logger.info('Worker shutdown complete');
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('uncaughtException', (err) => {
    logger.error('Worker uncaught exception', { err });
    process.exit(1);
  });
  process.on('unhandledRejection', (reason) => {
    logger.error('Worker unhandled rejection', { reason });
    process.exit(1);
  });
};

start();
