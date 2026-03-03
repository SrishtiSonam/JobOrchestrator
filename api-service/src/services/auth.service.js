// src/services/auth.service.js
// Purpose: Auth business logic — register, login, profile management

const User = require('../models/User.model');
const { signToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw ApiError.conflict('Email already registered');

  const user = await User.create({ name, email, password });
  const token = signToken({ id: user._id, role: user.role });

  logger.info(`New user registered: ${user.email} [${user._id}]`);
  return { token, user: user.toSafeObject() };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (!user.isActive) throw ApiError.unauthorized('Account has been deactivated');

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken({ id: user._id, role: user.role });
  logger.info(`User logged in: ${user.email} [${user._id}]`);
  return { token, user: user.toSafeObject() };
};

const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  return user.toSafeObject();
};

module.exports = { register, login, getProfile };
