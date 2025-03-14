/**
 * Authentication Configuration
 * Configuration for JWT and authentication
 */

const jwt = require('jsonwebtoken');

// JWT configuration
const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
  expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  algorithm: 'HS256',
  issuer: 'infracontrol-api'
};

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
    algorithm: jwtConfig.algorithm,
    issuer: jwtConfig.issuer
  });
};

/**
 * Generate refresh token
 * @param {Object} payload - Token payload
 * @returns {string} Refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.refreshExpiresIn,
    algorithm: jwtConfig.algorithm,
    issuer: jwtConfig.issuer
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token or null if invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.secret, {
      algorithms: [jwtConfig.algorithm],
      issuer: jwtConfig.issuer
    });
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
};

/**
 * Extract token from request
 * @param {Object} req - Express request object
 * @returns {string|null} JWT token or null if not found
 */
const extractToken = (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.substring(7);
  }
  
  if (req.query && req.query.token) {
    return req.query.token;
  }
  
  return null;
};

module.exports = {
  jwtConfig,
  generateToken,
  generateRefreshToken,
  verifyToken,
  extractToken
}; 