// src/config/db.js — Worker service MongoDB connection (identical pattern to api-service)
const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async (retries = 0) => {
  const MAX = 5;
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info('Worker: MongoDB connected');
  } catch (err) {
    logger.error(`Worker MongoDB error (${retries + 1}/${MAX}): ${err.message}`);
    if (retries < MAX) {
      await new Promise((r) => setTimeout(r, 3000));
      return connectDB(retries + 1);
    }
    process.exit(1);
  }
};

module.exports = connectDB;
