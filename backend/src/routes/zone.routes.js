const express = require('express');
const router = express.Router();
const { zoneService } = require('../services');
const { Client } = require('ssh2');

// Helper function to map database zone to frontend format
const mapZoneToFrontend = (zone) => {
  return {
    id: zone.id,
    name: zone.name,
    provider: zone.provider,
    regionCode: zone.region_code,
    description: zone.description || '',
    status: zone.is_active ? 'active' : 'inactive',
    ipAddress: zone.ip_address,
    sshUser: zone.ssh_user,
    sshPort: zone.ssh_port,
    createdAt: zone.created_at,
    updatedAt: zone.updated_at
  };
};

// Zone controller using the zone service
const zoneController = {
  getAllZones: async (req, res) => {
    try {
      const filters = {
        name: req.query.name,
        provider: req.query.provider,
        region_code: req.query.regionCode,
        is_active: req.query.status === 'active' ? true : 
                  req.query.status === 'inactive' ? false : undefined
      };
      
      const zones = await zoneService.getAllZones(filters);
      
      // Map zones to frontend format
      const mappedZones = zones.map(mapZoneToFrontend);
      
      res.status(200).json({ 
        status: 'success',
        data: {
          zones: mappedZones
        }
      });
    } catch (error) {
      console.error('Error getting all zones:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve zones'
      });
    }
  },
  
  getZoneById: async (req, res) => {
    try {
      const zone = await zoneService.getZoneById(req.params.id);
      
      if (!zone) {
        return res.status(404).json({
          status: 'fail',
          message: 'Zone not found'
        });
      }
      
      // Map zone to frontend format
      const mappedZone = mapZoneToFrontend(zone);
      
      res.status(200).json({ 
        status: 'success',
        data: {
          zone: mappedZone
        }
      });
    } catch (error) {
      console.error(`Error getting zone with ID ${req.params.id}:`, error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve zone details'
      });
    }
  },
  
  createZone: async (req, res) => {
    try {
      // Validate required fields
      if (!req.body.name || !req.body.provider || !req.body.regionCode) {
        return res.status(400).json({
          status: 'fail',
          message: 'Zone name, provider, and region code are required'
        });
      }
      
      const zoneData = {
        name: req.body.name,
        provider: req.body.provider,
        region_code: req.body.regionCode,
        description: req.body.description,
        ip_address: req.body.ipAddress,
        ssh_user: req.body.sshUser,
        ssh_port: req.body.sshPort,
        ssh_password: req.body.sshPassword
      };
      
      const newZone = await zoneService.createZone(zoneData);
      
      // Map the new zone to frontend format
      const mappedZone = mapZoneToFrontend(newZone);
      
      res.status(201).json({ 
        status: 'success',
        message: 'Zone created successfully',
        data: {
          zone: mappedZone
        }
      });
    } catch (error) {
      console.error('Error creating zone:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create zone'
      });
    }
  },
  
  updateZone: async (req, res) => {
    try {
      const updateData = {
        name: req.body.name,
        provider: req.body.provider,
        region_code: req.body.regionCode,
        description: req.body.description,
        is_active: req.body.status === 'active' ? true : 
                  req.body.status === 'inactive' ? false : undefined,
        ip_address: req.body.ipAddress,
        ssh_user: req.body.sshUser,
        ssh_port: req.body.sshPort,
        ssh_password: req.body.sshPassword
      };
      
      // Remove undefined fields
      Object.keys(updateData).forEach(key => 
        updateData[key] === undefined && delete updateData[key]
      );
      
      const updatedZone = await zoneService.updateZone(req.params.id, updateData);
      
      if (!updatedZone) {
        return res.status(404).json({
          status: 'fail',
          message: 'Zone not found'
        });
      }
      
      // Map the updated zone to frontend format
      const mappedZone = mapZoneToFrontend(updatedZone);
      
      res.status(200).json({ 
        status: 'success',
        message: 'Zone updated successfully',
        data: {
          zone: mappedZone
        }
      });
    } catch (error) {
      console.error(`Error updating zone with ID ${req.params.id}:`, error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update zone'
      });
    }
  },
  
  deleteZone: async (req, res) => {
    try {
      const result = await zoneService.deleteZone(req.params.id);
      
      if (!result) {
        return res.status(404).json({
          status: 'fail',
          message: 'Zone not found'
        });
      }
      
      res.status(200).json({ 
        status: 'success',
        message: 'Zone deleted successfully'
      });
    } catch (error) {
      console.error(`Error deleting zone with ID ${req.params.id}:`, error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete zone'
      });
    }
  }
};

// Zone routes
router.get('/', zoneController.getAllZones);
router.get('/:id', zoneController.getZoneById);
router.post('/', zoneController.createZone);
router.put('/:id', zoneController.updateZone);
router.delete('/:id', zoneController.deleteZone);

// Validate SSH connection for self-hosted zones
router.post('/validate-connection', async (req, res) => {
  try {
    const { ipAddress, sshUser, sshPort, sshPassword } = req.body;
    
    if (!ipAddress) {
      return res.status(400).json({ success: false, message: 'IP address is required' });
    }
    
    // Default values if not provided
    const user = sshUser || 'admin';
    const port = parseInt(sshPort, 10) || 22;
    
    // Create a new SSH client
    const conn = new Client();
    
    // Set a timeout for the connection attempt
    const connectionTimeout = setTimeout(() => {
      if (conn) {
        conn.end();
        return res.json({ 
          success: false, 
          message: 'Connection timed out. Please verify the IP address is reachable.' 
        });
      }
    }, 10000); // 10 second timeout
    
    // Handle connection errors
    conn.on('error', (err) => {
      clearTimeout(connectionTimeout);
      console.error('SSH connection error:', err);
      return res.json({ 
        success: false, 
        message: `Connection failed: ${err.message}` 
      });
    });
    
    // Handle successful connection
    conn.on('ready', () => {
      clearTimeout(connectionTimeout);
      console.log('SSH connection successful');
      
      // Execute a simple command to verify we can run commands
      conn.exec('echo "Connection successful"', (err, stream) => {
        if (err) {
          conn.end();
          return res.json({ 
            success: false, 
            message: `Connected but failed to execute command: ${err.message}` 
          });
        }
        
        stream.on('close', (code) => {
          conn.end();
          if (code === 0) {
            return res.json({ success: true, message: 'Connection successful' });
          } else {
            return res.json({ 
              success: false, 
              message: `Command exited with code ${code}` 
            });
          }
        });
        
        stream.on('data', (data) => {
          console.log('STDOUT: ' + data);
        });
        
        stream.stderr.on('data', (data) => {
          console.error('STDERR: ' + data);
        });
      });
    });
    
    // Connect to the server
    const connectionConfig = {
      host: ipAddress,
      port: port,
      username: user,
      readyTimeout: 8000, // 8 seconds to establish connection
    };
    
    // Add authentication method based on what's provided
    if (sshPassword) {
      connectionConfig.password = sshPassword;
    } else {
      // Use agent-based authentication if no password is provided
      // This will use the SSH keys from the user's SSH agent
      connectionConfig.agent = process.env.SSH_AUTH_SOCK;
      
      // Fallback to default key locations if agent isn't available
      connectionConfig.tryKeyboard = false;
    }
    
    // Attempt to connect
    conn.connect(connectionConfig);
    
  } catch (error) {
    console.error('Error validating connection:', error);
    res.status(500).json({ success: false, message: 'Server error validating connection' });
  }
});

module.exports = router; 