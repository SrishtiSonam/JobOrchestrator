// src/config/redis.js
const { Redis } = require('ioredis');
const logger = require('../utils/logger');

const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redisConnection.on('connect', () => logger.info('Worker: Redis connected'));
redisConnection.on('error', (err) => logger.error(`Worker Redis error: ${err.message}`));

module.exports = { redisConnection };
