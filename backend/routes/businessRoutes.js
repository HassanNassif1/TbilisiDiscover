const express = require('express');
const router = express.Router();
const {
  getAllBusinesses,
  getBusinessBySlug,
  registerBusiness,
  updateBusiness,
  addBusinessImage,
  removeBusinessImage,
  setBusinessHours,
  addService,
  deleteService,
  addMenu,
  addMenuCategory,
  addMenuItem,
  getBusinessAnalytics,
  claimBusiness
} = require('../controllers/businessController');
const { authMiddleware, requireBusinessOwner } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { body, param } = require('express-validator');

// Public routes
router.get('/', getAllBusinesses);
router.get('/:slug', getBusinessBySlug);

// Protected routes
router.use(authMiddleware);

// Business registration
router.post('/register', validate([
  body('name').notEmpty().withMessage('Business name is required'),
  body('owner_name').notEmpty().withMessage('Owner name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('category_id').isUUID().withMessage('Valid category is required'),
  body('address').notEmpty().withMessage('Address is required')
]), registerBusiness);

// Claim business
router.post('/:slug/claim', validate([
  body('reason').optional()
]), claimBusiness);

// Business management (requires ownership)
router.put('/:id', requireBusinessOwner, validate([
  body('name').optional(),
  body('description').optional(),
  body('address').optional(),
  body('phone').optional(),
  body('website').optional().isURL().withMessage('Invalid URL'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('price_range').optional().isIn(['$', '$$', '$$$', '$$$$']).withMessage('Invalid price range')
]), updateBusiness);

// Images
router.post('/:id/images', requireBusinessOwner, validate([
  body('image_url').isURL().withMessage('Invalid image URL'),
  body('caption').optional(),
  body('is_cover').optional().isBoolean()
]), addBusinessImage);

router.delete('/images/:imageId', requireBusinessOwner, removeBusinessImage);

// Hours
router.post('/:id/hours', requireBusinessOwner, validate([
  body('hours').isArray().withMessage('Hours must be an array'),
  body('hours.*.day_of_week').isInt({ min: 0, max: 6 }).withMessage('Invalid day'),
  body('hours.*.opens_at').optional(),
  body('hours.*.closes_at').optional(),
  body('hours.*.is_closed').optional().isBoolean()
]), setBusinessHours);

// Services
router.post('/:id/services', requireBusinessOwner, validate([
  body('name').notEmpty().withMessage('Service name is required'),
  body('description').optional(),
  body('price').optional().isNumeric().withMessage('Invalid price'),
  body('duration_minutes').optional().isInt({ min: 1 }).withMessage('Invalid duration')
]), addService);

router.delete('/services/:serviceId', requireBusinessOwner, deleteService);

// Menu
router.post('/:id/menus', requireBusinessOwner, validate([
  body('name').notEmpty().withMessage('Menu name is required'),
  body('description').optional()
]), addMenu);

router.post('/menus/:menuId/categories', requireBusinessOwner, validate([
  body('name').notEmpty().withMessage('Category name is required'),
  body('description').optional()
]), addMenuCategory);

router.post('/menu-categories/:categoryId/items', requireBusinessOwner, validate([
  body('name').notEmpty().withMessage('Item name is required'),
  body('description').optional(),
  body('price').isNumeric().withMessage('Invalid price'),
  body('image_url').optional().isURL().withMessage('Invalid URL'),
  body('dietary_info').optional().isArray()
]), addMenuItem);

// Analytics
router.get('/:id/analytics', requireBusinessOwner, getBusinessAnalytics);

module.exports = router;