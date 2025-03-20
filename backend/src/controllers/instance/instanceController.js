const { instanceService } = require('../../services');
const { Zone } = require('../../models');
const { Client } = require('ssh2');
const { mapInstanceToFrontend } = require('../../utils/instance/instanceMapper');
const { parseSystemUsage, createSshConfig } = require('../../utils/instance/instanceUtils');

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
      
      const mappedInstance = mapInstanceToFrontend(instance);
      const metrics = parseSystemUsage(instance.config?.systemUsage);
      
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
      const cpu = req.body.cpu || 1;
      const memory = req.body.memory || 1;
      
      if (!req.body.zone && !req.body.region) {
        return res.status(400).json({
          status: 'fail',
          message: 'Either zone or region must be provided'
        });
      }
      
      if (req.body.provider.toUpperCase() === 'SELF HOST' && !req.body.ip_address) {
        return res.status(400).json({
          status: 'fail',
          message: 'IP address is required for self-hosted instances'
        });
      }
      
      let zoneDetails = null;
      if (req.body.provider.toUpperCase() === 'SELF HOST' && req.body.zone) {
        try {
          const zones = await Zone.findAll({ region_code: req.body.zone });
          zoneDetails = zones.find(z => z.region_code === req.body.zone);
          
          if (!zoneDetails) {
            return res.status(400).json({
              status: 'fail',
              message: `Zone with region code ${req.body.zone} not found`
            });
          }
        } catch (zoneError) {
          console.error('Error fetching zone details:', zoneError);
        }
      }
      
      const instanceData = {
        name: req.body.name,
        provider: req.body.provider,
        region: req.body.region,
        zone: req.body.zone,
        instance_type: 'custom',
        status: 'provisioning',
        ip_address: req.body.ip_address || (zoneDetails ? zoneDetails.ip_address : ''),
        owner_id: req.body.owner_id || 1,
        project_id: req.body.project,
        cpu,
        memory,
        disk: req.body.disk || 50,
        image: req.body.image,
        config: {
          ...(req.body.config || {}),
          project: req.body.project,
          projectName: req.body.projectName,
          cpu,
          memory: `${memory} GB`,
          disk: req.body.disk || 50,
          image: req.body.image,
          vpc: req.body.vpc,
          subnet: req.body.subnet,
          security_group: req.body.security_group,
          volume_type: req.body.volume_type,
          stack: req.body.stack || 'Linux',
          sshUser: zoneDetails ? zoneDetails.ssh_user : req.body.config?.sshUser,
          sshPort: zoneDetails ? zoneDetails.ssh_port : req.body.config?.sshPort,
          sshPassword: zoneDetails ? zoneDetails.ssh_password : req.body.config?.sshPassword
        }
      };
      
      const newInstance = await instanceService.createInstance(instanceData);
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
      
      if (error.message && (
          error.message.includes('credentials are not properly configured') ||
          error.message.includes('Invalid') ||
          error.message.includes('Unsupported provider')
      )) {
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
      
      let config = req.body.config;
      if (config && typeof config === 'string') {
        try {
          config = JSON.parse(config);
        } catch (e) {
          console.error('Error parsing config JSON:', e);
        }
      }
      
      const currentInstance = await instanceService.getInstanceById(req.params.id);
      if (!currentInstance) {
        return res.status(404).json({
          status: 'fail',
          message: 'Instance not found'
        });
      }
      
      const updateData = {
        name: req.body.name,
        status: req.body.status || currentInstance.status || 'unknown',
        ip_address: req.body.ip_address,
        config
      };
      
      console.log('Processed update data:', updateData);
      
      const updatedInstance = await instanceService.updateInstance(req.params.id, updateData);
      
      if (!updatedInstance) {
        return res.status(404).json({
          status: 'fail',
          message: 'Instance not found'
        });
      }
      
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
      
      setTimeout(async () => {
        try {
          await instanceService.updateInstanceStatusAfterStart(req.params.id);
        } catch (error) {
          console.error(`Error updating instance status after start for ID ${req.params.id}:`, error);
        }
      }, 30000);
      
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
      
      setTimeout(async () => {
        try {
          await instanceService.updateInstanceStatusAfterStop(req.params.id);
        } catch (error) {
          console.error(`Error updating instance status after stop for ID ${req.params.id}:`, error);
        }
      }, 30000);
      
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
      const instance = await instanceService.getInstanceById(req.params.id);
      
      if (!instance) {
        return res.status(404).json({
          status: 'error',
          message: 'Instance not found'
        });
      }
      
      const provider = instance.provider.toUpperCase();
      const isKvmInstance = provider === 'SELF HOST' && instance.config?.vmName && instance.config?.kvmHost;
      const restartTimeout = isKvmInstance ? 60000 : 30000;
      
      const updatedInstance = await instanceService.changeInstanceState(req.params.id, 'restart');
      
      if (!updatedInstance) {
        return res.status(404).json({
          status: 'error',
          message: 'Instance not found'
        });
      }
      
      if (isKvmInstance) {
        const checkIntervals = [15000, 30000, 45000, 60000];
        
        checkIntervals.forEach(interval => {
          setTimeout(async () => {
            try {
              const currentInstance = await instanceService.getInstanceById(req.params.id);
              
              if (currentInstance && currentInstance.status === 'restarting') {
                await instanceService.updateInstanceStatusAfterRestart(req.params.id);
                console.log(`Instance status check at ${interval}ms after restart for ID ${req.params.id}`);
              }
            } catch (error) {
              console.error(`Error checking instance status at ${interval}ms after restart for ID ${req.params.id}:`, error);
            }
          }, interval);
        });
      } else {
        setTimeout(async () => {
          try {
            const currentInstance = await instanceService.getInstanceById(req.params.id);
            
            if (currentInstance && currentInstance.status === 'restarting') {
              await instanceService.updateInstanceStatusAfterRestart(req.params.id);
              console.log(`Instance status updated after restart for ID ${req.params.id}`);
            }
          } catch (error) {
            console.error(`Error updating instance status after restart for ID ${req.params.id}:`, error);
          }
        }, restartTimeout);
      }
      
      const mappedInstance = mapInstanceToFrontend(updatedInstance);
      
      res.status(200).json({
        status: 'success',
        message: 'Instance restart initiated',
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
      
      setTimeout(async () => {
        try {
          await instanceService.updateInstanceStatusAfterStop(req.params.id);
        } catch (error) {
          console.error(`Error updating instance status after force stop for ID ${req.params.id}:`, error);
        }
      }, 5000);
      
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
      
      const mappedInstance = mapInstanceToFrontend(instance);
      
      res.status(200).json({
        status: 'success',
        data: {
          instance: mappedInstance,
          isRunning
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
      
      const sshDetails = await instanceService.getSSHConnectionDetails(req.params.id);
      
      console.log(`SSH details for instance ${req.params.id}:`, {
        host: sshDetails.host,
        port: sshDetails.port,
        username: sshDetails.username,
        authMethod: sshDetails.authMethod,
        vmName: sshDetails.vmName,
        status: sshDetails.status,
        isKvm: sshDetails.isKvm
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
      
      const sshConfig = createSshConfig({
        host: hostIp,
        port: sshPort,
        username: sshUser,
        password: sshPassword
      });
      
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
  },
  
  testConnection: async (req, res) => {
    try {
      const { ipAddress, username, password, port = 22 } = req.body;
      
      if (!ipAddress) {
        return res.status(400).json({
          success: false,
          message: 'IP address is required'
        });
      }
      
      if (!username) {
        return res.status(400).json({
          success: false,
          message: 'Username is required'
        });
      }
      
      const sshConfig = createSshConfig({
        host: ipAddress,
        port,
        username,
        password
      });
      
      const conn = new Client();
      
      await new Promise((resolve, reject) => {
        let connectionTimeout = setTimeout(() => {
          conn.end();
          reject(new Error('Connection timed out after 30 seconds'));
        }, 30000);
        
        conn.on('ready', () => {
          clearTimeout(connectionTimeout);
          console.log('SSH connection established successfully');
          
          conn.exec('echo "Connection test successful"', (err, stream) => {
            if (err) {
              conn.end();
              return reject(new Error(`Connected but failed to execute command: ${err.message}`));
            }
            
            let data = '';
            stream.on('data', (chunk) => {
              data += chunk.toString();
            });
            
            stream.on('close', (code) => {
              conn.end();
              if (code === 0) {
                console.log(`SSH command executed successfully: ${data.trim()}`);
                resolve(data.trim());
              } else {
                reject(new Error(`Command execution failed with code ${code}`));
              }
            });
          });
        });
        
        conn.on('error', (err) => {
          clearTimeout(connectionTimeout);
          console.error('SSH connection error:', err.message);
          
          if (err.message.includes('All configured authentication methods failed')) {
            reject(new Error('Authentication failed. Please check your username and password or ensure SSH agent is properly configured.'));
          } else if (err.message.includes('connect ETIMEDOUT')) {
            reject(new Error('Connection timed out. Please verify the server is reachable and the port is correct.'));
          } else if (err.message.includes('connect ECONNREFUSED')) {
            reject(new Error('Connection refused. Please check if SSH is running on the server and the port is correct.'));
          } else if (err.message.includes('getaddrinfo')) {
            reject(new Error('Host not found. Please verify the IP address is correct.'));
          } else {
            reject(err);
          }
        });
        
        console.log(`Testing SSH connection to ${sshConfig.host}:${sshConfig.port} as ${sshConfig.username}`);
        conn.connect(sshConfig);
      });
      
      return res.status(200).json({
        success: true,
        message: 'SSH connection successful'
      });
    } catch (error) {
      console.error('SSH connection test failed:', error.message);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },
  
  fetchSystemUsage: async (req, res) => {
    try {
      const instance = await instanceService.getInstanceById(req.params.id);
      
      if (!instance) {
        return res.status(404).json({
          status: 'fail',
          message: 'Instance not found'
        });
      }
      
      if (instance.provider.toUpperCase() !== 'SELF HOST') {
        return res.status(400).json({
          status: 'fail',
          message: 'System usage data can only be fetched for self-hosted instances'
        });
      }
      
      const updatedInstance = await instanceService.fetchSystemUsage(req.params.id);
      const mappedInstance = mapInstanceToFrontend(updatedInstance);
      const systemUsage = updatedInstance.config?.systemUsage || {};
      const metrics = parseSystemUsage(systemUsage);
      
      res.status(200).json({
        status: 'success',
        message: 'System usage data fetched successfully',
        data: {
          instance: {
            ...mappedInstance,
            metrics
          },
          systemUsage
        }
      });
    } catch (error) {
      console.error(`Error fetching system usage for instance with ID ${req.params.id}:`, error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch system usage data'
      });
    }
  }
};

module.exports = instanceController;