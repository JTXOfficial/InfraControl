/**
 * User Service
 * Handles all operations related to user management
 */

const { User } = require('../../models');

const userService = {
  /**
   * Get all users with optional filtering
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} List of users
   */
  getAllUsers: async (filters = {}) => {
    try {
      return await User.findAll(filters);
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  },

  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object>} User details
   */
  getUserById: async (id) => {
    try {
      return await User.findById(id);
    } catch (error) {
      console.error(`Error getting user with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new user
   * @param {Object} userData - User creation data
   * @returns {Promise<Object>} Created user
   */
  createUser: async (userData) => {
    try {
      return await User.create(userData);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Update an existing user
   * @param {string} id - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user
   */
  updateUser: async (id, updateData) => {
    try {
      return await User.update(id, updateData);
    } catch (error) {
      console.error(`Error updating user with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a user
   * @param {string} id - User ID
   * @returns {Promise<boolean>} Success status
   */
  deleteUser: async (id) => {
    try {
      const deletedUser = await User.delete(id);
      return !!deletedUser;
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Authenticate a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Authentication result with token
   */
  authenticateUser: async (email, password) => {
    try {
      const user = await User.findByEmail(email);
      
      if (!user) {
        return { success: false, message: 'Invalid email or password' };
      }
      
      const isPasswordValid = await User.verifyPassword(user, password);
      
      if (!isPasswordValid) {
        return { success: false, message: 'Invalid email or password' };
      }
      
      // Update last login timestamp
      await User.updateLastLogin(user.id);
      
      // In a real implementation, you would generate a JWT token here
      return { 
        success: true, 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  },

  /**
   * Get user permissions
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of permissions
   */
  getUserPermissions: async (userId) => {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return [];
      }
      
      // In a real implementation, you would fetch permissions from a permissions table
      // For now, we'll return basic permissions based on role
      const rolePermissions = {
        admin: [
          'users:read', 'users:write', 'users:delete',
          'instances:read', 'instances:write', 'instances:delete',
          'settings:read', 'settings:write'
        ],
        user: [
          'users:read',
          'instances:read', 'instances:write',
          'settings:read'
        ]
      };
      
      return rolePermissions[user.role] || [];
    } catch (error) {
      console.error(`Error getting permissions for user with ID ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Update user permissions
   * @param {string} userId - User ID
   * @param {Array} permissions - New permissions
   * @returns {Promise<boolean>} Success status
   */
  updateUserPermissions: async (userId, permissions) => {
    // In a real implementation, you would update permissions in a permissions table
    // For now, we'll just return success
    return true;
  },

  /**
   * Get user activity history
   * @param {string} userId - User ID
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Activity history
   */
  getUserActivity: async (userId, filters = {}) => {
    try {
      // In a real implementation, you would fetch activity from an activity log table
      // For now, we'll return an empty array
      return [];
    } catch (error) {
      console.error(`Error getting activity for user with ID ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Generate API key for user
   * @param {string} userId - User ID
   * @param {Object} keyOptions - API key options
   * @returns {Promise<Object>} Generated API key details
   */
  generateApiKey: async (userId, keyOptions) => {
    try {
      return await User.createApiKey(
        userId, 
        keyOptions.name || 'API Key', 
        keyOptions.permissions || {}, 
        keyOptions.expiresAt || null
      );
    } catch (error) {
      console.error(`Error generating API key for user with ID ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Revoke API key
   * @param {string} keyId - API key ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  revokeApiKey: async (keyId, userId) => {
    try {
      const result = await User.deleteApiKey(keyId, userId);
      return !!result;
    } catch (error) {
      console.error(`Error revoking API key with ID ${keyId}:`, error);
      throw error;
    }
  }
};

module.exports = userService; 