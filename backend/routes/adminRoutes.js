const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All admin routes require admin role
router.use(authMiddleware);
router.use(requireRole(['admin', 'super_admin']));

// Dashboard statistics
router.get('/stats', adminController.getStats);

// Business management
router.get('/businesses', adminController.getBusinesses);
router.get('/businesses/:id', adminController.getBusiness);
router.put('/businesses/:id/status', adminController.updateBusinessStatus);
router.put('/businesses/:id/feature', adminController.toggleFeature);
router.delete('/businesses/:id', adminController.deleteBusiness);

// User management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUser);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Review moderation
router.get('/reviews', adminController.getReviews);
router.put('/reviews/:id/moderate', adminController.moderateReview);
router.delete('/reviews/:id', adminController.deleteReview);

// Deals
router.get('/deals', adminController.getDeals);
router.put('/deals/:id/approve', adminController.approveDeal);
router.delete('/deals/:id', adminController.deleteDeal);

// Events
router.get('/events', adminController.getEvents);
router.put('/events/:id/approve', adminController.approveEvent);
router.delete('/events/:id', adminController.deleteEvent);

// Subscription plans
router.get('/subscription-plans', adminController.getSubscriptionPlans);
router.post('/subscription-plans', adminController.createSubscriptionPlan);
router.put('/subscription-plans/:id', adminController.updateSubscriptionPlan);
router.delete('/subscription-plans/:id', adminController.deleteSubscriptionPlan);

// Advertising packages
router.get('/advertising-packages', adminController.getAdvertisingPackages);
router.post('/advertising-packages', adminController.createAdvertisingPackage);
router.put('/advertising-packages/:id', adminController.updateAdvertisingPackage);
router.delete('/advertising-packages/:id', adminController.deleteAdvertisingPackage);

// Reports
router.get('/reports', adminController.getReports);
router.put('/reports/:id/resolve', adminController.resolveReport);

// Audit logs
router.get('/audit-logs', adminController.getAuditLogs);

// Categories
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Locations
router.post('/locations', adminController.createLocation);
router.put('/locations/:id', adminController.updateLocation);
router.delete('/locations/:id', adminController.deleteLocation);

// Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

module.exports = router;