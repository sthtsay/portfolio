const crypto = require('crypto');
const config = require('../config');
const constants = require('../config/constants');
const AppError = require('../utils/AppError');

// Simple JWT-like token system using crypto
class TokenManager {
  constructor() {
    this.secret = config.ADMIN_TOKEN + '_secret_key';
    this.tokenExpiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  }

  // Create a token with expiration
  createToken(adminToken) {
    if (adminToken !== config.ADMIN_TOKEN) {
      throw new Error('Invalid admin token');
    }

    const payload = {
      admin: true,
      iat: Date.now(),
      exp: Date.now() + this.tokenExpiry
    };

    const payloadStr = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(payloadStr)
      .digest('hex');

    // Create token: base64(payload).signature
    const token = Buffer.from(payloadStr).toString('base64') + '.' + signature;
    return token;
  }

  // Verify token
  verifyToken(token) {
    try {
      if (!token) return false;

      const [payloadB64, signature] = token.split('.');
      if (!payloadB64 || !signature) return false;

      const payloadStr = Buffer.from(payloadB64, 'base64').toString();
      const payload = JSON.parse(payloadStr);

      // Check signature
      const expectedSignature = crypto
        .createHmac('sha256', this.secret)
        .update(payloadStr)
        .digest('hex');

      if (signature !== expectedSignature) return false;

      // Check expiration
      if (Date.now() > payload.exp) return false;

      // Check if it's admin token
      if (!payload.admin) return false;

      return true;
    } catch (error) {
      return false;
    }
  }

  // Get token expiration info
  getTokenInfo(token) {
    try {
      const [payloadB64] = token.split('.');
      const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString());
      return {
        issuedAt: new Date(payload.iat),
        expiresAt: new Date(payload.exp),
        timeLeft: payload.exp - Date.now()
      };
    } catch (error) {
      return null;
    }
  }
}

const tokenManager = new TokenManager();

// Login endpoint to exchange admin token for JWT
const login = (req, res, next) => {
  try {
    const { adminToken } = req.body;
    
    if (!adminToken || adminToken !== config.ADMIN_TOKEN) {
      return next(new AppError(constants.ERROR_MESSAGES.UNAUTHORIZED, constants.HTTP_STATUS.UNAUTHORIZED));
    }

    const token = tokenManager.createToken(adminToken);
    
    res.json({
      success: true,
      token: token,
      expiresIn: tokenManager.tokenExpiry,
      message: 'Authentication successful'
    });
  } catch (error) {
    next(new AppError('Authentication failed', constants.HTTP_STATUS.UNAUTHORIZED));
  }
};

// Middleware to check JWT token
const checkAdminToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return next(new AppError(constants.ERROR_MESSAGES.INVALID_TOKEN, constants.HTTP_STATUS.UNAUTHORIZED));
  }
  
  // Check if it's the old direct admin token (for backward compatibility)
  if (token === config.ADMIN_TOKEN) {
    return next(); // Allow direct admin token for now
  }
  
  // Check JWT token
  if (!tokenManager.verifyToken(token)) {
    return next(new AppError('Token expired or invalid', constants.HTTP_STATUS.UNAUTHORIZED));
  }
  
  next();
};

// Middleware to get token info
const getTokenInfo = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.json({ valid: false, message: 'No token provided' });
  }
  
  if (token === config.ADMIN_TOKEN) {
    return res.json({ 
      valid: true, 
      type: 'direct',
      message: 'Direct admin token (no expiration)' 
    });
  }
  
  const info = tokenManager.getTokenInfo(token);
  const isValid = tokenManager.verifyToken(token);
  
  res.json({
    valid: isValid,
    type: 'jwt',
    ...info,
    message: isValid ? 'Token is valid' : 'Token is expired or invalid'
  });
};

module.exports = { 
  checkAdminToken, 
  login, 
  getTokenInfo,
  tokenManager 
};