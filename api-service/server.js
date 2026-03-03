// server.js
// Purpose: HTTP server entrypoint — bootstraps DB, Socket.io, Queue events, and starts listening

require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/sockets/socket');
const { initQueueEvents, closeQueueEvents } = require('./src/queues/queueEvents');
const { closeQueue } = require('./src/queues/jobQueue');
const { redisConnection } = require('./src/config/redis');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

const start = async () => {
  // 1. Connect to MongoDB
  await connectDB();

  // 2. Create HTTP server from Express app
  const httpServer = http.createServer(app);

  // 3. Attach Socket.io
  const io = initSocket(httpServer);

  // 4. Listen for BullMQ lifecycle events → emit to Socket.io
  initQueueEvents(io);

  // 5. Start HTTP server
  httpServer.listen(PORT, () => {
    logger.info(`🚀 API service running on port ${PORT} [${process.env.NODE_ENV}]`);
  });

  // ── Graceful shutdown ─────────────────────────────────────────────────────
  const shutdown = async (signal) => {
    logger.info(`${signal} received — graceful shutdown started`);
    httpServer.close(async () => {
      try {
        await closeQueueEvents();
        await closeQueue();
        await redisConnection.quit();
        const mongoose = require('mongoose');
        await mongoose.connection.close();
        logger.info('All connections closed. Exiting.');
        process.exit(0);
      } catch (err) {
        logger.error('Error during shutdown', { err });
        process.exit(1);
      }
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', { err });
    process.exit(1);
  });
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', { reason });
    process.exit(1);
  });
};

start();
