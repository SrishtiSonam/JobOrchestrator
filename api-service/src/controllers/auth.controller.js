// src/controllers/auth.controller.js
// Purpose: HTTP handlers for auth endpoints — thin, delegates to auth.service

const authService = require('../services/auth.service');
const { asyncHandler } = require('../utils/asyncHandler');

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const { token, user } = await authService.register({ name, email, password });
  res.status(201).json({ success: true, token, data: user });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { token, user } = await authService.login({ email, password });
  res.status(200).json({ success: true, token, data: user });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user._id);
  res.json({ success: true, data: user });
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  // Stateless JWT — client discards token. For token blacklisting, store jti in Redis.
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = { register, login, getMe, logout };
