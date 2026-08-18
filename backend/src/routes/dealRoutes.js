const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authMiddleware, requireBusinessOwner } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const dealController = require('../controllers/dealController');

// Public routes
router.get('/', dealController.getDeals);
router.get('/:slug', dealController.getDealBySlug);

// Protected routes
router.use(authMiddleware);

// Create deal (business owner only)
router.post('/business/:businessId', requireBusinessOwner, validate([
  body('title').notEmpty().withMessage('Deal title is required'),
  body('starts_at').isISO8601().withMessage('Valid start date is required'),
  body('expires_at').isISO8601().withMessage('Valid expiry date is required'),
  body('discount_percent').optional().isInt({ min: 0, max: 100 }).withMessage('Discount must be between 0 and 100'),
  body('price').optional().isNumeric().withMessage('Invalid price'),
  body('original_price').optional().isNumeric().withMessage('Invalid original price')
]), dealController.createDeal);

// Update deal
router.put('/:dealId', validate([
  body('title').optional().notEmpty().withMessage('Deal title is required'),
  body('starts_at').optional().isISO8601().withMessage('Valid start date is required'),
  body('expires_at').optional().isISO8601().withMessage('Valid expiry date is required'),
  body('discount_percent').optional().isInt({ min: 0, max: 100 }).withMessage('Discount must be between 0 and 100'),
  body('price').optional().isNumeric().withMessage('Invalid price')
]), dealController.updateDeal);

// Delete deal
router.delete('/:dealId', dealController.deleteDeal);

module.exports = router;