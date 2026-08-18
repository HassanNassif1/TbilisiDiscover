const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const userController = require('../controllers/userController');

// All routes require authentication
router.use(authMiddleware);

// Get user profile
router.get('/profile', userController.getProfile);

// Update user profile
router.put('/profile', validate([
  body('full_name').optional().notEmpty().withMessage('Full name cannot be empty'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('profile_image').optional().isURL().withMessage('Invalid image URL')
]), userController.updateProfile);

// Get user's favorites
router.get('/favorites', userController.getFavorites);

// Add business to favorites
router.post('/favorites/:businessId', validate([
  body('businessId').isUUID().withMessage('Invalid business ID')
]), userController.addFavorite);

// Remove business from favorites
router.delete('/favorites/:businessId', userController.removeFavorite);

// Get user's reviews
router.get('/reviews', userController.getUserReviews);

// Get user's businesses
router.get('/businesses', userController.getUserBusinesses);

// Change password
router.put('/change-password', validate([
  body('current_password').notEmpty().withMessage('Current password is required'),
  body('new_password').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
]), userController.changePassword);

// Delete account
router.delete('/account', userController.deleteAccount);

module.exports = router;