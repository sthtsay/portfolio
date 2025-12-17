const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { checkAdminToken } = require('../middleware/auth');
const { validateRequest, contentSchema } = require('../middleware/validation');

// Public route
router.get('/', contentController.getContent);

// Admin routes
router.post('/update', 
  checkAdminToken,
  validateRequest(contentSchema),
  contentController.updateContent
);

router.post('/backup', 
  checkAdminToken,
  contentController.createBackup
);

module.exports = router;