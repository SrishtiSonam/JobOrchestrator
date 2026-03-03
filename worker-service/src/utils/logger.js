// src/utils/logger.js
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');
const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const devFormat = combine(
  colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [WORKER][${level}]: ${message}`;
    if (Object.keys(meta).length) log += ` ${JSON.stringify(meta)}`;
    if (stack) log += `\n${stack}`;
    return log;
  })
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.NODE_ENV === 'production' ? combine(timestamp(), errors({ stack: true }), json()) : devFormat,
  transports: [
    new winston.transports.Console(),
    new DailyRotateFile({ filename: path.join(logDir, 'worker-error-%DATE%.log'), level: 'error', maxFiles: '14d' }),
    new DailyRotateFile({ filename: path.join(logDir, 'worker-combined-%DATE%.log'), maxFiles: '7d' }),
  ],
});

module.exports = logger;
