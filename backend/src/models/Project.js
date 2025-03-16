/**
 * Project Model
 * Represents a project in the system
 */

const { pgPool } = require('../config/database');

// Create projects table if it doesn't exist
const createProjectsTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      owner_id INTEGER NOT NULL,
      is_active BOOLEAN DEFAULT TRUE
    );
  `;
  
  try {
    await pgPool.query(createTableQuery);
    console.log('Projects table created or already exists');
  } catch (error) {
    console.error('Error creating projects table:', error);
    throw error;
  }
};

// Project model methods
const Project = {
  // Initialize the table
  init: async () => {
    await createProjectsTable();
  },
  
  // Find all projects with optional filters
  findAll: async (filters = {}) => {
    let query = 'SELECT * FROM projects';
    const values = [];
    const conditions = [];
    
    // Apply filters if provided
    if (filters.name) {
      values.push(`%${filters.name}%`);
      conditions.push(`name ILIKE $${values.length}`);
    }
    
    if (filters.owner_id) {
      values.push(filters.owner_id);
      conditions.push(`owner_id = $${values.length}`);
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
    query += ' ORDER BY name ASC';
    
    try {
      const result = await pgPool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error finding projects:', error);
      throw error;
    }
  },
  
  // Find project by ID
  findById: async (id) => {
    const query = 'SELECT * FROM projects WHERE id = $1';
    try {
      const result = await pgPool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error finding project with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new project
  create: async (projectData) => {
    const { name, description, owner_id } = projectData;
    
    const query = `
      INSERT INTO projects (name, description, owner_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const values = [name, description, owner_id];
    
    try {
      const result = await pgPool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },
  
  // Update a project
  update: async (id, updateData) => {
    const allowedFields = ['name', 'description', 'is_active'];
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
      UPDATE projects
      SET ${updates.join(', ')}
      WHERE id = $${values.length}
      RETURNING *
    `;
    
    try {
      const result = await pgPool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error updating project with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a project
  delete: async (id) => {
    const query = 'DELETE FROM projects WHERE id = $1 RETURNING *';
    try {
      const result = await pgPool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error deleting project with ID ${id}:`, error);
      throw error;
    }
  }
};

module.exports = Project; 