// src/processors/report.processor.js
// Purpose: Handles REPORT_GENERATION jobs — aggregates data and builds JSON/CSV report

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const OUTPUT_DIR = process.env.OUTPUT_DIR || './outputs';

const execute = async (payload, job) => {
  logger.info('Report processor started', { payload });

  const {
    reportType = 'summary',   // summary | detailed | export
    dateRange,                // { from, to }
    filters = {},
    format = 'json',          // json | csv
  } = payload;

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  await job.updateProgress(10);

  // ── Step 1: Build DB query based on filters ───────────────────────────────
  // In production: query MongoDB aggregate pipeline
  await sleep(400);
  await job.updateProgress(30);

  // ── Step 2: Aggregate data ────────────────────────────────────────────────
  await sleep(600);
  await job.updateProgress(60);

  // ── Step 3: Transform to output format ───────────────────────────────────
  const reportData = {
    reportType,
    generatedAt: new Date(),
    dateRange,
    filters,
    summary: {
      totalRecords: 1250,
      processed: 1200,
      failed: 50,
      successRate: '96%',
    },
    data: [
      { date: '2024-01-01', count: 120, status: 'completed' },
      { date: '2024-01-02', count: 145, status: 'completed' },
    ],
  };

  await job.updateProgress(80);

  // ── Step 4: Write output file ─────────────────────────────────────────────
  const filename = `report_${reportType}_${job.id}_${Date.now()}.${format}`;
  const filePath = path.join(OUTPUT_DIR, filename);

  if (format === 'json') {
    fs.writeFileSync(filePath, JSON.stringify(reportData, null, 2));
  } else if (format === 'csv') {
    const csv = Object.keys(reportData.summary).map((k) => `${k},${reportData.summary[k]}`).join('\n');
    fs.writeFileSync(filePath, `key,value\n${csv}`);
  }

  await job.updateProgress(100);

  logger.info(`Report generated: ${filePath}`);
  return {
    fileUrl: `/outputs/${filename}`,
    filename,
    format,
    reportType,
    recordCount: reportData.summary.totalRecords,
    generatedAt: new Date(),
  };
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = { execute };
