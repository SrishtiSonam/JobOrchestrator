// src/queues/queueEvents.js
// Purpose: Listen to BullMQ lifecycle events and emit real-time Socket.io notifications to clients

const { QueueEvents } = require('bullmq');
const { redisConnection } = require('../config/redis');
const logger = require('../utils/logger');
const Job = require('../models/Job.model');

let queueEventsInstance;

const initQueueEvents = (io) => {
  queueEventsInstance = new QueueEvents(
    process.env.QUEUE_NAME || 'job-processing',
    { connection: redisConnection }
  );

  // ── Job completed ─────────────────────────────────────────────────────────
  queueEventsInstance.on('completed', async ({ jobId, returnvalue }) => {
    try {
      logger.info(`QueueEvent: Job ${jobId} completed`);
      const data = JSON.parse(returnvalue || '{}');
      const { mongoJobId, userId, result } = data;

      // Emit to the user's private room
      if (userId) {
        io.to(`user:${userId}`).emit('job:completed', {
          jobId,
          mongoJobId,
          result,
          completedAt: new Date(),
        });
      }

      // Broadcast to admins
      io.to('admins').emit('admin:job:completed', { jobId, mongoJobId, userId });
    } catch (err) {
      logger.error(`QueueEvent completed handler error: ${err.message}`);
    }
  });

  // ── Job failed ────────────────────────────────────────────────────────────
  queueEventsInstance.on('failed', async ({ jobId, failedReason }) => {
    try {
      logger.error(`QueueEvent: Job ${jobId} failed — ${failedReason}`);

      // Look up the job to get userId for socket routing
      const jobRecord = await Job.findOne({ bullJobId: jobId }).select('userId');
      if (jobRecord) {
        io.to(`user:${jobRecord.userId.toString()}`).emit('job:failed', {
          jobId,
          mongoJobId: jobRecord._id,
          reason: failedReason,
          failedAt: new Date(),
        });
      }

      io.to('admins').emit('admin:job:failed', { jobId, failedReason });
    } catch (err) {
      logger.error(`QueueEvent failed handler error: ${err.message}`);
    }
  });

  // ── Job progress ──────────────────────────────────────────────────────────
  queueEventsInstance.on('progress', async ({ jobId, data }) => {
    try {
      const jobRecord = await Job.findOne({ bullJobId: jobId }).select('userId');
      if (jobRecord) {
        io.to(`user:${jobRecord.userId.toString()}`).emit('job:progress', {
          jobId,
          mongoJobId: jobRecord._id,
          progress: data,
        });
      }
    } catch (err) {
      logger.error(`QueueEvent progress handler error: ${err.message}`);
    }
  });

  // ── Job active (picked up by worker) ──────────────────────────────────────
  queueEventsInstance.on('active', async ({ jobId }) => {
    try {
      const jobRecord = await Job.findOne({ bullJobId: jobId }).select('userId');
      if (jobRecord) {
        io.to(`user:${jobRecord.userId.toString()}`).emit('job:processing', {
          jobId,
          mongoJobId: jobRecord._id,
          startedAt: new Date(),
        });
      }
    } catch (err) {
      logger.error(`QueueEvent active handler error: ${err.message}`);
    }
  });

  logger.info('Queue events listener initialized');
  return queueEventsInstance;
};

const closeQueueEvents = async () => {
  if (queueEventsInstance) {
    await queueEventsInstance.close();
    logger.info('Queue events closed');
  }
};

module.exports = { initQueueEvents, closeQueueEvents };
