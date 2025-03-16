const express = require('express');
const router = express.Router();
const { instanceService } = require('../services');
const { Client } = require('ssh2');
const WebSocket = require('ws');

// Helper function to map database instance to frontend format
const mapInstanceToFrontend = (instance) => {
  // Extract values from config if available
  const config = instance.config || {};
  
  return {
    id: instance.id,
    name: instance.name,
    status: instance.status,
    provider: instance.provider,
    // Map region to zone
    zone: instance.region,
    // Map ip_address to ip
    ip: instance.ip_address || '',
    // Extract project from config or use default
    project: config.project || 'Default',
    projectName: config.projectName || 'Default Project',
    // Extract other fields from config or use defaults
    stack: config.stack || 'N/A',
    cpu: config.cpu || 'N/A',
    memory: config.memory || 'N/A',
    disk: config.disk ? `${config.disk} GB` : 'N/A',
    url: config.url || '',
    createdAt: instance.created_at,
    updatedAt: instance.updated_at
  };
};

// Instance controller using the instance service
const instanceController = {
  getAllInstances: async (req, res) => {
    try {
      const filters = {
        name: req.query.name,
        provider: req.query.provider,
        status: req.query.status,
        owner_id: req.query.owner_id
      };
      
      const instances = await instanceService.getAllInstances(filters);
      
      // Map instances to frontend format
      const mappedInstances = instances.map(mapInstanceToFrontend);
      
      res.status(200).json({ 
        status: 'success',
        data: {
          instances: mappedInstances
        }
      });
    } catch (error) {
      console.error('Error getting all instances:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve instances'
      });
    }
  },
  
  getInstanceById: async (req, res) => {
    try {
      const instance = await instanceService.getInstanceById(req.params.id);
      
      if (!instance) {
        return res.status(404).json({
          status: 'fail',
          message: 'Instance not found'
        });
      }
      
      // Map instance to frontend format
      const mappedInstance = mapInstanceToFrontend(instance);
      
      // Get metrics for the instance if available
      // This could be expanded to include more detailed metrics
      const metrics = {
        cpu: 45, // Placeholder values until real metrics are implemented
        memory: 62,
        disk: 30
      };
      
      res.status(200).json({ 
        status: 'success',
        data: {
          instance: {
            ...mappedInstance,
            metrics
          }
        }
      });
    } catch (error) {
      console.error(`Error getting instance with ID ${req.params.id}:`, error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve instance details'
      });
    }
  },
  
  createInstance: async (req, res) => {
    try {
      // Get CPU and memory directly from request
      const cpu = req.body.cpu || 1;
      const memory = req.body.memory || 1;
      
      // Ensure we have either zone or region
      if (!req.body.zone && !req.body.region) {
        return res.status(400).json({
          status: 'fail',
          message: 'Either zone or region must be provided'
        });
      }
      
      // For self-hosted instances, get the zone details to retrieve SSH credentials
      let zoneDetails = null;
      if (req.body.provider.toUpperCase() === 'SELFHOSTED' && req.body.zone) {
        try {
          // Import the Zone model
          const { Zone } = require('../models');
          
          // Find the zone by region code
          const zones = await Zone.findAll({ region_code: req.body.zone });
          zoneDetails = zones.find(z => z.region_code === req.body.zone);
          
          if (!zoneDetails) {
            return res.status(400).json({
              status: 'fail',
              message: `Zone with region code ${req.body.zone} not found`
            });
          }
          
          console.log(`Found zone details for ${req.body.zone}:`, {
            name: zoneDetails.name,
            provider: zoneDetails.provider,
            hasIpAddress: !!zoneDetails.ip_address,
            hasSshUser: !!zoneDetails.ssh_user,
            hasSshPassword: !!zoneDetails.ssh_password
          });
        } catch (zoneError) {
          console.error('Error fetching zone details:', zoneError);
        }
      }
      
      const instanceData = {
        name: req.body.name,
        provider: req.body.provider,
        region: req.body.region,
        zone: req.body.zone,
        instance_type: 'custom', // Use 'custom' as the instance type
        status: 'provisioning',
        ip_address: req.body.ip_address || (zoneDetails ? zoneDetails.ip_address : ''),
        owner_id: req.body.owner_id || 1, // Default to owner_id 1 if not provided
        project_id: req.body.project,
        cpu: cpu,
        memory: memory,
        disk: req.body.disk || 50,
        image: req.body.image,
        config: {
          ...(req.body.config || {}),
          // Add additional fields needed by frontend
          project: req.body.project,
          projectName: req.body.projectName,
          cpu: cpu,
          memory: `${memory} GB`,
          disk: req.body.disk || 50,
          image: req.body.image,
          vpc: req.body.vpc,
          subnet: req.body.subnet,
          security_group: req.body.security_group,
          volume_type: req.body.volume_type,
          stack: req.body.stack || 'Linux',
          // Add SSH credentials from zone if available
          sshUser: zoneDetails ? zoneDetails.ssh_user : req.body.config?.sshUser,
          sshPort: zoneDetails ? zoneDetails.ssh_port : req.body.config?.sshPort,
          sshPassword: zoneDetails ? zoneDetails.ssh_password : req.body.config?.sshPassword
        }
      };
      
      const newInstance = await instanceService.createInstance(instanceData);
      
      // Map the new instance to frontend format
      const mappedInstance = mapInstanceToFrontend(newInstance);
      
      res.status(201).json({ 
        status: 'success',
        message: 'Instance created successfully',
        data: {
          instance: mappedInstance
        }
      });
    } catch (error) {
      console.error('Error creating instance:', error);
      
      // Handle specific error types
      if (error.message && (
          error.message.includes('credentials are not properly configured') ||
          error.message.includes('Invalid') ||
          error.message.includes('Unsupported provider')
      )) {
        // This is a credential validation error
        return res.status(400).json({
          status: 'error',
          message: `Cloud provider error: ${error.message}`,
          errorType: 'credential_validation'
        });
      }
      
      res.status(500).json({
        status: 'error',
        message: 'Failed to create instance'
      });
    }
  },
  
  updateInstance: async (req, res) => {
    try {
      console.log('Updating instance with data:', req.body);
      
      // Ensure config is properly formatted
      let config = req.body.config;
      if (config && typeof config === 'string') {
        try {
          config = JSON.parse(config);
        } catch (e) {
          console.error('Error parsing config JSON:', e);
          // Keep the original string if parsing fails
        }
      }
      
      // Get the current instance to ensure we have a valid status
      const currentInstance = await instanceService.getInstanceById(req.params.id);
      if (!currentInstance) {
        return res.status(404).json({
          status: 'fail',
          message: 'Instance not found'
        });
      }
      
      const updateData = {
        name: req.body.name,
        // Use the provided status or fall back to the current status
        status: req.body.status || currentInstance.status || 'unknown',
        ip_address: req.body.ip_address,
        config: config
      };
      
      console.log('Processed update data:', updateData);
      
      const updatedInstance = await instanceService.updateInstance(req.params.id, updateData);
      
      if (!updatedInstance) {
        return res.status(404).json({
          status: 'fail',
          message: 'Instance not found'
        });
      }
      
      // Map the updated instance to frontend format
      const mappedInstance = mapInstanceToFrontend(updatedInstance);
      
      res.status(200).json({ 
        status: 'success',
        message: 'Instance updated successfully',
        data: {
          instance: mappedInstance
        }
      });
    } catch (error) {
      console.error(`Error updating instance with ID ${req.params.id}:`, error);
      res.status(500).json({
        status: 'error',
        message: `Failed to update instance: ${error.message}`
      });
    }
  },
  
  deleteInstance: async (req, res) => {
    try {
      const result = await instanceService.deleteInstance(req.params.id);
      
      if (!result) {
        return res.status(404).json({
          status: 'fail',
          message: 'Instance not found'
        });
      }
      
      res.status(200).json({ 
        status: 'success',
        message: 'Instance deleted successfully'
      });
    } catch (error) {
      console.error(`Error deleting instance with ID ${req.params.id}:`, error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete instance'
      });
    }
  },
  
  startInstance: async (req, res) => {
    try {
      const updatedInstance = await instanceService.changeInstanceState(req.params.id, 'start');
      
      if (!updatedInstance) {
        return res.status(404).json({
          status: 'error',
          message: 'Instance not found'
        });
      }
      
      // Set a timeout to update the instance status after start
      setTimeout(async () => {
        try {
          await instanceService.updateInstanceStatusAfterStart(req.params.id);
        } catch (error) {
          console.error(`Error updating instance status after start for ID ${req.params.id}:`, error);
        }
      }, 30000); // Wait 30 seconds for the start to complete
      
      // Map the instance to frontend format
      const mappedInstance = mapInstanceToFrontend(updatedInstance);
      
      res.status(200).json({ 
        status: 'success',
        message: 'Instance started successfully',
        data: mappedInstance
      });
    } catch (error) {
      console.error(`Error starting instance with ID ${req.params.id}:`, error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to start instance'
      });
    }
  },
  
  stopInstance: async (req, res) => {
    try {
      const updatedInstance = await instanceService.changeInstanceState(req.params.id, 'stop');
      
      if (!updatedInstance) {
        return res.status(404).json({
          status: 'error',
          message: 'Instance not found'
        });
      }
      
      // Set a timeout to update the instance status after stop
      setTimeout(async () => {
        try {
          await instanceService.updateInstanceStatusAfterStop(req.params.id);
        } catch (error) {
          console.error(`Error updating instance status after stop for ID ${req.params.id}:`, error);
        }
      }, 30000); // Wait 30 seconds for the stop to complete
      
      // Map the instance to frontend format
      const mappedInstance = mapInstanceToFrontend(updatedInstance);
      
      res.status(200).json({ 
        status: 'success',
        message: 'Instance stopped successfully',
        data: mappedInstance
      });
    } catch (error) {
      console.error(`Error stopping instance with ID ${req.params.id}:`, error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to stop instance'
      });
    }
  },
  
  restartInstance: async (req, res) => {
    try {
      const updatedInstance = await instanceService.changeInstanceState(req.params.id, 'restart');
      
      if (!updatedInstance) {
        return res.status(404).json({
          status: 'error',
          message: 'Instance not found'
        });
      }
      
      // Set a timeout to update the instance status after restart
      setTimeout(async () => {
        try {
          await instanceService.updateInstanceStatusAfterRestart(req.params.id);
        } catch (error) {
          console.error(`Error updating instance status after restart for ID ${req.params.id}:`, error);
        }
      }, 30000); // Wait 30 seconds for the restart to complete
      
      // Map the instance to frontend format
      const mappedInstance = mapInstanceToFrontend(updatedInstance);
      
      res.status(200).json({
        status: 'success',
        message: 'Instance restarted successfully',
        data: mappedInstance
      });
    } catch (error) {
      console.error(`Error restarting instance with ID ${req.params.id}:`, error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to restart instance'
      });
    }
  },
  
  forceStopInstance: async (req, res) => {
    try {
      const updatedInstance = await instanceService.changeInstanceState(req.params.id, 'force-stop');
      
      if (!updatedInstance) {
        return res.status(404).json({
          status: 'error',
          message: 'Instance not found'
        });
      }
      
      // Set a timeout to update the instance status after force stop
      setTimeout(async () => {
        try {
          await instanceService.updateInstanceStatusAfterStop(req.params.id);
        } catch (error) {
          console.error(`Error updating instance status after force stop for ID ${req.params.id}:`, error);
        }
      }, 5000); // Wait 5 seconds for the force stop to complete
      
      // Map the instance to frontend format
      const mappedInstance = mapInstanceToFrontend(updatedInstance);
      
      res.status(200).json({ 
        status: 'success',
        message: 'Instance force stopped successfully',
        data: mappedInstance
      });
    } catch (error) {
      console.error(`Error force stopping instance with ID ${req.params.id}:`, error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to force stop instance'
      });
    }
  },
  
  checkInstanceStatus: async (req, res) => {
    try {
      const isRunning = await instanceService.checkVmStatus(req.params.id);
      
      const instance = await instanceService.getInstanceById(req.params.id);
      
      if (!instance) {
        return res.status(404).json({
          status: 'error',
          message: 'Instance not found'
        });
      }
      
      // Map the instance to frontend format
      const mappedInstance = mapInstanceToFrontend(instance);
      
      res.status(200).json({
        status: 'success',
        data: {
          instance: mappedInstance,
          isRunning: isRunning
        }
      });
    } catch (error) {
      console.error(`Error checking status for instance with ID ${req.params.id}:`, error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to check instance status'
      });
    }
  },
  
  sshConnect: async (req, res) => {
    try {
      const instance = await instanceService.getInstanceById(req.params.id);
      
      if (!instance) {
        return res.status(404).json({
          status: 'error',
          message: 'Instance not found'
        });
      }
      
      // Get SSH connection details
      const sshDetails = await instanceService.getSSHConnectionDetails(req.params.id);
      
      console.log('SSH connection details:', {
        host: sshDetails.host,
        port: sshDetails.port,
        username: sshDetails.username,
        authMethod: sshDetails.authMethod,
        vmName: sshDetails.vmName,
        status: sshDetails.status
      });
      
      res.status(200).json({
        status: 'success',
        message: 'SSH connection details retrieved successfully',
        data: {
          sshConnection: sshDetails
        }
      });
    } catch (error) {
      console.error(`Error getting SSH connection details for instance with ID ${req.params.id}:`, error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get SSH connection details'
      });
    }
  },
  
  cleanupOrphanedVMs: async (req, res) => {
    try {
      const { hostIp, sshUser, sshPassword, sshPort } = req.body;
      
      if (!hostIp) {
        return res.status(400).json({
          status: 'error',
          message: 'Host IP is required'
        });
      }
      
      // Create SSH connection config
      const sshConfig = {
        host: hostIp,
        port: sshPort || 22,
        username: sshUser || 'root',
        readyTimeout: 10000
      };
      
      // Add authentication method
      if (sshPassword) {
        sshConfig.password = sshPassword;
      } else {
        // Use agent-based authentication if no password is provided
        sshConfig.agent = process.env.SSH_AUTH_SOCK;
      }
      
      const cleanedVMs = await instanceService.cleanupOrphanedVMs(hostIp, sshConfig);
      
      res.status(200).json({
        status: 'success',
        message: `Successfully cleaned up ${cleanedVMs.length} orphaned VMs`,
        data: {
          cleanedVMs
        }
      });
    } catch (error) {
      console.error(`Error cleaning up orphaned VMs:`, error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to clean up orphaned VMs'
      });
    }
  }
};

// Instance routes
router.get('/', instanceController.getAllInstances);
router.get('/:id', instanceController.getInstanceById);
router.post('/', instanceController.createInstance);
router.put('/:id', instanceController.updateInstance);
router.delete('/:id', instanceController.deleteInstance);
router.post('/:id/start', instanceController.startInstance);
router.post('/:id/stop', instanceController.stopInstance);
router.post('/:id/force-stop', instanceController.forceStopInstance);
router.post('/:id/restart', instanceController.restartInstance);
router.get('/:id/status', instanceController.checkInstanceStatus);
router.post('/:id/ssh-connect', instanceController.sshConnect);
router.post('/cleanup-orphaned', instanceController.cleanupOrphanedVMs);

// Export the router
module.exports = router;

// WebSocket terminal handler - to be used by the WebSocket server
module.exports.setupTerminalWebSocket = (wss) => {
  wss.on('connection', (ws, req) => {
    // Extract instance ID from URL
    const match = req.url.match(/\/api\/instances\/([^\/]+)\/terminal/);
    if (!match) {
      console.error('Invalid WebSocket URL:', req.url);
      ws.send('Error: Invalid URL format');
      ws.close(1008, 'Invalid URL');
      return;
    }
    
    const instanceId = match[1];
    console.log(`WebSocket terminal connection established for instance ${instanceId}`);
    
    // Get instance details
    instanceService.getInstanceById(instanceId)
      .then(async (instance) => {
        if (!instance) {
          console.error(`Instance ${instanceId} not found`);
          ws.send('Error: Instance not found');
          ws.close(1008, 'Instance not found');
          return;
        }
        
        try {
          // Get SSH connection details
          const sshDetails = await instanceService.getSSHConnectionDetails(instanceId);
          
          console.log(`SSH details for instance ${instanceId}:`, {
            host: sshDetails.host,
            port: sshDetails.port,
            username: sshDetails.username,
            authMethod: sshDetails.authMethod,
            vmName: sshDetails.vmName,
            status: sshDetails.status
          });
          
          // Connect to SSH server
          const ssh = new Client();
          
          // Send initial message to client
          ws.send(`Connecting to ${instance.name} (${sshDetails.host})...\r\n`);
          
          // SSH configuration
          const sshConfig = {
            host: sshDetails.host,
            port: sshDetails.port || 22,
            username: sshDetails.username || 'root',
            readyTimeout: 20000,
            keepaliveInterval: 10000
          };
          
          // Add authentication method
          if (instance.config?.sshPassword) {
            sshConfig.password = instance.config.sshPassword;
          } else if (sshDetails.authMethod === 'key') {
            // Use agent-based authentication if available
            sshConfig.agent = process.env.SSH_AUTH_SOCK || undefined;
            
            // Fallback to trying without authentication (for VMs that might not require it)
            sshConfig.tryKeyboard = true;
          }
          
          console.log(`Connecting to SSH server for instance ${instanceId}:`, {
            host: sshConfig.host,
            port: sshConfig.port,
            username: sshConfig.username,
            authMethod: sshDetails.authMethod,
            hasPassword: !!sshConfig.password,
            hasAgent: !!sshConfig.agent
          });
          
          // Handle SSH connection
          ssh.on('ready', () => {
            console.log(`SSH connection ready for instance ${instanceId}`);
            ws.send('SSH connection established.\r\n');
            
            // Request a pseudo-terminal with proper settings
            ssh.shell({
              term: 'xterm-color',
              cols: 80,
              rows: 24,
              width: 80,
              height: 24,
              modes: {
                ECHO: 1,
                ECHOCTL: 1
              }
            }, (err, stream) => {
              if (err) {
                console.error(`Error creating shell for instance ${instanceId}:`, err);
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(`Error creating shell: ${err.message}`);
                  ws.close();
                }
                ssh.end();
                return;
              }
              
              console.log(`Shell created for instance ${instanceId}`);
              
              // Send a command to show we're connected and display a prompt
              stream.write('echo "Connected to $(hostname) - $(date)"\r\n');
              stream.write('PS1="\\u@\\h:\\w\\$ "\r\n');
              stream.write('echo "Type commands below:"\r\n');
              
              // Forward data from SSH to WebSocket
              stream.on('data', (data) => {
                try {
                  if (ws.readyState === WebSocket.OPEN) {
                    console.log(`Sending ${data.length} bytes of data to client: ${data.toString().substring(0, 50)}...`);
                    ws.send(data);
                  }
                } catch (error) {
                  console.error(`Error sending SSH data to WebSocket for instance ${instanceId}:`, error);
                }
              });
              
              // Handle SSH stream errors
              stream.on('error', (err) => {
                console.error(`SSH stream error for instance ${instanceId}:`, err);
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(`SSH error: ${err.message}`);
                  ws.close();
                }
                ssh.end();
              });
              
              // Handle SSH stream close
              stream.on('close', () => {
                console.log(`SSH stream closed for instance ${instanceId}`);
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send('SSH connection closed');
                  ws.close();
                }
                ssh.end();
              });
              
              // Forward data from WebSocket to SSH
              ws.on('message', (message) => {
                try {
                  console.log(`Received message from client: ${message.length} bytes`);
                  
                  // Check if this is a resize event
                  if (typeof message === 'string' || message instanceof Buffer) {
                    try {
                      const messageStr = message.toString();
                      if (messageStr.startsWith('{') && messageStr.includes('"type":"resize"')) {
                        const resizeData = JSON.parse(messageStr);
                        if (resizeData.type === 'resize' && resizeData.cols && resizeData.rows) {
                          console.log(`Resizing terminal to ${resizeData.cols}x${resizeData.rows}`);
                          stream.setWindow(resizeData.rows, resizeData.cols, 0, 0);
                          return;
                        }
                      }
                    } catch (parseError) {
                      // Not a JSON message, treat as regular data
                    }
                  }
                  
                  // Regular data, forward to SSH
                  if (stream.writable) {
                    stream.write(message);
                  }
                } catch (error) {
                  console.error(`Error sending WebSocket data to SSH for instance ${instanceId}:`, error);
                }
              });
              
              // Handle WebSocket close
              ws.on('close', () => {
                console.log(`WebSocket closed for instance ${instanceId}`);
                stream.close();
                ssh.end();
              });
            });
          });
          
          ssh.on('error', (err) => {
            console.error(`SSH connection error for instance ${instanceId}:`, err);
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(`Failed to connect to SSH: ${err.message}`);
              ws.close();
            }
          });
          
          ssh.on('end', () => {
            console.log(`SSH connection ended for instance ${instanceId}`);
          });
          
          ssh.on('close', (hadError) => {
            console.log(`SSH connection closed for instance ${instanceId}`, hadError ? 'with error' : 'cleanly');
          });
          
          // Connect with the SSH configuration
          try {
            ssh.connect(sshConfig);
          } catch (error) {
            console.error(`Error initiating SSH connection for instance ${instanceId}:`, error);
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(`Error connecting to SSH: ${error.message}`);
              ws.close();
            }
          }
        } catch (error) {
          console.error(`Error establishing terminal connection for instance ${instanceId}:`, error);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(`Error: ${error.message}`);
            ws.close(1011, 'Internal server error');
          }
        }
      })
      .catch((error) => {
        console.error(`Error retrieving instance ${instanceId}:`, error);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(`Error retrieving instance: ${error.message}`);
          ws.close(1011, 'Internal server error');
        }
      });
  });
}; 