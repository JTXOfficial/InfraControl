/**
 * Model Registry
 * Central point to access all database models
 */

const Instance = require('./Instance');
const User = require('./User');
const Event = require('./Event');

// Initialize all models
const initializeModels = async () => {
  try {
    // Initialize PostgreSQL models
    await Instance.init();
    await User.init();
    
    console.log('All models initialized successfully');
  } catch (error) {
    console.error('Error initializing models:', error);
    throw error;
  }
};

module.exports = {
  Instance,
  User,
  Event,
  initializeModels
}; 