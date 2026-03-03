// src/utils/jwt.js
// Purpose: Sign and verify JWT tokens

const jwt = require('jsonwebtoken');
const ApiError = require('./ApiError');

const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw ApiError.unauthorized('Token expired');
    if (err.name === 'JsonWebTokenError') throw ApiError.unauthorized('Invalid token');
    throw ApiError.unauthorized('Token verification failed');
  }
};

module.exports = { signToken, verifyToken };
