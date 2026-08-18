const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// Public routes
router.get('/', locationController.getAllLocations);
router.get('/:slug', locationController.getLocationBySlug);
router.get('/:id/businesses', locationController.getLocationBusinesses);

module.exports = router;