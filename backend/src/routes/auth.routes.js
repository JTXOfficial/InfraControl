const express = require('express');
const router = express.Router();

// Placeholder for auth controller (will be implemented later)
const authController = {
  login: (req, res) => {
    res.status(200).json({ 
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: '1',
          email: req.body.email,
          name: 'Test User'
        },
        token: 'sample-jwt-token'
      }
    });
  },
  register: (req, res) => {
    res.status(201).json({ 
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: {
          id: '1',
          email: req.body.email,
          name: req.body.name
        }
      }
    });
  },
  logout: (req, res) => {
    res.status(200).json({ 
      status: 'success',
      message: 'Logged out successfully'
    });
  }
};

// Auth routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);

module.exports = router; 