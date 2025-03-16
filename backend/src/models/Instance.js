/**
 * Instance Model
 * Represents an infrastructure instance in the system
 */

const { pgPool } = require('../config/database');

// Create instances table if it doesn't exist
const createInstancesTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS instances (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      provider VARCHAR(50) NOT NULL,
      region VARCHAR(50) NOT NULL,
      instance_type VARCHAR(50) NOT NULL,
      status VARCHAR(20) NOT NULL,
      ip_address VARCHAR(45),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      owner_id INTEGER NOT NULL,
      config JSONB
    );
  `;
  
  try {
    await pgPool.query(createTableQuery);
    console.log('Instances table created or already exists');
    
    // Check if columns exist and add them if they don't
    const columnsToAdd = [
      { name: 'project_id', type: 'INTEGER' },
      { name: 'cpu', type: 'INTEGER' },
      { name: 'memory', type: 'INTEGER' },
      { name: 'disk', type: 'INTEGER' },
      { name: 'image', type: 'VARCHAR(255)' }
    ];
    
    for (const column of columnsToAdd) {
      try {
        // Check if column exists
        const checkColumnQuery = `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'instances' AND column_name = $1;
        `;
        const columnExists = await pgPool.query(checkColumnQuery, [column.name]);
        
        // Add column if it doesn't exist
        if (columnExists.rows.length === 0) {
          const addColumnQuery = `
            ALTER TABLE instances 
            ADD COLUMN IF NOT EXISTS ${column.name} ${column.type};
          `;
          await pgPool.query(addColumnQuery);
          console.log(`Added ${column.name} column to instances table`);
        }
      } catch (err) {
        console.error(`Error checking/adding column ${column.name}:`, err);
      }
    }
  } catch (error) {
    console.error('Error creating instances table:', error);
    throw error;
  }
};

// Instance model methods
const Instance = {
  // Initialize the table
  init: async () => {
    await createInstancesTable();
  },
  
  // Find all instances with optional filters
  findAll: async (filters = {}) => {
    let query = 'SELECT * FROM instances';
    const values = [];
    const conditions = [];
    
    // Apply filters if provided
    if (filters.name) {
      values.push(`%${filters.name}%`);
      conditions.push(`name ILIKE $${values.length}`);
    }
    
    if (filters.provider) {
      values.push(filters.provider);
      conditions.push(`provider = $${values.length}`);
    }
    
    if (filters.status) {
      values.push(filters.status);
      conditions.push(`status = $${values.length}`);
    }
    
    if (filters.owner_id) {
      values.push(filters.owner_id);
      conditions.push(`owner_id = $${values.length}`);
    }
    
    if (filters.region) {
      values.push(filters.region);
      conditions.push(`region = $${values.length}`);
    }
    
    if (filters.project && filters.project !== 'All Projects') {
      values.push(filters.project);
      conditions.push(`config->>'project' = $${values.length}`);
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
      console.error('Error finding instances:', error);
      throw error;
    }
  },
  
  // Find instance by ID
  findById: async (id) => {
    const query = 'SELECT * FROM instances WHERE id = $1';
    try {
      const result = await pgPool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error finding instance with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new instance
  create: async (instanceData) => {
    const { 
      name, 
      provider, 
      region, 
      zone, 
      instance_type, 
      type, 
      status, 
      ip_address, 
      owner_id, 
      project_id,
      cpu,
      memory,
      disk,
      image,
      config 
    } = instanceData;
    
    // Use zone as region if region is not provided
    const regionValue = region || zone;
    
    if (!regionValue) {
      throw new Error('Either region or zone must be provided');
    }
    
    const query = `
      INSERT INTO instances (
        name, 
        provider, 
        region, 
        instance_type, 
        status, 
        ip_address, 
        owner_id,
        project_id,
        cpu,
        memory,
        disk,
        image,
        config
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    
    const values = [
      name, 
      provider, 
      regionValue, 
      instance_type || type || 'vm', 
      status || 'provisioning', 
      ip_address || null, 
      owner_id || 1,
      project_id || null,
      cpu || 1,
      memory || 1,
      disk || 20,
      image || 'custom',
      config ? JSON.stringify(config) : '{}'
    ];
    
    try {
      const result = await pgPool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating instance:', error);
      throw error;
    }
  },
  
  // Update an instance
  update: async (id, updateData) => {
    const allowedFields = ['name', 'status', 'ip_address', 'config'];
    const updates = [];
    const values = [];
    
    // Build the SET clause for the update query
    Object.entries(updateData).forEach(([key, value]) => {
      if (allowedFields.includes(key)) {
        values.push(key === 'config' ? JSON.stringify(value) : value);
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
      UPDATE instances
      SET ${updates.join(', ')}
      WHERE id = $${values.length}
      RETURNING *
    `;
    
    try {
      const result = await pgPool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error updating instance with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Delete an instance
  delete: async (id) => {
    const query = 'DELETE FROM instances WHERE id = $1 RETURNING *';
    try {
      const result = await pgPool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error deleting instance with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Find instances by provider instance ID
  findByProviderInstanceId: async (providerInstanceId) => {
    const query = `SELECT * FROM instances WHERE config->>'providerInstanceId' = $1`;
    try {
      const result = await pgPool.query(query, [providerInstanceId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error finding instance with provider ID ${providerInstanceId}:`, error);
      throw error;
    }
  },
  
  // Get instance metrics
  getMetrics: async (id, metricType, timeRange = {}) => {
    // In a real implementation, this would query a time-series database
    // For now, we'll return placeholder data
    return {
      instanceId: id,
      metricType,
      data: []
    };
  }
};

module.exports = Instance; 