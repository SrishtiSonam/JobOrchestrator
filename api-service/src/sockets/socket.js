// src/sockets/socket.js
// Purpose: Initialize Socket.io, JWT-authenticate connections, manage user/admin rooms

const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwt');
const logger = require('../utils/logger');

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
  });

  // ── Auth middleware ───────────────────────────────────────────────────────
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication token missing'));

      const decoded = verifyToken(token);
      socket.data.user = decoded;
      next();
    } catch (err) {
      logger.warn(`Socket auth failed: ${err.message}`);
      next(new Error('Authentication failed'));
    }
  });

  // ── Connection handler ────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const user = socket.data.user;
    logger.info(`Socket connected: ${socket.id} — user: ${user?.id} (${user?.role})`);

    // Join private user room for targeted notifications
    socket.join(`user:${user.id}`);

    // Admins join the admin broadcast room
    if (user.role === 'admin') {
      socket.join('admins');
      logger.info(`Admin ${user.id} joined admin room`);
    }

    // Acknowledge connection to client
    socket.emit('connected', {
      message: 'Connected to job notification service',
      userId: user.id,
      timestamp: new Date(),
    });

    // Allow client to manually subscribe to a specific job
    socket.on('subscribe:job', (jobId) => {
      socket.join(`job:${jobId}`);
    });

    socket.on('unsubscribe:job', (jobId) => {
      socket.leave(`job:${jobId}`);
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} — reason: ${reason}`);
    });

    socket.on('error', (err) => {
      logger.error(`Socket error for ${socket.id}: ${err.message}`);
    });
  });

  logger.info('Socket.io initialized');
  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io has not been initialized. Call initSocket first.');
  return io;
};

module.exports = { initSocket, getIO };
