const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

// Public webhook (no auth)
router.post('/webhook', paymentController.handleWebhook);

// Protected routes
router.use(authMiddleware);

// Create payment intent
router.post('/create-intent', paymentController.createPaymentIntent);

// Confirm payment
router.post('/confirm', paymentController.confirmPayment);

// Get payment history
router.get('/history', paymentController.getPaymentHistory);

// Get payment details
router.get('/:id', paymentController.getPaymentDetails);

// Refund payment
router.post('/:id/refund', paymentController.refundPayment);

module.exports = router;