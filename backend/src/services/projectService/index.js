/**
 * Project Service
 * Handles all operations related to project management
 */

const { Project } = require('../../models');

const projectService = {
  /**
   * Get all projects with optional filtering
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} List of projects
   */
  getAllProjects: async (filters = {}) => {
    try {
      return await Project.findAll(filters);
    } catch (error) {
      console.error('Error getting all projects:', error);
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
      return await Project.findById(id);
    } catch (error) {
      console.error(`Error getting project with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new project
   * @param {Object} projectData - Project creation data
   * @returns {Promise<Object>} Created project
   */
  createProject: async (projectData) => {
    try {
      return await Project.create(projectData);
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  /**
   * Update an existing project
   * @param {string} id - Project ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated project
   */
  updateProject: async (id, updateData) => {
    try {
      return await Project.update(id, updateData);
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
      const deletedProject = await Project.delete(id);
      return !!deletedProject;
    } catch (error) {
      console.error(`Error deleting project with ID ${id}:`, error);
      throw error;
    }
  }
};

module.exports = projectService; 