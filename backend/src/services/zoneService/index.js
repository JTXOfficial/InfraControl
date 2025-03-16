/**
 * Zone Service
 * Handles all operations related to zone management
 */

const { Zone } = require('../../models');

const zoneService = {
  /**
   * Get all zones with optional filtering
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} List of zones
   */
  getAllZones: async (filters = {}) => {
    try {
      return await Zone.findAll(filters);
    } catch (error) {
      console.error('Error getting all zones:', error);
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
      return await Zone.findById(id);
    } catch (error) {
      console.error(`Error getting zone with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new zone
   * @param {Object} zoneData - Zone creation data
   * @returns {Promise<Object>} Created zone
   */
  createZone: async (zoneData) => {
    try {
      return await Zone.create(zoneData);
    } catch (error) {
      console.error('Error creating zone:', error);
      throw error;
    }
  },

  /**
   * Update an existing zone
   * @param {string} id - Zone ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated zone
   */
  updateZone: async (id, updateData) => {
    try {
      return await Zone.update(id, updateData);
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
      const deletedZone = await Zone.delete(id);
      return !!deletedZone;
    } catch (error) {
      console.error(`Error deleting zone with ID ${id}:`, error);
      throw error;
    }
  }
};

module.exports = zoneService; 