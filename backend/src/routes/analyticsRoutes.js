const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

// Public analytics (aggregated)
router.get('/public/stats', analyticsController.getPublicStats);

// Protected routes
router.use(authMiddleware);

// Get user analytics
router.get('/user', analyticsController.getUserAnalytics);

// Get business analytics (owner only)
router.get('/business/:businessId', analyticsController.getBusinessAnalytics);

// Track events
router.post('/track', analyticsController.trackEvent);

module.exports = router;