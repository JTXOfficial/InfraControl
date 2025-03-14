/**
 * User Model
 * Represents a user in the system
 */

const { pgPool } = require('../config/database');
const bcrypt = require('bcrypt');

// Create users table if it doesn't exist
const createUsersTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      role VARCHAR(20) NOT NULL DEFAULT 'user',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP WITH TIME ZONE,
      settings JSONB DEFAULT '{}'::jsonb
    );
  `;
  
  try {
    await pgPool.query(createTableQuery);
    console.log('Users table created or already exists');
  } catch (error) {
    console.error('Error creating users table:', error);
    throw error;
  }
};

// Create API keys table if it doesn't exist
const createApiKeysTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS api_keys (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      key_name VARCHAR(100) NOT NULL,
      api_key VARCHAR(255) UNIQUE NOT NULL,
      permissions JSONB DEFAULT '{}'::jsonb,
      expires_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      last_used TIMESTAMP WITH TIME ZONE,
      CONSTRAINT unique_key_name_per_user UNIQUE (user_id, key_name)
    );
  `;
  
  try {
    await pgPool.query(createTableQuery);
    console.log('API keys table created or already exists');
  } catch (error) {
    console.error('Error creating API keys table:', error);
    throw error;
  }
};

// User model methods
const User = {
  // Initialize the tables
  init: async () => {
    await createUsersTable();
    await createApiKeysTable();
  },
  
  // Find all users with optional filters
  findAll: async (filters = {}) => {
    let query = 'SELECT id, username, email, first_name, last_name, role, is_active, created_at, updated_at, last_login FROM users';
    const values = [];
    const conditions = [];
    
    // Apply filters if provided
    if (filters.username) {
      values.push(`%${filters.username}%`);
      conditions.push(`username ILIKE $${values.length}`);
    }
    
    if (filters.email) {
      values.push(`%${filters.email}%`);
      conditions.push(`email ILIKE $${values.length}`);
    }
    
    if (filters.role) {
      values.push(filters.role);
      conditions.push(`role = $${values.length}`);
    }
    
    if (filters.is_active !== undefined) {
      values.push(filters.is_active);
      conditions.push(`is_active = $${values.length}`);
    }
    
    // Add WHERE clause if conditions exist
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Add ordering
    query += ' ORDER BY created_at DESC';
    
    try {
      const result = await pgPool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error finding users:', error);
      throw error;
    }
  },
  
  // Find user by ID
  findById: async (id) => {
    const query = 'SELECT id, username, email, first_name, last_name, role, is_active, created_at, updated_at, last_login, settings FROM users WHERE id = $1';
    try {
      const result = await pgPool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error finding user with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Find user by username
  findByUsername: async (username) => {
    const query = 'SELECT * FROM users WHERE username = $1';
    try {
      const result = await pgPool.query(query, [username]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error finding user with username ${username}:`, error);
      throw error;
    }
  },
  
  // Find user by email
  findByEmail: async (email) => {
    const query = 'SELECT * FROM users WHERE email = $1';
    try {
      const result = await pgPool.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error finding user with email ${email}:`, error);
      throw error;
    }
  },
  
  // Create a new user
  create: async (userData) => {
    const { username, email, password, first_name, last_name, role = 'user' } = userData;
    
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO users (username, email, password, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, username, email, first_name, last_name, role, is_active, created_at
    `;
    
    const values = [username, email, hashedPassword, first_name, last_name, role];
    
    try {
      const result = await pgPool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  
  // Update a user
  update: async (id, updateData) => {
    const allowedFields = ['username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'settings'];
    const updates = [];
    const values = [];
    
    // Build the SET clause for the update query
    Object.entries(updateData).forEach(([key, value]) => {
      if (allowedFields.includes(key)) {
        values.push(value);
        updates.push(`${key} = $${values.length}`);
      }
    });
    
    // Add updated_at timestamp
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    
    // If no valid fields to update, return null
    if (updates.length === 0) {
      return null;
    }
    
    // Add the ID as the last parameter
    values.push(id);
    
    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${values.length}
      RETURNING id, username, email, first_name, last_name, role, is_active, created_at, updated_at
    `;
    
    try {
      const result = await pgPool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error updating user with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Update user password
  updatePassword: async (id, newPassword) => {
    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    const query = `
      UPDATE users
      SET password = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id
    `;
    
    try {
      const result = await pgPool.query(query, [hashedPassword, id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error updating password for user with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a user
  delete: async (id) => {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id, username, email';
    try {
      const result = await pgPool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Verify user password
  verifyPassword: async (user, password) => {
    return bcrypt.compare(password, user.password);
  },
  
  // Update last login timestamp
  updateLastLogin: async (id) => {
    const query = `
      UPDATE users
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `;
    
    try {
      await pgPool.query(query, [id]);
      return true;
    } catch (error) {
      console.error(`Error updating last login for user with ID ${id}:`, error);
      return false;
    }
  },
  
  // API Key methods
  
  // Create a new API key for a user
  createApiKey: async (userId, keyName, permissions = {}, expiresAt = null) => {
    // Generate a random API key
    const apiKey = require('crypto').randomBytes(32).toString('hex');
    
    const query = `
      INSERT INTO api_keys (user_id, key_name, api_key, permissions, expires_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, key_name, api_key, permissions, expires_at, created_at
    `;
    
    const values = [userId, keyName, apiKey, permissions, expiresAt];
    
    try {
      const result = await pgPool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error(`Error creating API key for user with ID ${userId}:`, error);
      throw error;
    }
  },
  
  // Get all API keys for a user
  getApiKeys: async (userId) => {
    const query = `
      SELECT id, key_name, permissions, expires_at, created_at, last_used
      FROM api_keys
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    
    try {
      const result = await pgPool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error(`Error getting API keys for user with ID ${userId}:`, error);
      throw error;
    }
  },
  
  // Delete an API key
  deleteApiKey: async (keyId, userId) => {
    const query = 'DELETE FROM api_keys WHERE id = $1 AND user_id = $2 RETURNING id';
    try {
      const result = await pgPool.query(query, [keyId, userId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error deleting API key with ID ${keyId}:`, error);
      throw error;
    }
  },
  
  // Validate an API key
  validateApiKey: async (apiKey) => {
    const query = `
      SELECT a.id, a.user_id, a.permissions, a.expires_at, u.username, u.role
      FROM api_keys a
      JOIN users u ON a.user_id = u.id
      WHERE a.api_key = $1 AND (a.expires_at IS NULL OR a.expires_at > CURRENT_TIMESTAMP)
    `;
    
    try {
      const result = await pgPool.query(query, [apiKey]);
      if (result.rows.length === 0) {
        return null;
      }
      
      // Update last_used timestamp
      await pgPool.query('UPDATE api_keys SET last_used = CURRENT_TIMESTAMP WHERE id = $1', [result.rows[0].id]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error validating API key:', error);
      throw error;
    }
  }
};

module.exports = User; 