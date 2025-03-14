/**
 * Authentication Middleware
 * Middleware for handling authentication and authorization
 */

const { verifyToken, extractToken } = require('../config/auth');
const { User } = require('../models');

/**
 * Authenticate user middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Extract token from request
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.'
      });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.'
      });
    }
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.'
      });
    }
    
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'User account is disabled.'
      });
    }
    
    // Attach user to request
    req.user = user;
    
    // Continue to next middleware
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed due to server error.'
    });
  }
};

/**
 * Authorize user middleware
 * Checks if user has required role
 * @param {string|Array} roles - Required role(s)
 */
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }
    
    const userRole = req.user.role;
    
    // If roles is a string, convert to array
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    
    // Check if user has required role
    if (!requiredRoles.includes(userRole) && !requiredRoles.includes('*')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to access this resource.'
      });
    }
    
    // Continue to next middleware
    next();
  };
};

/**
 * API key authentication middleware
 * Verifies API key and attaches user to request
 */
const authenticateApiKey = async (req, res, next) => {
  try {
    // Get API key from header
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key required.'
      });
    }
    
    // Validate API key
    const keyData = await User.validateApiKey(apiKey);
    
    if (!keyData) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired API key.'
      });
    }
    
    // Get user from database
    const user = await User.findById(keyData.user_id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.'
      });
    }
    
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'User account is disabled.'
      });
    }
    
    // Attach user and API key data to request
    req.user = user;
    req.apiKey = keyData;
    
    // Continue to next middleware
    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed due to server error.'
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't require authentication
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    // Extract token from request
    const token = extractToken(req);
    
    if (token) {
      // Verify token
      const decoded = verifyToken(token);
      
      if (decoded) {
        // Get user from database
        const user = await User.findById(decoded.userId);
        
        if (user && user.is_active) {
          // Attach user to request
          req.user = user;
        }
      }
    }
    
    // Continue to next middleware regardless of authentication result
    next();
  } catch (error) {
    // Continue to next middleware even if there's an error
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  authenticateApiKey,
  optionalAuthenticate
}; 