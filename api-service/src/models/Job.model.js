// src/models/Job.model.js
// Purpose: Tracks every submitted job — status, payload, result, retry info

const mongoose = require('mongoose');

const JOB_TYPES = ['PDF_GENERATION', 'IMAGE_COMPRESSION', 'REPORT_GENERATION'];
const JOB_STATUSES = ['pending', 'processing', 'completed', 'failed', 'cancelled'];

const JobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: JOB_TYPES,
      required: [true, 'Job type is required'],
    },
    status: {
      type: String,
      enum: JOB_STATUSES,
      default: 'pending',
      index: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Job payload is required'],
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    priority: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    bullJobId: {
      type: String,
      index: true,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    duration: {
      type: Number, // milliseconds
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Compound indexes ──────────────────────────────────────────────────────────
JobSchema.index({ status: 1, createdAt: -1 });
JobSchema.index({ userId: 1, createdAt: -1 });
JobSchema.index({ userId: 1, status: 1 });

// ── Virtuals ──────────────────────────────────────────────────────────────────
JobSchema.virtual('isTerminal').get(function () {
  return ['completed', 'failed', 'cancelled'].includes(this.status);
});

JobSchema.virtual('isRunning').get(function () {
  return this.status === 'processing';
});

// ── Static helpers ────────────────────────────────────────────────────────────
JobSchema.statics.JOB_TYPES = JOB_TYPES;
JobSchema.statics.JOB_STATUSES = JOB_STATUSES;

module.exports = mongoose.model('Job', JobSchema);
