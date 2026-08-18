const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authMiddleware, requireBusinessOwner } = require('../middleware/auth');
const { validate, validateEvent } = require('../middleware/validation');
const eventController = require('../controllers/eventController');

// Public routes
router.get('/', eventController.getEvents);
router.get('/:slug', eventController.getEventBySlug);

// Protected routes
router.use(authMiddleware);

// Create event (business owner only)
router.post('/business/:businessId', requireBusinessOwner, validate(validateEvent()), eventController.createEvent);

// Update event
router.put('/:eventId', validate(validateEvent()), eventController.updateEvent);

// Delete event
router.delete('/:eventId', eventController.deleteEvent);

module.exports = router;