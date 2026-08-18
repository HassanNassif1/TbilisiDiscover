const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const reviewController = require('../controllers/reviewController');

// Public routes
router.get('/business/:businessId', reviewController.getBusinessReviews);
router.get('/:id', reviewController.getReviewById);

// Protected routes
router.use(authMiddleware);

// Create review
router.post('/business/:businessId', validate([
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').optional().isLength({ max: 255 }).withMessage('Title too long'),
  body('content').optional().isLength({ max: 2000 }).withMessage('Content too long')
]), reviewController.createReview);

// Update review
router.put('/:reviewId', validate([
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').optional().isLength({ max: 255 }).withMessage('Title too long'),
  body('content').optional().isLength({ max: 2000 }).withMessage('Content too long')
]), reviewController.updateReview);

// Delete review
router.delete('/:reviewId', reviewController.deleteReview);

// Mark review as helpful
router.post('/:reviewId/helpful', reviewController.markReviewHelpful);

// Report review
router.post('/:reviewId/report', validate([
  body('reason').notEmpty().withMessage('Reason is required'),
  body('description').optional()
]), reviewController.reportReview);

// Admin routes
router.use(requireRole(['admin', 'super_admin']));

// Moderate review
router.put('/:reviewId/moderate', validate([
  body('status').isIn(['approved', 'rejected']).withMessage('Invalid status'),
  body('admin_notes').optional()
]), reviewController.moderateReview);

module.exports = router;