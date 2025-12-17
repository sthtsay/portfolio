require('dotenv').config();
const path = require('path');

const config = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3000,
  
  // Security
  ADMIN_TOKEN: process.env.ADMIN_TOKEN,
  
  // CORS
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'],
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Email
  EMAIL_SERVICE: process.env.EMAIL_SERVICE,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  NOTIFICATION_EMAIL: process.env.NOTIFICATION_EMAIL,
  
  // File paths
  ROOT_DIR: path.join(__dirname, '..', '..'),
  CONTENT_PATH: path.join(__dirname, '..', '..', 'content.json'),
  CONTACTS_PATH: path.join(__dirname, '..', '..', 'contacts.json'),
  UPLOADS_DIR: path.join(__dirname, '..', '..', 'uploads'),
  LOGS_DIR: path.join(__dirname, '..', '..', 'logs'),
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 500, // Increased for development
  UPLOAD_LIMIT_MAX: 20,
  CONTACT_LIMIT_MAX: 5,
  
  // Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp']
};

// Validate required config
const requiredConfig = ['ADMIN_TOKEN'];
requiredConfig.forEach(key => {
  if (!config[key]) {
    console.error(`FATAL ERROR: ${key} is not defined in environment variables`);
    process.exit(1);
  }
});

module.exports = config;