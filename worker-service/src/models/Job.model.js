// src/models/Job.model.js
// Purpose: Same schema as api-service — worker needs to update job status in DB

const mongoose = require('mongoose');

const JOB_TYPES = ['PDF_GENERATION', 'IMAGE_COMPRESSION', 'REPORT_GENERATION'];
const JOB_STATUSES = ['pending', 'processing', 'completed', 'failed', 'cancelled'];

const JobSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:         { type: String, enum: JOB_TYPES, required: true },
  status:       { type: String, enum: JOB_STATUSES, default: 'pending' },
  payload:      { type: mongoose.Schema.Types.Mixed, required: true },
  result:       { type: mongoose.Schema.Types.Mixed, default: null },
  errorMessage: { type: String, default: null },
  retryCount:   { type: Number, default: 0 },
  priority:     { type: Number, default: 0 },
  bullJobId:    { type: String },
  startedAt:    { type: Date },
  completedAt:  { type: Date },
  duration:     { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);
