const AppError = require('../utils/AppError');
const constants = require('../config/constants');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });
  
  // Joi validation error
  if (err.isJoi) {
    return res.status(constants.HTTP_STATUS.BAD_REQUEST).json({
      error: constants.ERROR_MESSAGES.VALIDATION_ERROR,
      details: err.details
    });
  }
  
  // Multer error
  if (err.name === 'MulterError') {
    return res.status(constants.HTTP_STATUS.BAD_REQUEST).json({
      error: 'Upload Error',
      message: err.message
    });
  }
  
  // AppError (operational errors)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message
    });
  }
  
  // Default error (don't leak details in production)
  const statusCode = err.statusCode || constants.HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = process.env.NODE_ENV === 'development' 
    ? err.message 
    : constants.ERROR_MESSAGES.SERVER_ERROR;
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;