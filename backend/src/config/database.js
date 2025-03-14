/**
 * Database Configuration
 * Configuration for all database connections
 */

const { Pool } = require('pg');
const mongoose = require('mongoose');
const Redis = require('ioredis');

// PostgreSQL Configuration
const pgConfig = {
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'infracontrol',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  max: parseInt(process.env.POSTGRES_MAX_CONNECTIONS || '20'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// MongoDB Configuration
const mongoConfig = {
  uri: process.env.MONGO_URI || 'mongodb://localhost:27017/infracontrol',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
  }
};

// Redis Configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || '',
  db: parseInt(process.env.REDIS_DB || '0'),
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
};

// Create PostgreSQL pool
const pgPool = new Pool(pgConfig);

// Create MongoDB connection
const connectMongo = async () => {
  try {
    await mongoose.connect(mongoConfig.uri, mongoConfig.options);
    console.log('MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Create Redis client
const redisClient = new Redis(redisConfig);

// Redis connection events
redisClient.on('connect', () => {
  console.log('Redis client connected');
});

redisClient.on('error', (err) => {
  console.error('Redis client error:', err);
});

module.exports = {
  pgPool,
  connectMongo,
  redisClient,
  pgConfig,
  mongoConfig,
  redisConfig
}; 