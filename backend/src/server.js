const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// Import database configuration
const { pgPool, connectMongo, redisClient } = require('./config/database');
const { initializeModels } = require('./models');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user.routes');
const instanceRoutes = require('./routes/instance.routes');
const projectRoutes = require('./routes/project.routes');
const zoneRoutes = require('./routes/zone.routes');

// Create Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/instances', instanceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/zones', zoneRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: {
      postgres: pgPool ? 'connected' : 'disconnected',
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      redis: redisClient.status === 'ready' ? 'connected' : 'disconnected'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Initialize database connections and models
const initializeApp = async () => {
  try {
    // Connect to MongoDB
    await connectMongo();
    console.log('MongoDB connected successfully');
    
    // Test PostgreSQL connection
    const pgClient = await pgPool.connect();
    pgClient.release();
    console.log('PostgreSQL connected successfully');
    
    // Initialize models
    await initializeModels();
    console.log('Models initialized successfully');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
};

// Start the application
initializeApp();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle SIGTERM signal
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  pgPool.end();
  redisClient.quit();
  process.exit(0);
});

module.exports = app; 