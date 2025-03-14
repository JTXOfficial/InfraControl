/**
 * Authentication Service
 * Handles authentication-related operations
 */

import api from './api';

const authService = {
  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data and tokens
   */
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Store token and user data in local storage
      if (response.data && response.data.data && response.data.data.tokens && response.data.data.tokens.accessToken) {
        localStorage.setItem('token', response.data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      } else {
        console.error('Invalid response format:', response.data);
        throw new Error('Invalid response from server');
      }
      
      return response.data;
    } catch (error) {
      console.error('Login service error:', error);
      if (error.response) {
        throw error.response.data || { message: 'Authentication failed' };
      } else if (error.request) {
        throw { message: 'No response from server. Please check your connection.' };
      } else {
        throw { message: error.message || 'An unexpected error occurred' };
      }
    }
  },

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Created user data
   */
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Register service error:', error);
      if (error.response) {
        throw error.response.data || { message: 'Registration failed' };
      } else if (error.request) {
        throw { message: 'No response from server. Please check your connection.' };
      } else {
        throw { message: error.message || 'An unexpected error occurred' };
      }
    }
  },

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  logout: async () => {
    try {
      // Call logout endpoint if needed
      const token = localStorage.getItem('token');
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  /**
   * Get current user data
   * @returns {Object|null} User data or null if not authenticated
   */
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      localStorage.removeItem('user');
      return null;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  /**
   * Refresh access token
   * @returns {Promise<string>} New access token
   */
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await api.post('/auth/refresh-token', { refreshToken });
      
      if (response.data && response.data.data && response.data.data.accessToken) {
        localStorage.setItem('token', response.data.data.accessToken);
        return response.data.data.accessToken;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout
      authService.logout();
      throw error;
    }
  },

  /**
   * Get user profile
   * @returns {Promise<Object>} User profile data
   */
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      if (error.response) {
        throw error.response.data || { message: 'Failed to get profile' };
      } else if (error.request) {
        throw { message: 'No response from server. Please check your connection.' };
      } else {
        throw { message: error.message || 'An unexpected error occurred' };
      }
    }
  },

  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Response data
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', { currentPassword, newPassword });
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      if (error.response) {
        throw error.response.data || { message: 'Failed to change password' };
      } else if (error.request) {
        throw { message: 'No response from server. Please check your connection.' };
      } else {
        throw { message: error.message || 'An unexpected error occurred' };
      }
    }
  }
};

export default authService; 