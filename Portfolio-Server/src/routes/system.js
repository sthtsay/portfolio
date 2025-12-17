const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');
const { checkAdminToken } = require('../middleware/auth');

// Public route
router.get('/health', systemController.getHealth);

// Admin route
router.get('/metrics', 
  checkAdminToken,
  systemController.getMetrics
);

module.exports = router;