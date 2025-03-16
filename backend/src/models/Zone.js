/**
 * Zone Model
 * Represents a deployment zone/region in the system
 */

const { pgPool } = require('../config/database');

// Create zones table if it doesn't exist
const createZonesTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS zones (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      provider VARCHAR(50) NOT NULL,
      region_code VARCHAR(50) NOT NULL,
      description TEXT,
      ip_address VARCHAR(255),
      ssh_user VARCHAR(100),
      ssh_port INTEGER,
      ssh_password VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE
    );
  `;
  
  try {
    await pgPool.query(createTableQuery);
    console.log('Zones table created or already exists');
    
    // Check if columns exist and add them if they don't
    const columnsToAdd = [
      { name: 'ip_address', type: 'VARCHAR(255)' },
      { name: 'ssh_user', type: 'VARCHAR(100)' },
      { name: 'ssh_port', type: 'INTEGER' },
      { name: 'ssh_password', type: 'VARCHAR(255)' }
    ];
    
    for (const column of columnsToAdd) {
      try {
        // Check if column exists
        const checkColumnQuery = `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'zones' AND column_name = $1;
        `;
        const columnExists = await pgPool.query(checkColumnQuery, [column.name]);
        
        // Add column if it doesn't exist
        if (columnExists.rows.length === 0) {
          const addColumnQuery = `
            ALTER TABLE zones 
            ADD COLUMN IF NOT EXISTS ${column.name} ${column.type};
          `;
          await pgPool.query(addColumnQuery);
          console.log(`Added ${column.name} column to zones table`);
        }
      } catch (err) {
        console.error(`Error checking/adding column ${column.name}:`, err);
      }
    }
  } catch (error) {
    console.error('Error creating zones table:', error);
    throw error;
  }
};

// Zone model methods
const Zone = {
  // Initialize the table
  init: async () => {
    await createZonesTable();
  },
  
  // Find all zones with optional filters
  findAll: async (filters = {}) => {
    let query = 'SELECT * FROM zones';
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
    
    if (filters.region_code) {
      values.push(filters.region_code);
      conditions.push(`region_code = $${values.length}`);
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
    query += ' ORDER BY provider ASC, name ASC';
    
    try {
      const result = await pgPool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error finding zones:', error);
      throw error;
    }
  },
  
  // Find zone by ID
  findById: async (id) => {
    const query = 'SELECT * FROM zones WHERE id = $1';
    try {
      const result = await pgPool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error finding zone with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new zone
  create: async (zoneData) => {
    const { 
      name, 
      provider, 
      region_code, 
      description,
      ip_address,
      ssh_user,
      ssh_port,
      ssh_password
    } = zoneData;
    
    const query = `
      INSERT INTO zones (
        name, 
        provider, 
        region_code, 
        description,
        ip_address,
        ssh_user,
        ssh_port,
        ssh_password
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      name, 
      provider, 
      region_code, 
      description,
      ip_address,
      ssh_user,
      ssh_port,
      ssh_password
    ];
    
    try {
      const result = await pgPool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating zone:', error);
      throw error;
    }
  },
  
  // Update a zone
  update: async (id, updateData) => {
    const allowedFields = [
      'name', 
      'provider', 
      'region_code', 
      'description', 
      'is_active',
      'ip_address',
      'ssh_user',
      'ssh_port',
      'ssh_password'
    ];
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
      UPDATE zones
      SET ${updates.join(', ')}
      WHERE id = $${values.length}
      RETURNING *
    `;
    
    try {
      const result = await pgPool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error updating zone with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a zone
  delete: async (id) => {
    const query = 'DELETE FROM zones WHERE id = $1 RETURNING *';
    try {
      const result = await pgPool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error deleting zone with ID ${id}:`, error);
      throw error;
    }
  }
};

module.exports = Zone; 