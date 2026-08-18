// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { 
  register, 
  agentRegister,  // ✅ Add this
  login, 
  refreshToken, 
  logout, 
  verifyEmail, 
  requestPasswordReset, 
  resetPassword, 
  getMe, 
  updateProfile 
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/agent-register', agentRegister);  // ✅ Add this route
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.get('/verify-email', verifyEmail);
router.post('/request-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', getMe);
router.put('/profile', updateProfile);

module.exports = router;