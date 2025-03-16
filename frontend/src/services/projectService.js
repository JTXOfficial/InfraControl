/**
 * Project Service
 * Handles all API calls related to projects
 */

import api from './api';

const projectService = {
  /**
   * Get all projects with optional filters
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} List of projects
   */
  getAllProjects: async (filters = {}) => {
    try {
      const response = await api.get('/projects', { params: filters });
      return response.data.data.projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  /**
   * Get project by ID
   * @param {string} id - Project ID
   * @returns {Promise<Object>} Project details
   */
  getProjectById: async (id) => {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data.data.project;
    } catch (error) {
      console.error(`Error fetching project with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new project
   * @param {Object} projectData - Project data
   * @returns {Promise<Object>} Created project
   */
  createProject: async (projectData) => {
    try {
      const response = await api.post('/projects', projectData);
      return response.data.data.project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  /**
   * Update a project
   * @param {string} id - Project ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated project
   */
  updateProject: async (id, updateData) => {
    try {
      const response = await api.put(`/projects/${id}`, updateData);
      return response.data.data.project;
    } catch (error) {
      console.error(`Error updating project with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a project
   * @param {string} id - Project ID
   * @returns {Promise<boolean>} Success status
   */
  deleteProject: async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting project with ID ${id}:`, error);
      throw error;
    }
  }
};

export default projectService; 