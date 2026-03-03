// src/config/redis.js
// Purpose: Shared ioredis connection for BullMQ Queue, QueueEvents, and rate limiting

const { Redis } = require('ioredis');
const logger = require('../utils/logger');

const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
  retryStrategy: (times) => {
    if (times > 10) {
      logger.error('Redis retry limit exceeded');
      return null;
    }
    return Math.min(times * 200, 2000);
  },
});

redisConnection.on('connect', () => logger.info('Redis connected'));
redisConnection.on('ready', () => logger.info('Redis ready'));
redisConnection.on('error', (err) => logger.error(`Redis error: ${err.message}`));
redisConnection.on('close', () => logger.warn('Redis connection closed'));

module.exports = { redisConnection };
