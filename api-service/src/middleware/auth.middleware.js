// src/middleware/auth.middleware.js
// Purpose: Verify JWT token and attach authenticated user to req.user

const User = require('../models/User.model');
const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');

const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw ApiError.unauthorized('No authentication token provided');
  }

  const decoded = verifyToken(token);

  const user = await User.findById(decoded.id).select('-password');
  if (!user) throw ApiError.unauthorized('User no longer exists');
  if (!user.isActive) throw ApiError.unauthorized('Account has been deactivated');

  req.user = user;
  next();
});

module.exports = { authenticate };
