/**
 * Model Registry
 * Central point to access all database models
 */

const Instance = require('./Instance');
const User = require('./User');
const Event = require('./Event');
const Project = require('./Project');
const Zone = require('./Zone');

// Create default admin user if none exists
const createDefaultAdminUser = async () => {
  try {
    // Check if any users exist
    const users = await User.findAll();
    
    if (users.length === 0) {
      console.log('No users found, creating default admin user');
      
      // Create default admin user
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123', // This will be hashed by the User.create method
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin'
      });
      
      console.log('Default admin user created successfully');
    } else {
      console.log(`Found ${users.length} existing users`);
    }
  } catch (error) {
    console.error('Error creating default admin user:', error);
  }
};

// Initialize all models
const initializeModels = async () => {
  try {
    // Initialize PostgreSQL models
    await Instance.init();
    await User.init();
    await Project.init();
    await Zone.init();
    
    // Create default admin user if needed
    await createDefaultAdminUser();
    
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
  Project,
  Zone,
  initializeModels
}; 