/**
 * Authentication Controller
 * Handles user authentication operations
 */

const { User } = require('../models');
const { generateToken, generateRefreshToken } = require('../config/auth');
const { userService } = require('../services');
const { eventService } = require('../services');

/**
 * Login user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate request
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }
    
    // Find user by email
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }
    
    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been disabled. Please contact an administrator.'
      });
    }
    
    // Verify password
    const isPasswordValid = await User.verifyPassword(user, password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }
    
    // Update last login timestamp
    await User.updateLastLogin(user.id);
    
    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role
    };
    
    const accessToken = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    
    // Log login event
    await eventService.logEvent({
      type: 'auth',
      source: 'api',
      severity: 'info',
      message: `User ${user.username} logged in`,
      resourceType: 'user',
      resourceId: user.id.toString(),
      userId: user.id
    });
    
    // Return user data and tokens
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 86400 // 24 hours in seconds
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login.'
    });
  }
};

/**
 * Register new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const register = async (req, res) => {
  try {
    const { username, email, password, first_name, last_name } = req.body;
    
    // Validate request
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required.'
      });
    }
    
    // Check if username already exists
    const existingUsername = await User.findByUsername(username);
    
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists.'
      });
    }
    
    // Check if email already exists
    const existingEmail = await User.findByEmail(email);
    
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists.'
      });
    }
    
    // Create new user
    const userData = {
      username,
      email,
      password,
      first_name: first_name || '',
      last_name: last_name || '',
      role: 'user' // Default role
    };
    
    const newUser = await User.create(userData);
    
    // Log registration event
    await eventService.logEvent({
      type: 'auth',
      source: 'api',
      severity: 'info',
      message: `User ${newUser.username} registered`,
      resourceType: 'user',
      resourceId: newUser.id.toString(),
      userId: newUser.id
    });
    
    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          role: newUser.role
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during registration.'
    });
  }
};

/**
 * Refresh access token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required.'
      });
    }
    
    // Verify refresh token
    const { verifyToken } = require('../config/auth');
    const decoded = verifyToken(refreshToken);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token.'
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
        message: 'Your account has been disabled. Please contact an administrator.'
      });
    }
    
    // Generate new access token
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role
    };
    
    const accessToken = generateToken(tokenPayload);
    
    // Return new access token
    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully.',
      data: {
        accessToken,
        expiresIn: 86400 // 24 hours in seconds
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during token refresh.'
    });
  }
};

/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProfile = async (req, res) => {
  try {
    const user = req.user;
    
    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          settings: user.settings
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving profile.'
    });
  }
};

/**
 * Change password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    // Validate request
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.'
      });
    }
    
    // Get user with password
    const user = await User.findByUsername(req.user.username);
    
    // Verify current password
    const isPasswordValid = await User.verifyPassword(user, currentPassword);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }
    
    // Update password
    await User.updatePassword(userId, newPassword);
    
    // Log password change event
    await eventService.logEvent({
      type: 'auth',
      source: 'api',
      severity: 'info',
      message: `User ${user.username} changed password`,
      resourceType: 'user',
      resourceId: user.id.toString(),
      userId: user.id
    });
    
    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while changing password.'
    });
  }
};

/**
 * Logout user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const logout = async (req, res) => {
  try {
    // In a stateless JWT authentication system, we don't need to do anything server-side
    // The client should discard the tokens
    
    // Log logout event if user is authenticated
    if (req.user) {
      await eventService.logEvent({
        type: 'auth',
        source: 'api',
        severity: 'info',
        message: `User ${req.user.username} logged out`,
        resourceType: 'user',
        resourceId: req.user.id.toString(),
        userId: req.user.id
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Logout successful.'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during logout.'
    });
  }
};

module.exports = {
  login,
  register,
  refreshToken,
  getProfile,
  changePassword,
  logout
}; 