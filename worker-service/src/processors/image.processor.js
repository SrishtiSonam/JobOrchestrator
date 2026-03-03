// src/processors/image.processor.js
// Purpose: Handles IMAGE_COMPRESSION jobs
// Library: sharp (free, open-source, high-performance)

const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

const OUTPUT_DIR = process.env.OUTPUT_DIR || './outputs';

const execute = async (payload, job) => {
  logger.info('Image processor started', { payload });

  const {
    inputPath,          // absolute or relative path to source image
    quality = 80,       // compression quality 1-100
    format = 'webp',    // output format: jpeg | png | webp
    width,              // optional resize width
    height,             // optional resize height
  } = payload;

  if (!inputPath) throw new Error('inputPath is required for IMAGE_COMPRESSION');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  await job.updateProgress(10);

  // ── Load sharp ────────────────────────────────────────────────────────────
  // In production, sharp must be installed: npm install sharp
  // const sharp = require('sharp');
  await job.updateProgress(30);

  const filename = `img_${job.id}_${Date.now()}.${format}`;
  const outputPath = path.join(OUTPUT_DIR, filename);

  // ── Process image ─────────────────────────────────────────────────────────
  // let pipeline = sharp(inputPath);
  // if (width || height) pipeline = pipeline.resize(width, height, { fit: 'inside' });
  // pipeline = pipeline[format]({ quality });
  // const info = await pipeline.toFile(outputPath);

  // ── Simulate processing ───────────────────────────────────────────────────
  await sleep(800);
  await job.updateProgress(80);

  // Simulate writing output
  fs.writeFileSync(outputPath, `SIMULATED_COMPRESSED_IMAGE_${format}_q${quality}`);
  const originalSize = 1024 * 1024; // Simulated 1MB original
  const compressedSize = Math.floor(originalSize * (quality / 100));

  await job.updateProgress(100);

  logger.info(`Image compressed: ${outputPath}`);
  return {
    fileUrl: `/outputs/${filename}`,
    filename,
    format,
    quality,
    originalSize,
    compressedSize,
    compressionRatio: ((1 - compressedSize / originalSize) * 100).toFixed(1) + '%',
    generatedAt: new Date(),
  };
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = { execute };
