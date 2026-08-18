const express = require('express');
const router = express.Router();  // ← This should be 'router', not 'outer'
const businessController = require('../controllers/businessController');
const { authMiddleware, requireBusinessOwner } = require('../middleware/auth');

// ✅ Public routes
router.get('/debug', businessController.debugBusinesses);
router.get('/', businessController.getAllBusinesses);
router.get('/:slug', businessController.getBusinessBySlug);

// ✅ Protected routes (require authentication)
router.use(authMiddleware);

router.post('/register', businessController.registerBusiness);
router.put('/:id', requireBusinessOwner, businessController.updateBusiness);
router.post('/:id/images', requireBusinessOwner, businessController.addBusinessImage);
router.delete('/images/:imageId', requireBusinessOwner, businessController.removeBusinessImage);
router.post('/:id/hours', requireBusinessOwner, businessController.setBusinessHours);
router.post('/:id/services', requireBusinessOwner, businessController.addService);
router.delete('/services/:serviceId', requireBusinessOwner, businessController.deleteService);
router.post('/:slug/claim', businessController.claimBusiness);

module.exports = router;