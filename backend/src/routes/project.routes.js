const express = require('express');
const router = express.Router();
const { projectService } = require('../services');

// Helper function to map database project to frontend format
const mapProjectToFrontend = (project) => {
  return {
    id: project.id,
    name: project.name,
    description: project.description || '',
    status: project.is_active ? 'active' : 'inactive',
    createdAt: project.created_at,
    updatedAt: project.updated_at
  };
};

// Project controller using the project service
const projectController = {
  getAllProjects: async (req, res) => {
    try {
      const filters = {
        name: req.query.name,
        owner_id: req.query.owner_id,
        is_active: req.query.status === 'active' ? true : 
                  req.query.status === 'inactive' ? false : undefined
      };
      
      const projects = await projectService.getAllProjects(filters);
      
      // Map projects to frontend format
      const mappedProjects = projects.map(mapProjectToFrontend);
      
      res.status(200).json({ 
        status: 'success',
        data: {
          projects: mappedProjects
        }
      });
    } catch (error) {
      console.error('Error getting all projects:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve projects'
      });
    }
  },
  
  getProjectById: async (req, res) => {
    try {
      const project = await projectService.getProjectById(req.params.id);
      
      if (!project) {
        return res.status(404).json({
          status: 'fail',
          message: 'Project not found'
        });
      }
      
      // Map project to frontend format
      const mappedProject = mapProjectToFrontend(project);
      
      res.status(200).json({ 
        status: 'success',
        data: {
          project: mappedProject
        }
      });
    } catch (error) {
      console.error(`Error getting project with ID ${req.params.id}:`, error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve project details'
      });
    }
  },
  
  createProject: async (req, res) => {
    try {
      // Validate required fields
      if (!req.body.name) {
        return res.status(400).json({
          status: 'fail',
          message: 'Project name is required'
        });
      }
      
      const projectData = {
        name: req.body.name,
        description: req.body.description,
        owner_id: req.body.owner_id || 1 // Default to owner_id 1 if not provided
      };
      
      const newProject = await projectService.createProject(projectData);
      
      // Map the new project to frontend format
      const mappedProject = mapProjectToFrontend(newProject);
      
      res.status(201).json({ 
        status: 'success',
        message: 'Project created successfully',
        data: {
          project: mappedProject
        }
      });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create project'
      });
    }
  },
  
  updateProject: async (req, res) => {
    try {
      const updateData = {
        name: req.body.name,
        description: req.body.description,
        is_active: req.body.status === 'active' ? true : 
                  req.body.status === 'inactive' ? false : undefined
      };
      
      // Remove undefined fields
      Object.keys(updateData).forEach(key => 
        updateData[key] === undefined && delete updateData[key]
      );
      
      const updatedProject = await projectService.updateProject(req.params.id, updateData);
      
      if (!updatedProject) {
        return res.status(404).json({
          status: 'fail',
          message: 'Project not found'
        });
      }
      
      // Map the updated project to frontend format
      const mappedProject = mapProjectToFrontend(updatedProject);
      
      res.status(200).json({ 
        status: 'success',
        message: 'Project updated successfully',
        data: {
          project: mappedProject
        }
      });
    } catch (error) {
      console.error(`Error updating project with ID ${req.params.id}:`, error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update project'
      });
    }
  },
  
  deleteProject: async (req, res) => {
    try {
      const result = await projectService.deleteProject(req.params.id);
      
      if (!result) {
        return res.status(404).json({
          status: 'fail',
          message: 'Project not found'
        });
      }
      
      res.status(200).json({ 
        status: 'success',
        message: 'Project deleted successfully'
      });
    } catch (error) {
      console.error(`Error deleting project with ID ${req.params.id}:`, error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete project'
      });
    }
  }
};

// Project routes
router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router; 