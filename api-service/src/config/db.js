// src/config/db.js
// Purpose: MongoDB connection with retry logic and lifecycle event handlers

const mongoose = require('mongoose');
const logger = require('../utils/logger');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

const connectDB = async (retries = 0) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    logger.error(`MongoDB connection error (attempt ${retries + 1}/${MAX_RETRIES}): ${err.message}`);
    if (retries < MAX_RETRIES) {
      logger.info(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
      return connectDB(retries + 1);
    }
    logger.error('Max MongoDB connection retries reached. Exiting.');
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected. Attempting reconnect...');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected.');
});

module.exports = connectDB;
