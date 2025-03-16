/**
 * User Service
 * Handles all API calls related to users
 */

import api from './api';

const userService = {
  /**
   * Get all users with optional filters
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} List of users
   */
  getAllUsers: async (filters = {}) => {
    try {
      const response = await api.get('/users', { params: filters });
      return response.data.data.users;
    } catch (error) {
      console.error('Error fetching users:', error);
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
      console.log(`Fetching user with ID: ${id}`);
      const response = await api.get(`/users/${id}`);
      console.log('API response:', response);
      
      if (!response.data || !response.data.data || !response.data.data.user) {
        console.error('Invalid response format:', response.data);
        throw new Error('Invalid response format from server');
      }
      
      return response.data.data.user;
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw error;
    }
  },

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  createUser: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response.data.data.user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Update a user
   * @param {string} id - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user
   */
  updateUser: async (id, updateData) => {
    try {
      const response = await api.put(`/users/${id}`, updateData);
      return response.data.data.user;
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
      await api.delete(`/users/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get user activity
   * @param {string} id - User ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} User activity with pagination
   */
  getUserActivity: async (id, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/users/${id}/activity`, {
        params: { page, limit }
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching activity for user with ID ${id}:`, error);
      throw error;
    }
  }
};

export default userService; 