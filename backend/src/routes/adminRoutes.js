const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(requireRole(['admin', 'super_admin']));

// ============================================
// DASHBOARD
// ============================================
router.get('/stats', adminController.getStats);

// ============================================
// BUSINESS MANAGEMENT
// ============================================
router.get('/businesses', adminController.getBusinesses);
router.get('/businesses/:id', adminController.getBusiness);
router.post('/businesses', adminController.createBusiness);
router.put('/businesses/:id', adminController.updateBusiness);
router.put('/businesses/:id/status', adminController.updateBusinessStatus);
router.put('/businesses/:id/feature', adminController.toggleFeature);
router.delete('/businesses/:id', adminController.deleteBusiness);

// ============================================
// CATEGORIES - ADD THESE ROUTES
// ============================================
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// ============================================
// USER MANAGEMENT
// ============================================
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUser);
router.put('/users/:id/role', adminController.updateUserRole);
router.put('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);

// ============================================
// REVIEW MODERATION
// ============================================
router.get('/reviews', adminController.getReviews);
router.put('/reviews/:id/moderate', adminController.moderateReview);
router.delete('/reviews/:id', adminController.deleteReview);

// ============================================
// DEALS MANAGEMENT
// ============================================
router.get('/deals', adminController.getDeals);
router.put('/deals/:id/approve', adminController.approveDeal);
router.delete('/deals/:id', adminController.deleteDeal);

// ============================================
// EVENTS MANAGEMENT
// ============================================
router.get('/events', adminController.getEvents);
router.put('/events/:id/approve', adminController.approveEvent);
router.delete('/events/:id', adminController.deleteEvent);

// ============================================
// SUBSCRIPTIONS
// ============================================
router.get('/subscriptions', adminController.getSubscriptions);
router.get('/subscription-plans', adminController.getSubscriptionPlans);
router.post('/subscription-plans', adminController.createSubscriptionPlan);
router.put('/subscription-plans/:id', adminController.updateSubscriptionPlan);
router.delete('/subscription-plans/:id', adminController.deleteSubscriptionPlan);

// ============================================
// REPORTS
// ============================================
router.get('/reports', adminController.getReports);
router.put('/reports/:id/resolve', adminController.resolveReport);

// ============================================
// AUDIT LOGS
// ============================================
router.get('/audit-logs', adminController.getAuditLogs);

// ============================================
// LOCATIONS
// ============================================
router.post('/locations', adminController.createLocation);
router.put('/locations/:id', adminController.updateLocation);
router.delete('/locations/:id', adminController.deleteLocation);

// ============================================
// ADVERTISING PACKAGES
// ============================================
router.get('/advertising-packages', adminController.getAdvertisingPackages);
router.post('/advertising-packages', adminController.createAdvertisingPackage);
router.put('/advertising-packages/:id', adminController.updateAdvertisingPackage);
router.delete('/advertising-packages/:id', adminController.deleteAdvertisingPackage);

// ============================================
// SETTINGS
// ============================================
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

module.exports = router;