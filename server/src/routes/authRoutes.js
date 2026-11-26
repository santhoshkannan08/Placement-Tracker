const express = require('express');
const router = express.Router();
const {
  getCsrf,
  register,
  login,
  logout,
  getMe,
  updateProfile,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authRateLimiter } = require('../middleware/rateLimiter');

router.get('/csrf', getCsrf);
router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.patch('/profile', authenticate, updateProfile);

module.exports = router;
