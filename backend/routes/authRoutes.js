const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  refreshToken, 
  logout, 
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  getMe,
  updateProfile
} = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { validate, validateEmail, validatePassword } = require('../middleware/validation');

// Public routes
router.post('/register', validate([
  validateEmail(),
  validatePassword(),
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number')
]), register);

router.post('/login', validate([
  validateEmail(),
  body('password').notEmpty().withMessage('Password is required')
]), login);

router.post('/refresh-token', refreshToken);

router.get('/verify-email', verifyEmail);

router.post('/request-password-reset', validate([
  validateEmail()
]), requestPasswordReset);

router.post('/reset-password', validate([
  body('token').notEmpty().withMessage('Token is required'),
  validatePassword('newPassword')
]), resetPassword);

// Protected routes
router.use(authMiddleware);

router.post('/logout', logout);
router.get('/me', getMe);
router.put('/profile', validate([
  body('full_name').optional().notEmpty().withMessage('Full name cannot be empty'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number')
]), updateProfile);

module.exports = router;