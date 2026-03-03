// src/services/admin.service.js
// Purpose: Admin-level queries — all jobs, system stats, queue metrics

const Job = require('../models/Job.model');
const User = require('../models/User.model');
const { getQueueStats } = require('../queues/jobQueue');

// ── Get all jobs with filters and pagination ──────────────────────────────────
const getAllJobs = async ({ page = 1, limit = 50, status, type, userId } = {}) => {
  const filter = {};
  if (status) filter.status = status;
  if (type)   filter.type = type;
  if (userId) filter.userId = userId;

  const skip = (page - 1) * limit;
  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Job.countDocuments(filter),
  ]);

  return { jobs, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } };
};

// ── System-wide stats dashboard ───────────────────────────────────────────────
const getSystemStats = async () => {
  const [
    totalUsers,
    totalJobs,
    jobsByStatus,
    jobsByType,
    queueStats,
  ] = await Promise.all([
    User.countDocuments(),
    Job.countDocuments(),
    Job.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Job.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
    getQueueStats(),
  ]);

  return {
    users: { total: totalUsers },
    jobs: {
      total: totalJobs,
      byStatus: Object.fromEntries(jobsByStatus.map(({ _id, count }) => [_id, count])),
      byType: Object.fromEntries(jobsByType.map(({ _id, count }) => [_id, count])),
    },
    queue: queueStats,
  };
};

module.exports = { getAllJobs, getSystemStats };
