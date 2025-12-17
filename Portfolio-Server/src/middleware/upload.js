const multer = require('multer');
const path = require('path');
const config = require('../config');
const AppError = require('../utils/AppError');
const constants = require('../config/constants');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (config.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(constants.ERROR_MESSAGES.INVALID_FILE_TYPE, 400), false);
  }
};

// Create multer instance
const upload = multer({
  storage,
  limits: { fileSize: config.MAX_FILE_SIZE },
  fileFilter
});

module.exports = { upload };