const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { checkAdminToken } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { validateFileSize } = require('../middleware/validation');

// Handle preflight
router.options('/', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(204);
});

// Upload route
router.post('/',
  checkAdminToken,
  validateFileSize,
  upload.single('image'),
  uploadController.uploadFile
);

module.exports = router;