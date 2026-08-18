const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Public search
router.get('/', searchController.search);
router.get('/suggest', searchController.getSuggestions);
router.get('/autocomplete', searchController.autocomplete);

module.exports = router;