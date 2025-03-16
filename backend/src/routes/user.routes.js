const express = require('express');
const router = express.Router();
const { userService } = require('../services');

// Helper function to map database user to frontend format
const mapUserToFrontend = (user) => {
  // Format the user data for frontend
  return {
    id: user.id,
    name: user.first_name && user.last_name 
      ? `${user.first_name} ${user.last_name}` 
      : user.username,
    email: user.email,
    role: user.role,
    status: user.is_active ? 'active' : 'inactive',
    lastLogin: user.last_login,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    // Additional fields from settings JSON
    department: user.settings?.department || null,
    position: user.settings?.position || null,
    phone: user.settings?.phone || null,
    location: user.settings?.location || null
  };
};

// User controller using the user service
const userController = {
  getAllUsers: async (req, res) => {
    try {
      const filters = {
        username: req.query.username,
        email: req.query.email,
        role: req.query.role,
        is_active: req.query.status === 'active' ? true : 
                  req.query.status === 'inactive' ? false : undefined
      };
      
      const users = await userService.getAllUsers(filters);
      
      // Map users to frontend format
      const mappedUsers = users.map(mapUserToFrontend);
      
      res.status(200).json({ 
        status: 'success',
        data: {
          users: mappedUsers
        }
      });
    } catch (error) {
      console.error('Error getting all users:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve users'
      });
    }
  },
  
  getUserById: async (req, res) => {
    try {
      const user = await userService.getUserById(req.params.id);
      
      if (!user) {
        return res.status(404).json({
          status: 'fail',
          message: 'User not found'
        });
      }
      
      // Get user permissions
      const permissions = await userService.getUserPermissions(user.id);
      
      // Map user to frontend format
      const mappedUser = {
        ...mapUserToFrontend(user),
        permissions
      };
      
      res.status(200).json({ 
        status: 'success',
        data: {
          user: mappedUser
        }
      });
    } catch (error) {
      console.error(`Error getting user with ID ${req.params.id}:`, error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve user details'
      });
    }
  },
  
  createUser: async (req, res) => {
    try {
      // Validate required fields
      if (!req.body.username || !req.body.email || !req.body.password) {
        return res.status(400).json({
          status: 'fail',
          message: 'Username, email, and password are required'
        });
      }
      
      // Prepare settings object for additional fields
      const settings = {
        department: req.body.department,
        position: req.body.position,
        phone: req.body.phone,
        location: req.body.location
      };
      
      // Remove undefined values from settings
      Object.keys(settings).forEach(key => 
        settings[key] === undefined && delete settings[key]
      );
      
      const userData = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        first_name: req.body.first_name || '',
        last_name: req.body.last_name || '',
        role: req.body.role || 'user',
        settings: Object.keys(settings).length > 0 ? settings : undefined
      };
      
      const newUser = await userService.createUser(userData);
      
      // Map the new user to frontend format
      const mappedUser = mapUserToFrontend(newUser);
      
      res.status(201).json({ 
        status: 'success',
        message: 'User created successfully',
        data: {
          user: mappedUser
        }
      });
    } catch (error) {
      console.error('Error creating user:', error);
      
      // Handle duplicate username/email errors
      if (error.code === '23505') { // PostgreSQL unique violation code
        return res.status(409).json({
          status: 'fail',
          message: error.detail || 'Username or email already exists'
        });
      }
      
      res.status(500).json({
        status: 'error',
        message: 'Failed to create user'
      });
    }
  },
  
  updateUser: async (req, res) => {
    try {
      // Get the existing user to merge settings
      const existingUser = await userService.getUserById(req.params.id);
      
      if (!existingUser) {
        return res.status(404).json({
          status: 'fail',
          message: 'User not found'
        });
      }
      
      // Prepare settings object by merging existing settings with new ones
      const currentSettings = existingUser.settings || {};
      const newSettings = {
        ...currentSettings,
        department: req.body.department !== undefined ? req.body.department : currentSettings.department,
        position: req.body.position !== undefined ? req.body.position : currentSettings.position,
        phone: req.body.phone !== undefined ? req.body.phone : currentSettings.phone,
        location: req.body.location !== undefined ? req.body.location : currentSettings.location
      };
      
      const updateData = {
        username: req.body.username,
        email: req.body.email,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        role: req.body.role,
        is_active: req.body.is_active !== undefined ? req.body.is_active : 
                  (req.body.status === 'active' ? true : 
                  req.body.status === 'inactive' ? false : undefined),
        settings: newSettings
      };
      
      // Remove undefined fields
      Object.keys(updateData).forEach(key => 
        updateData[key] === undefined && delete updateData[key]
      );
      
      const updatedUser = await userService.updateUser(req.params.id, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({
          status: 'fail',
          message: 'User not found'
        });
      }
      
      // Map the updated user to frontend format
      const mappedUser = mapUserToFrontend(updatedUser);
      
      res.status(200).json({ 
        status: 'success',
        message: 'User updated successfully',
        data: {
          user: mappedUser
        }
      });
    } catch (error) {
      console.error(`Error updating user with ID ${req.params.id}:`, error);
      
      // Handle duplicate username/email errors
      if (error.code === '23505') { // PostgreSQL unique violation code
        return res.status(409).json({
          status: 'fail',
          message: error.detail || 'Username or email already exists'
        });
      }
      
      res.status(500).json({
        status: 'error',
        message: 'Failed to update user'
      });
    }
  },
  
  deleteUser: async (req, res) => {
    try {
      const result = await userService.deleteUser(req.params.id);
      
      if (!result) {
        return res.status(404).json({
          status: 'fail',
          message: 'User not found'
        });
      }
      
      res.status(200).json({ 
        status: 'success',
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error(`Error deleting user with ID ${req.params.id}:`, error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete user'
      });
    }
  },
  
  getUserActivity: async (req, res) => {
    try {
      const userId = req.params.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const user = await userService.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({
          status: 'fail',
          message: 'User not found'
        });
      }
      
      const activity = await userService.getUserActivity(userId, {
        page,
        limit
      });
      
      res.status(200).json({
        status: 'success',
        data: {
          activity,
          pagination: {
            page,
            limit,
            hasMore: activity.length === limit
          }
        }
      });
    } catch (error) {
      console.error(`Error getting activity for user with ID ${req.params.id}:`, error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve user activity'
      });
    }
  }
};

// User routes
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.get('/:id/activity', userController.getUserActivity);

module.exports = router; 