// src/processors/pdf.processor.js
// Purpose: Handles PDF_GENERATION jobs
// Library: Uses built-in Node.js streams to simulate PDF generation
// In production: use puppeteer or pdfkit

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const OUTPUT_DIR = process.env.OUTPUT_DIR || './outputs';

const execute = async (payload, job) => {
  logger.info('PDF processor started', { payload });

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // ── Step 1: Validate payload ──────────────────────────────────────────────
  const { title = 'Report', content = 'No content', templateId } = payload;
  await job.updateProgress(15);

  // ── Step 2: Simulate template loading ────────────────────────────────────
  await sleep(500);
  await job.updateProgress(35);

  // ── Step 3: Simulate PDF rendering ───────────────────────────────────────
  // In production: const browser = await puppeteer.launch();
  // const page = await browser.newPage();
  // await page.setContent(htmlTemplate);
  // const pdfBuffer = await page.pdf({ format: 'A4' });
  await sleep(1000);
  await job.updateProgress(70);

  // ── Step 4: Write output file ─────────────────────────────────────────────
  const filename = `pdf_${job.id}_${Date.now()}.pdf`;
  const filePath = path.join(OUTPUT_DIR, filename);

  // Simulate writing a PDF (in prod, write the real pdfBuffer)
  fs.writeFileSync(filePath, `%PDF-1.4 Simulated PDF: ${title}\n${content}`);
  await job.updateProgress(95);

  await sleep(200);
  await job.updateProgress(100);

  logger.info(`PDF generated: ${filePath}`);
  return {
    fileUrl: `/outputs/${filename}`,
    filename,
    generatedAt: new Date(),
    pages: 1,
  };
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = { execute };
