/**
 * Zone Service
 * Handles all API calls related to zones
 */

import api from './api';

const zoneService = {
  /**
   * Get all zones with optional filters
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} List of zones
   */
  getAllZones: async (filters = {}) => {
    try {
      const response = await api.get('/zones', { params: filters });
      return response.data.data.zones;
    } catch (error) {
      console.error('Error fetching zones:', error);
      throw error;
    }
  },

  /**
   * Get zone by ID
   * @param {string} id - Zone ID
   * @returns {Promise<Object>} Zone details
   */
  getZoneById: async (id) => {
    try {
      const response = await api.get(`/zones/${id}`);
      return response.data.data.zone;
    } catch (error) {
      console.error(`Error fetching zone with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new zone
   * @param {Object} zoneData - Zone data
   * @returns {Promise<Object>} Created zone
   */
  createZone: async (zoneData) => {
    try {
      const response = await api.post('/zones', zoneData);
      return response.data.data.zone;
    } catch (error) {
      console.error('Error creating zone:', error);
      throw error;
    }
  },

  /**
   * Update a zone
   * @param {string} id - Zone ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated zone
   */
  updateZone: async (id, updateData) => {
    try {
      const response = await api.put(`/zones/${id}`, updateData);
      return response.data.data.zone;
    } catch (error) {
      console.error(`Error updating zone with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a zone
   * @param {string} id - Zone ID
   * @returns {Promise<boolean>} Success status
   */
  deleteZone: async (id) => {
    try {
      await api.delete(`/zones/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting zone with ID ${id}:`, error);
      throw error;
    }
  }
};

export default zoneService; 