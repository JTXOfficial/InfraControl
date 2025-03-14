const express = require('express');
const router = express.Router();

// Placeholder for user controller (will be implemented later)
const userController = {
  getAllUsers: (req, res) => {
    res.status(200).json({ 
      status: 'success',
      data: {
        users: [
          { id: '1', name: 'User 1', email: 'user1@example.com', role: 'admin' },
          { id: '2', name: 'User 2', email: 'user2@example.com', role: 'user' }
        ]
      }
    });
  },
  getUserById: (req, res) => {
    res.status(200).json({ 
      status: 'success',
      data: {
        user: { id: req.params.id, name: 'User 1', email: 'user1@example.com', role: 'admin' }
      }
    });
  },
  createUser: (req, res) => {
    res.status(201).json({ 
      status: 'success',
      message: 'User created successfully',
      data: {
        user: {
          id: '3',
          name: req.body.name,
          email: req.body.email,
          role: req.body.role || 'user'
        }
      }
    });
  },
  updateUser: (req, res) => {
    res.status(200).json({ 
      status: 'success',
      message: 'User updated successfully',
      data: {
        user: {
          id: req.params.id,
          name: req.body.name,
          email: req.body.email,
          role: req.body.role
        }
      }
    });
  },
  deleteUser: (req, res) => {
    res.status(200).json({ 
      status: 'success',
      message: 'User deleted successfully'
    });
  }
};

// User routes
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router; 