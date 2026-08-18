const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const subscriptionController = require('../controllers/subscriptionController');

// Public routes
router.get('/plans', subscriptionController.getPlans);
router.get('/plans/:slug', subscriptionController.getPlanBySlug);

// Protected routes
router.use(authMiddleware);

// Get current subscription
router.get('/current', subscriptionController.getCurrentSubscription);

// Subscribe to a plan
router.post('/subscribe', subscriptionController.subscribe);

// Cancel subscription
router.post('/cancel', subscriptionController.cancelSubscription);

// Resume subscription
router.post('/resume', subscriptionController.resumeSubscription);

// Get subscription history
router.get('/history', subscriptionController.getSubscriptionHistory);

module.exports = router;