// src/routes/auth.routes.js
const router = require('express').Router();
const { register, login, getMe, logout } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');
const { validate } = require('../middleware/validate.middleware');
const { registerValidator, loginValidator } = require('../validators/auth.validator');

router.post('/register', authLimiter, validate(registerValidator), register);
router.post('/login',    authLimiter, validate(loginValidator),    login);
router.get('/me',        authenticate, getMe);
router.post('/logout',   authenticate, logout);

module.exports = router;
