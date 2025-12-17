const express = require('express');
const router = express.Router();
const contentRoutes = require('./content');
const contactRoutes = require('./contact');
const uploadRoutes = require('./upload');
const systemRoutes = require('./system');
const { login, getTokenInfo } = require('../middleware/auth');

// Auth routes
router.post('/auth/login', login);
router.get('/auth/token-info', getTokenInfo);

// API routes
router.use('/content', contentRoutes);
router.use('/contact', contactRoutes);
router.use('/upload', uploadRoutes);
router.use('/system', systemRoutes);

// Legacy routes for backward compatibility
router.get('/content.json', (req, res) => {
  res.sendFile(require('../config').CONTENT_PATH);
});

module.exports = router;