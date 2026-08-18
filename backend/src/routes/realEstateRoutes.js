// routes/realEstateRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');

// ✅ Import ALL controllers - including updateAgentSettings
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  createRequest,
  getRequests,
  getRequest,
  updateRequestStatus,
  getAgents,
  getAgent,
  updateAgent,
  deleteAgent,
  saveProperty,
  unsaveProperty,
  getSavedProperties,
  getLocations,
  getAgentProfile,
  updateAgentProfile,
  updateAgentSettings,  // ✅ Make sure this is imported
  getAgentProperties
} = require('../controllers/realEstateController');

// ============================================
// PUBLIC ROUTES
// ============================================

router.get('/properties', getProperties);
router.get('/properties/:id', getProperty);
router.get('/requests', getRequests);
router.get('/requests/:id', getRequest);
router.get('/agents', getAgents);
router.get('/agents/:id', getAgent);
router.get('/locations', getLocations);

// ✅ Property requests - Allow anyone to submit
router.post('/requests', createRequest);

// ============================================
// PROTECTED ROUTES
// ============================================

// Property management
router.post('/properties', authMiddleware, createProperty);
router.put('/properties/:id', authMiddleware, updateProperty);
router.delete('/properties/:id', authMiddleware, deleteProperty);

// Request status update (admin only)
router.put('/requests/:id/status', authMiddleware, requireRole(['admin', 'super_admin']), updateRequestStatus);

// Saved properties
router.get('/saved', authMiddleware, getSavedProperties);
router.post('/saved/:propertyId', authMiddleware, saveProperty);
router.delete('/saved/:propertyId', authMiddleware, unsaveProperty);

// Agent management (Admin only)
router.put('/agents/:id', authMiddleware, requireRole(['admin', 'super_admin']), updateAgent);
router.delete('/agents/:id', authMiddleware, requireRole(['admin', 'super_admin']), deleteAgent);

// ✅ Agent routes (for logged-in agents)
router.get('/agent/profile', authMiddleware, getAgentProfile);
router.put('/agent/profile', authMiddleware, updateAgentProfile);
router.put('/agent/settings', authMiddleware, updateAgentSettings);  // ✅ This route
router.get('/agent/properties', authMiddleware, getAgentProperties);

module.exports = router;