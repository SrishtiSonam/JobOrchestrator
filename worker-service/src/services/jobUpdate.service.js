// src/services/jobUpdate.service.js
// Purpose: Update job status in MongoDB after worker processes it

const Job = require('../models/Job.model');
const logger = require('../utils/logger');

const updateJobStatus = async (mongoJobId, status, extraFields = {}) => {
  const update = { status, ...extraFields };

  // Calculate duration if job is completing
  if (status === 'completed' && extraFields.completedAt) {
    const job = await Job.findById(mongoJobId).select('startedAt');
    if (job?.startedAt) {
      update.duration = extraFields.completedAt - job.startedAt;
    }
  }

  const updatedJob = await Job.findByIdAndUpdate(
    mongoJobId,
    { $set: update },
    { new: true }
  );

  if (!updatedJob) {
    logger.warn(`updateJobStatus: Job not found in DB — ${mongoJobId}`);
    return null;
  }

  logger.info(`Job ${mongoJobId} → ${status}`, {
    duration: update.duration,
    retryCount: update.retryCount,
  });

  return updatedJob;
};

module.exports = { updateJobStatus };
