/**
 * Instance Service
 * Handles all operations related to infrastructure instances
 */

const { Instance } = require('../../models');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { Client } = require('ssh2');
const { generateKvmDomainXml } = require('./vmTemplates');

// Cloud provider API configuration
const cloudProviders = {
  AWS: {
    baseUrl: process.env.AWS_API_URL || 'https://api.aws.example.com',
    apiKey: process.env.AWS_API_KEY,
    apiSecret: process.env.AWS_API_SECRET,
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  GCP: {
    baseUrl: process.env.GCP_API_URL || 'https://api.gcp.example.com',
    apiKey: process.env.GCP_API_KEY,
    projectId: process.env.GCP_PROJECT_ID,
    clientEmail: process.env.GCP_CLIENT_EMAIL,
    privateKey: process.env.GCP_PRIVATE_KEY
  },
  Azure: {
    baseUrl: process.env.AZURE_API_URL || 'https://api.azure.example.com',
    subscriptionId: process.env.AZURE_SUBSCRIPTION_ID,
    clientId: process.env.AZURE_CLIENT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
    tenantId: process.env.AZURE_TENANT_ID,
    resourceGroup: process.env.AZURE_RESOURCE_GROUP
  },
  SelfHosted: {
    enabled: process.env.SELF_HOSTED_ENABLED === 'true' || true,
    sshKeyPath: process.env.SELF_HOSTED_SSH_KEY_PATH || '~/.ssh/id_rsa',
    defaultUser: process.env.SELF_HOSTED_DEFAULT_USER || 'admin',
    defaultPort: parseInt(process.env.SELF_HOSTED_DEFAULT_PORT || '22', 10)
  }
};

/**
 * Validates cloud provider credentials before creating an instance
 * @param {string} provider - The cloud provider (AWS, GCP, Azure, SelfHosted)
 * @returns {Promise<boolean>} - True if credentials are valid, throws error otherwise
 */
const validateProviderCredentials = async (provider) => {
  try {
    console.log(`Validating ${provider} credentials...`);
    
    const providerConfig = cloudProviders[provider.toUpperCase()];
    if (!providerConfig) {
      throw new Error(`Unsupported provider: ${provider}`);
    }
    
    // Check if required credentials are configured
    switch (provider.toUpperCase()) {
      case 'AWS':
        if (!providerConfig.accessKeyId || !providerConfig.secretAccessKey) {
          throw new Error('AWS credentials are not properly configured');
        }
        
        // Make a test API call to AWS to validate credentials
        // In a real implementation, you would use the AWS SDK
        const awsResponse = await axios.get(`${providerConfig.baseUrl}/validate-credentials`, {
          headers: {
            'X-Api-Key': providerConfig.apiKey,
            'Authorization': `AWS ${providerConfig.accessKeyId}:${providerConfig.secretAccessKey}`
          }
        });
        
        if (!awsResponse.data.valid) {
          throw new Error('Invalid AWS credentials');
        }
        break;
        
      case 'GCP':
        if (!providerConfig.projectId || !providerConfig.clientEmail || !providerConfig.privateKey) {
          throw new Error('GCP credentials are not properly configured');
        }
        
        // Make a test API call to GCP to validate credentials
        // In a real implementation, you would use the Google Cloud SDK
        const gcpResponse = await axios.get(`${providerConfig.baseUrl}/validate-credentials`, {
          headers: {
            'X-Api-Key': providerConfig.apiKey,
            'X-Gcp-Project-Id': providerConfig.projectId
          }
        });
        
        if (!gcpResponse.data.valid) {
          throw new Error('Invalid GCP credentials');
        }
        break;
        
      case 'AZURE':
        if (!providerConfig.subscriptionId || !providerConfig.clientId || 
            !providerConfig.clientSecret || !providerConfig.tenantId) {
          throw new Error('Azure credentials are not properly configured');
        }
        
        // Make a test API call to Azure to validate credentials
        // In a real implementation, you would use the Azure SDK
        const azureResponse = await axios.get(`${providerConfig.baseUrl}/validate-credentials`, {
          headers: {
            'X-Api-Key': providerConfig.apiKey,
            'X-Azure-Subscription-Id': providerConfig.subscriptionId,
            'X-Azure-Client-Id': providerConfig.clientId,
            'X-Azure-Tenant-Id': providerConfig.tenantId
          }
        });
        
        if (!azureResponse.data.valid) {
          throw new Error('Invalid Azure credentials');
        }
        break;
        
      case 'SELFHOSTED':
        // For self-hosted, we just check if it's enabled
        if (!providerConfig.enabled) {
          throw new Error('Self-hosted provider is not enabled');
        }
        
        // Check if SSH key exists (in a real implementation)
        // const fs = require('fs');
        // const sshKeyPath = providerConfig.sshKeyPath.replace('~', os.homedir());
        // if (!fs.existsSync(sshKeyPath)) {
        //   throw new Error(`SSH key not found at ${sshKeyPath}`);
        // }
        
        console.log('Self-hosted provider is enabled and ready to use');
        break;
        
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
    
    console.log(`${provider} credentials validated successfully`);
    return true;
  } catch (error) {
    console.error(`Error validating ${provider} credentials:`, error);
    throw error;
  }
};

// Helper function to execute SSH commands
const executeSSHCommand = async (config, command) => {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    
    conn.on('ready', () => {
      console.log('SSH connection established');
      
      conn.exec(command, (err, stream) => {
        if (err) {
          conn.end();
          return reject(err);
        }
        
        let stdout = '';
        let stderr = '';
        
        stream.on('close', (code) => {
          conn.end();
          if (code === 0) {
            resolve(stdout);
          } else {
            reject(new Error(`Command exited with code ${code}: ${stderr}`));
          }
        });
        
        stream.on('data', (data) => {
          stdout += data.toString();
        });
        
        stream.stderr.on('data', (data) => {
          stderr += data.toString();
        });
      });
    });
    
    conn.on('error', (err) => {
      reject(err);
    });
    
    conn.connect(config);
  });
};

const instanceService = {
  /**
   * Get all instances with optional filtering
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} List of instances
   */
  getAllInstances: async (filters = {}) => {
    try {
      return await Instance.findAll(filters);
    } catch (error) {
      console.error('Error getting all instances:', error);
      throw error;
    }
  },

  /**
   * Get instance by ID
   * @param {string} id - Instance ID
   * @returns {Promise<Object>} Instance details
   */
  getInstanceById: async (id) => {
    try {
      return await Instance.findById(id);
    } catch (error) {
      console.error(`Error getting instance with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new instance
   * @param {Object} instanceData - Instance data
   * @returns {Promise<Object>} Created instance
   */
  createInstance: async (instanceData) => {
    try {
      // Validate the provider credentials before proceeding
      const provider = instanceData.provider.toUpperCase();
      
      // For self-hosted machines, we need to handle them differently
      if (provider === 'SELFHOSTED') {
        // For self-hosted, we need to validate the IP address and SSH access
        if (!instanceData.ip_address) {
          throw new Error('IP address is required for self-hosted machines');
        }
        
        // Get SSH connection details from the zone configuration
        const sshUser = instanceData.config?.sshUser || 'admin';
        const sshPort = instanceData.config?.sshPort || 22;
        const sshPassword = instanceData.config?.sshPassword;
        
        console.log('SSH connection details:', {
          host: instanceData.ip_address,
          port: sshPort,
          username: sshUser,
          hasPassword: !!sshPassword
        });
        
        // Create SSH connection config
        const sshConfig = {
          host: instanceData.ip_address,
          port: sshPort,
          username: sshUser,
          readyTimeout: 10000
        };
        
        // Add authentication method
        if (sshPassword) {
          sshConfig.password = sshPassword;
          console.log('Using password authentication');
        } else {
          // Use agent-based authentication if no password is provided
          sshConfig.agent = process.env.SSH_AUTH_SOCK;
          console.log('Using SSH agent authentication');
        }
        
        try {
          console.log(`Connecting to ${instanceData.ip_address} to provision VM...`);
          
          // Check system resources
          const cpuInfo = await executeSSHCommand(sshConfig, 'nproc');
          const memInfo = await executeSSHCommand(sshConfig, 'free -m | grep Mem | awk \'{print $2}\'');
          const diskInfo = await executeSSHCommand(sshConfig, 'df -h / | tail -1 | awk \'{print $4}\'');
          
          console.log(`Available resources: ${cpuInfo.trim()} CPUs, ${memInfo.trim()} MB RAM, ${diskInfo.trim()} disk space`);
          
          // Check if KVM is available
          try {
            await executeSSHCommand(sshConfig, 'which virsh');
            console.log('KVM/libvirt is available on the server');
          } catch (kvmError) {
            console.error('KVM/libvirt not found on server:', kvmError);
            throw new Error('KVM/libvirt is not installed on the server. Please install libvirt and qemu-kvm.');
          }
          
          // Create a VM using KVM/libvirt
          const vmName = instanceData.name.replace(/[^a-zA-Z0-9_-]/g, '_');
          const cpuCount = instanceData.cpu || 1;
          const memoryMB = (instanceData.memory || 1) * 1024; // Convert GB to MB
          const diskGB = instanceData.disk || 20;
          const imageType = instanceData.image || 'ubuntu-20.04';
          
          // Create VM storage directory with proper permissions
          await executeSSHCommand(sshConfig, `sudo mkdir -p /home/${sshConfig.username}/kvm_images`);
          await executeSSHCommand(sshConfig, `sudo chown ${sshConfig.username}:${sshConfig.username} /home/${sshConfig.username}/kvm_images`);
          await executeSSHCommand(sshConfig, `sudo chmod 755 /home/${sshConfig.username}/kvm_images`);
          
          // Determine which OS image to use
          let baseImageUrl;
          let cloudInitRequired = true;
          
          switch(imageType.toLowerCase()) {
            case 'ubuntu-20.04':
            case 'ubuntu':
              baseImageUrl = 'https://cloud-images.ubuntu.com/focal/current/focal-server-cloudimg-amd64.img';
              break;
            case 'ubuntu-22.04':
              baseImageUrl = 'https://cloud-images.ubuntu.com/jammy/current/jammy-server-cloudimg-amd64.img';
              break;
            case 'debian-11':
            case 'debian':
              baseImageUrl = 'https://cloud.debian.org/images/cloud/bullseye/latest/debian-11-generic-amd64.qcow2';
              break;
            case 'centos-stream-9':
            case 'centos':
              baseImageUrl = 'https://cloud.centos.org/centos/9-stream/x86_64/images/CentOS-Stream-GenericCloud-9-latest.x86_64.qcow2';
              break;
            default:
              // For custom images, we'll assume it's already on the server
              cloudInitRequired = false;
              baseImageUrl = '';
          }
          
          // Download the base image if needed
          if (baseImageUrl) {
            console.log(`Downloading base image from ${baseImageUrl}...`);
            const baseImageFilename = baseImageUrl.split('/').pop();
            const downloadCmd = `
              if [ ! -f /home/${sshConfig.username}/kvm_images/${baseImageFilename} ]; then
                wget -O /home/${sshConfig.username}/kvm_images/${baseImageFilename} ${baseImageUrl}
              else
                echo "Base image already exists, skipping download"
              fi
            `;
            await executeSSHCommand(sshConfig, downloadCmd);
          }
          
          // Create a disk image for the VM
          const diskImagePath = `/home/${sshConfig.username}/kvm_images/${vmName}.qcow2`;
          const createDiskCmd = `
            if [ ! -f ${diskImagePath} ]; then
              qemu-img create -f qcow2 -o backing_file=/home/${sshConfig.username}/kvm_images/${baseImageUrl.split('/').pop()} ${diskImagePath} ${diskGB}G
            else
              echo "Disk image already exists, skipping creation"
            fi
          `;
          
          if (baseImageUrl) {
            await executeSSHCommand(sshConfig, createDiskCmd);
          } else {
            // For custom images, create a new disk
            await executeSSHCommand(sshConfig, `qemu-img create -f qcow2 ${diskImagePath} ${diskGB}G`);
          }
          
          // Create cloud-init config if needed
          if (cloudInitRequired) {
            const cloudInitDir = `/home/${sshConfig.username}/kvm_images/cloud-init/${vmName}`;
            const metaDataContent = `instance-id: ${vmName}\nlocal-hostname: ${vmName}`;
            const userDataContent = `#cloud-config
hostname: ${vmName}
fqdn: ${vmName}.local
manage_etc_hosts: true
users:
  - name: infracontrol
    sudo: ALL=(ALL) NOPASSWD:ALL
    shell: /bin/bash
    ssh_authorized_keys:
      - ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC0WGP1EZykEtv5YGC9nMiPFW3U3DmZNzKFO5nEu6uozEHh4jLZzPNHSrfFTuQ2GnRDSt+XbOtTLdcj26+iPNiFoFha42aCIzYjt6V8Z+SQ9pzF4jPPzxwXfDdkEWylgoNnZ+4MG1lNFqa8aO7F62tX0Yj5khjC0Bs7Mb2cHLx1XZaxJV6qSaulDuBbLYe8QUZXkMc7wmob3PM0kflfolR3LE7LResIHWa4j4FL6r5cQmFlDU2BDPpKMFMGUfRSFiUtaWBNXFOWHQBC2+uKmuMPYP4vJC9sBgqMvPN/X2KyemqdMvdKXnCfrzadHuSSJYEzD64Cve5Zl9yVvY4AqyBD infracontrol@example.com
ssh_pwauth: true
disable_root: false
chpasswd:
  list: |
    infracontrol:infracontrol
  expire: false
packages:
  - qemu-guest-agent
  - cloud-init
package_update: true
package_upgrade: true
runcmd:
  - systemctl enable qemu-guest-agent
  - systemctl start qemu-guest-agent
`;
            
            // Create cloud-init directory and files with proper permissions
            await executeSSHCommand(sshConfig, `sudo mkdir -p ${cloudInitDir}`);
            await executeSSHCommand(sshConfig, `sudo chown ${sshConfig.username}:${sshConfig.username} ${cloudInitDir}`);
            await executeSSHCommand(sshConfig, `sudo chmod 755 ${cloudInitDir}`);
            await executeSSHCommand(sshConfig, `echo '${metaDataContent}' > ${cloudInitDir}/meta-data`);
            await executeSSHCommand(sshConfig, `echo '${userDataContent}' > ${cloudInitDir}/user-data`);
            
            // Create cloud-init ISO
            await executeSSHCommand(sshConfig, `
              cd ${cloudInitDir} && \
              sudo genisoimage -output ${cloudInitDir}/cloud-init.iso -volid cidata -joliet -rock user-data meta-data && \
              sudo chown ${sshConfig.username}:${sshConfig.username} ${cloudInitDir}/cloud-init.iso
            `);
          }
          
          // Define the VM XML
          const domainType = 'kvm';
          const vmXML = generateKvmDomainXml({
            vmName,
            memoryMB,
            cpuCount,
            diskImagePath,
            cloudInitRequired,
            sshUsername: sshConfig.username
          });
          
          // Save the VM XML definition
          const vmXmlPath = `/home/${sshConfig.username}/kvm_images/${vmName}.xml`;
          await executeSSHCommand(sshConfig, `echo '${vmXML}' > ${vmXmlPath}`);
          
          // Define and start the VM
          await executeSSHCommand(sshConfig, `virsh define ${vmXmlPath}`);
          await executeSSHCommand(sshConfig, `virsh start ${vmName}`);
          
          // Get the VM IP address (this might take some time)
          console.log('Waiting for VM to get an IP address...');
          let vmIpAddress = '';
          let attempts = 0;
          
          while (!vmIpAddress && attempts < 10) {
            try {
              const leases = await executeSSHCommand(sshConfig, `virsh net-dhcp-leases default | grep ${vmName}`);
              const match = leases.match(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/);
              if (match) {
                vmIpAddress = match[0];
                console.log(`VM IP address: ${vmIpAddress}`);
              }
            } catch (e) {
              // Ignore errors, just try again
            }
            
            if (!vmIpAddress) {
              attempts++;
              // Wait 5 seconds before trying again
              await new Promise(resolve => setTimeout(resolve, 5000));
            }
          }
          
          // Create a new instance record in the database
          const newInstance = await Instance.create({
            name: instanceData.name,
            type: instanceData.type || 'vm',
            status: 'running',
            provider: 'SelfHosted',
            zone: instanceData.zone,
            region: instanceData.zone, // Use zone as region for self-hosted instances
            project_id: instanceData.project,
            ip_address: vmIpAddress || instanceData.ip_address,
            cpu: cpuCount,
            memory: instanceData.memory || 1,
            disk: diskGB,
            image: imageType,
            config: {
              ...instanceData.config,
              vmName: vmName,
              provisionedAt: new Date().toISOString(),
              kvmHost: instanceData.ip_address,
              vmIpAddress: vmIpAddress,
              diskImagePath: diskImagePath
            }
          });
          
          return newInstance;
        } catch (sshError) {
          console.error('Error during SSH connection or VM creation:', sshError);
          throw new Error(`Failed to create VM: ${sshError.message}`);
        }
      }
      
      // For cloud providers
      if (!cloudProviders[provider]) {
        throw new Error(`Unsupported cloud provider: ${provider}`);
      }
      
      // Validate provider credentials
      await validateProviderCredentials(provider);
      
      // For cloud providers, proceed with normal instance creation
      // First create a record in our database
      const newInstance = await Instance.create(instanceData);
      
      // Now provision the actual instance with the cloud provider
      
      // Prepare the request to the cloud provider
      const providerConfig = cloudProviders[provider];
      const provisioningData = {
        name: instanceData.name,
        region: instanceData.region,
        instanceType: instanceData.instance_type,
        imageId: instanceData.config.imageId,
        rootVolumeSize: instanceData.config.rootVolumeSize,
        rootVolumeType: instanceData.config.rootVolumeType,
        vpc: instanceData.config.vpc,
        subnet: instanceData.config.subnet,
        securityGroup: instanceData.config.securityGroup,
        tags: {
          projectId: instanceData.config.project,
          managedBy: 'InfraControl'
        }
      };
      
      try {
        // Call the cloud provider API to provision the instance
        // This is a placeholder for the actual API call
        // In a real implementation, you would use the appropriate SDK for each provider
        
        let providerResponse;
        
        switch (provider) {
          case 'AWS':
            // AWS EC2 instance creation
            // In a real implementation, you would use the AWS SDK
            console.log(`Creating AWS EC2 instance with config:`, {
              region: providerConfig.region,
              accessKeyId: providerConfig.accessKeyId ? '****' : 'not set',
              secretAccessKey: providerConfig.secretAccessKey ? '****' : 'not set',
              instanceType: provisioningData.instanceType,
              imageId: provisioningData.imageId
            });
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Simulate AWS response
            providerResponse = {
              InstanceId: `i-${uuidv4().substring(0, 8)}`,
              PrivateIpAddress: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
              PublicIpAddress: `54.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
              State: { Name: 'running' }
            };
            break;
            
          case 'GCP':
            // GCP Compute Engine instance creation
            // In a real implementation, you would use the Google Cloud SDK
            console.log(`Creating GCP Compute Engine instance with config:`, {
              projectId: providerConfig.projectId,
              zone: provisioningData.region,
              machineType: provisioningData.instanceType,
              sourceImage: provisioningData.imageId
            });
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Simulate GCP response
            providerResponse = {
              id: `${Math.floor(Math.random() * 10000000000000000)}`,
              name: provisioningData.name,
              zone: provisioningData.region,
              networkInterfaces: [{
                networkIP: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
                accessConfigs: [{
                  natIP: `35.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
                }]
              }],
              status: 'RUNNING'
            };
            break;
            
          case 'AZURE':
            // Azure VM creation
            // In a real implementation, you would use the Azure SDK
            console.log(`Creating Azure VM with config:`, {
              subscriptionId: providerConfig.subscriptionId,
              resourceGroup: providerConfig.resourceGroup,
              location: provisioningData.region,
              vmSize: provisioningData.instanceType,
              imageReference: provisioningData.imageId
            });
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Simulate Azure response
            providerResponse = {
              id: `/subscriptions/${providerConfig.subscriptionId}/resourceGroups/${providerConfig.resourceGroup}/providers/Microsoft.Compute/virtualMachines/${provisioningData.name}`,
              name: provisioningData.name,
              location: provisioningData.region,
              properties: {
                vmId: uuidv4(),
                provisioningState: 'Succeeded',
                networkProfile: {
                  networkInterfaces: [{
                    properties: {
                      ipConfigurations: [{
                        properties: {
                          privateIPAddress: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
                          publicIPAddress: {
                            properties: {
                              ipAddress: `40.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
                            }
                          }
                        }
                      }]
                    }
                  }]
                }
              }
            };
            break;
            
          default:
            throw new Error(`Unsupported cloud provider: ${provider}`);
        }
        
        // Extract IP address from provider response
        let ipAddress = '';
        let providerInstanceId = '';
        
        switch (provider) {
          case 'AWS':
            ipAddress = providerResponse.PublicIpAddress || providerResponse.PrivateIpAddress;
            providerInstanceId = providerResponse.InstanceId;
            break;
          case 'GCP':
            ipAddress = providerResponse.networkInterfaces[0].accessConfigs[0].natIP || 
                       providerResponse.networkInterfaces[0].networkIP;
            providerInstanceId = providerResponse.id;
            break;
          case 'AZURE':
            ipAddress = providerResponse.properties.networkProfile.networkInterfaces[0].properties.ipConfigurations[0].properties.publicIPAddress?.properties.ipAddress || 
                       providerResponse.properties.networkProfile.networkInterfaces[0].properties.ipConfigurations[0].properties.privateIPAddress;
            providerInstanceId = providerResponse.properties.vmId;
            break;
        }
        
        // Update the instance with the provider's response data
        const updatedInstance = await Instance.update(newInstance.id, {
          status: 'running',
          ip_address: ipAddress,
          config: {
            ...instanceData.config,
            providerInstanceId,
            providerResponse: JSON.stringify(providerResponse),
            provisionedAt: new Date().toISOString()
          }
        });
        
        return updatedInstance;
      } catch (providerError) {
        // If the cloud provider API call fails, update the instance status to 'failed'
        console.error('Error provisioning instance with provider:', providerError);
        
        await Instance.update(newInstance.id, {
          status: 'failed',
          config: {
            ...instanceData.config,
            provisioningError: providerError.message
          }
        });
        
        throw new Error(`Failed to provision instance with provider: ${providerError.message}`);
      }
    } catch (error) {
      console.error('Error creating instance:', error);
      throw error;
    }
  },

  /**
   * Update an existing instance
   * @param {string} id - Instance ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated instance
   */
  updateInstance: async (id, updateData) => {
    try {
      return await Instance.update(id, updateData);
    } catch (error) {
      console.error(`Error updating instance with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete an instance
   * @param {string} id - Instance ID
   * @returns {Promise<boolean>} Success status
   */
  deleteInstance: async (id) => {
    try {
      // First get the instance to check its provider and get the provider instance ID
      const instance = await Instance.findById(id);
      
      if (!instance) {
        return false;
      }
      
      const provider = instance.provider.toUpperCase();
      
      // Handle self-hosted VMs
      if (provider === 'SELFHOSTED') {
        try {
          const vmName = instance.config?.vmName;
          const kvmHost = instance.config?.kvmHost;
          
          if (!vmName || !kvmHost) {
            console.log('Missing VM configuration, proceeding with database deletion only');
          } else {
            // Create SSH connection config
            const sshConfig = {
              host: kvmHost,
              port: instance.config?.sshPort || 22,
              username: instance.config?.sshUser || 'root',
              readyTimeout: 10000
            };
            
            // Add authentication method
            if (instance.config?.sshPassword) {
              sshConfig.password = instance.config.sshPassword;
            } else {
              // Use agent-based authentication if no password is provided
              sshConfig.agent = process.env.SSH_AUTH_SOCK;
            }
            
            console.log(`Deleting self-hosted VM ${vmName} on host ${kvmHost}`);
            
            try {
              // First check if the VM is running and force stop it if needed
              const checkRunningCmd = `ps aux | grep -v grep | grep "${vmName}" | wc -l`;
              const isRunning = parseInt((await executeSSHCommand(sshConfig, checkRunningCmd)).trim()) > 0;
              
              if (isRunning) {
                console.log(`VM ${vmName} is running, stopping it first`);
                // Force kill the QEMU process
                await executeSSHCommand(sshConfig, `ps aux | grep -v grep | grep "${vmName}" | awk '{print $2}' | xargs -r kill -9`);
                // Wait a moment for the process to be killed
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
              
              // Undefine the VM from libvirt to remove it from virsh list
              try {
                console.log(`Undefining VM ${vmName} from libvirt`);
                await executeSSHCommand(sshConfig, `virsh undefine ${vmName} --remove-all-storage`);
              } catch (undefineError) {
                console.log(`Error undefining VM ${vmName}, may not be managed by libvirt: ${undefineError.message}`);
                // Continue with file cleanup even if undefine fails
              }
              
              // Delete the VM disk image and related files
              console.log(`Deleting VM disk image and related files for ${vmName}`);
              const diskImagePath = instance.config?.diskImagePath;
              if (diskImagePath) {
                await executeSSHCommand(sshConfig, `rm -f ${diskImagePath}`);
              }
              
              // Clean up any other VM-related files
              await executeSSHCommand(sshConfig, `rm -f /home/${sshConfig.username}/kvm_images/${vmName}.*`);
              await executeSSHCommand(sshConfig, `rm -rf /home/${sshConfig.username}/kvm_images/cloud-init/${vmName}`);
              
              console.log(`Successfully deleted VM ${vmName} and its files`);
            } catch (vmDeleteError) {
              console.error(`Error deleting VM ${vmName}:`, vmDeleteError);
              // Continue with database deletion even if VM deletion fails
            }
          }
        } catch (error) {
          console.error(`Error deleting self-hosted VM:`, error);
          // Continue with database deletion even if VM deletion fails
        }
      } else if (provider && instance.config?.providerInstanceId && cloudProviders[provider]) {
        // Call the cloud provider API to terminate the instance
        const providerConfig = cloudProviders[provider];
        const providerInstanceId = instance.config.providerInstanceId;
        
        try {
          console.log(`Terminating ${provider} instance ${providerInstanceId}`);
          
          switch (provider) {
            case 'AWS':
              // AWS EC2 instance termination
              // In a real implementation, you would use the AWS SDK
              console.log(`Terminating AWS EC2 instance with ID: ${providerInstanceId}`, {
                region: providerConfig.region,
                accessKeyId: providerConfig.accessKeyId ? '****' : 'not set',
                secretAccessKey: providerConfig.secretAccessKey ? '****' : 'not set'
              });
              break;
              
            case 'GCP':
              // GCP Compute Engine instance deletion
              // In a real implementation, you would use the Google Cloud SDK
              console.log(`Deleting GCP Compute Engine instance with ID: ${providerInstanceId}`, {
                projectId: providerConfig.projectId,
                zone: instance.region
              });
              break;
              
            case 'AZURE':
              // Azure VM deletion
              // In a real implementation, you would use the Azure SDK
              console.log(`Deleting Azure VM with ID: ${providerInstanceId}`, {
                subscriptionId: providerConfig.subscriptionId,
                resourceGroup: providerConfig.resourceGroup
              });
              break;
              
            default:
              throw new Error(`Unsupported cloud provider: ${provider}`);
          }
          
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (providerError) {
          console.error(`Error terminating instance with provider ${provider}:`, providerError);
          // Continue with database deletion even if provider deletion fails
        }
      }
      
      // Delete from our database
      const deletedInstance = await Instance.delete(id);
      return !!deletedInstance;
    } catch (error) {
      console.error(`Error deleting instance with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Change instance state (start, stop, restart)
   * @param {string} id - Instance ID
   * @param {string} action - Action to perform (start, stop, restart)
   * @returns {Promise<Object>} Updated instance state
   */
  changeInstanceState: async (id, action) => {
    try {
      // First get the instance to check its provider and get the provider instance ID
      const instance = await Instance.findById(id);
      
      if (!instance) {
        return null;
      }
      
      const provider = instance.provider.toUpperCase();
      const providerInstanceId = instance.config?.providerInstanceId;
      
      // Handle self-hosted VMs
      if (provider === 'SELFHOSTED') {
        try {
          const vmName = instance.config?.vmName;
          const kvmHost = instance.config?.kvmHost;
          
          if (!vmName || !kvmHost) {
            throw new Error('Missing VM configuration');
          }
          
          // Create SSH connection config
          const sshConfig = {
            host: kvmHost,
            port: instance.config?.sshPort || 22,
            username: instance.config?.sshUser || 'root',
            readyTimeout: 10000
          };
          
          // Add authentication method
          if (instance.config?.sshPassword) {
            sshConfig.password = instance.config.sshPassword;
          } else {
            // Use agent-based authentication if no password is provided
            sshConfig.agent = process.env.SSH_AUTH_SOCK;
          }
          
          console.log(`${action.toUpperCase()} self-hosted VM ${vmName} on host ${kvmHost}`);
          
          let command;
          switch (action) {
            case 'start':
              command = `virsh start ${vmName}`;
              break;
            case 'stop':
              // Use ACPI shutdown for graceful stop
              command = `virsh shutdown --mode=acpi ${vmName}`;
              break;
            case 'force-stop':
              // Force stop the VM immediately
              command = `virsh destroy ${vmName}`;
              break;
            case 'restart':
              // Use reboot with mode=acpi for graceful restart
              command = `virsh reboot --mode=acpi ${vmName}`;
              break;
            default:
              throw new Error(`Unsupported action: ${action}`);
          }
          
          // Execute the command
          try {
            await executeSSHCommand(sshConfig, command);
          } catch (cmdError) {
            // Handle specific error cases
            if (action === 'start' && cmdError.message.includes('Domain is already active')) {
              console.log(`VM ${vmName} is already running, updating status accordingly`);
              // If VM is already running, just update the status
              return await Instance.update(id, { status: 'running' });
            } else if (action === 'stop' && cmdError.message.includes('domain is not running')) {
              console.log(`VM ${vmName} is already stopped, updating status accordingly`);
              // If VM is already stopped, just update the status
              return await Instance.update(id, { status: 'stopped' });
            } else {
              // For other errors, rethrow
              throw cmdError;
            }
          }
          
          // Determine the new status based on the action
          const status = action === 'stop' ? 'stopping' : action === 'start' ? 'starting' : 'restarting';
          
          // Update the instance status in our database
          return await Instance.update(id, { status });
        } catch (error) {
          console.error(`Error ${action} self-hosted VM:`, error);
          throw new Error(`Failed to ${action} VM: ${error.message}`);
        }
      } else if (provider && providerInstanceId && cloudProviders[provider]) {
        // Call the cloud provider API to change the instance state
        const providerConfig = cloudProviders[provider];
        
        try {
          console.log(`${action.toUpperCase()} ${provider} instance ${providerInstanceId}`);
          
          switch (provider) {
            case 'AWS':
              // AWS EC2 instance state change
              // In a real implementation, you would use the AWS SDK
              console.log(`${action.toUpperCase()} AWS EC2 instance with ID: ${providerInstanceId}`, {
                region: providerConfig.region,
                accessKeyId: providerConfig.accessKeyId ? '****' : 'not set',
                secretAccessKey: providerConfig.secretAccessKey ? '****' : 'not set'
              });
              break;
              
            case 'GCP':
              // GCP Compute Engine instance state change
              // In a real implementation, you would use the Google Cloud SDK
              console.log(`${action.toUpperCase()} GCP Compute Engine instance with ID: ${providerInstanceId}`, {
                projectId: providerConfig.projectId,
                zone: instance.region
              });
              break;
              
            case 'AZURE':
              // Azure VM state change
              // In a real implementation, you would use the Azure SDK
              console.log(`${action.toUpperCase()} Azure VM with ID: ${providerInstanceId}`, {
                subscriptionId: providerConfig.subscriptionId,
                resourceGroup: providerConfig.resourceGroup
              });
              break;
              
            default:
              throw new Error(`Unsupported cloud provider: ${provider}`);
          }
          
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if the instance is already in the desired state
          // For cloud providers, we'll just update the status directly
          if (action === 'start' && instance.status === 'running') {
            console.log(`Instance ${id} is already running`);
            return instance;
          } else if (action === 'stop' && instance.status === 'stopped') {
            console.log(`Instance ${id} is already stopped`);
            return instance;
          }
          
          // Determine the new status based on the action
          const status = action === 'stop' ? 'stopping' : action === 'start' ? 'starting' : 'restarting';
          
          // Update the instance status in our database
          return await Instance.update(id, { status });
        } catch (providerError) {
          console.error(`Error changing instance state with provider ${provider}:`, providerError);
          throw new Error(`Failed to ${action} instance with provider: ${providerError.message}`);
        }
      } else {
        // If we don't have provider info, just update the status in our database
        const status = action === 'stop' ? 'stopping' : action === 'start' ? 'starting' : 'restarting';
        return await Instance.update(id, { status });
      }
    } catch (error) {
      console.error(`Error changing state for instance with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get instance metrics
   * @param {string} id - Instance ID
   * @param {string} metricType - Type of metric (cpu, memory, disk, network)
   * @param {Object} timeRange - Time range for metrics
   * @returns {Promise<Object>} Metrics data
   */
  getInstanceMetrics: async (id, metricType, timeRange = {}) => {
    try {
      // Get the instance to check its provider and get the provider instance ID
      const instance = await Instance.findById(id);
      
      if (!instance) {
        return null;
      }
      
      // For now, return simulated metrics
      // In a real implementation, you would fetch metrics from the cloud provider or monitoring system
      
      const now = new Date();
      const dataPoints = [];
      
      // Generate 24 hours of data points at 5-minute intervals
      for (let i = 0; i < 288; i++) {
        const timestamp = new Date(now.getTime() - (288 - i) * 5 * 60 * 1000);
        
        let value;
        switch (metricType) {
          case 'cpu':
            // CPU usage between 5% and 80% with some randomness
            value = 5 + Math.sin(i / 12) * 30 + Math.random() * 20;
            break;
          case 'memory':
            // Memory usage between 20% and 70% with some randomness
            value = 20 + Math.sin(i / 24) * 25 + Math.random() * 15;
            break;
          case 'disk':
            // Disk usage slowly increasing from 30% to 40%
            value = 30 + (i / 288) * 10 + Math.random() * 5;
            break;
          case 'network':
            // Network usage with peaks and valleys
            value = Math.max(0, 100 * Math.sin(i / 36) + Math.random() * 50);
            break;
          default:
            value = Math.random() * 100;
        }
        
        dataPoints.push({
          timestamp: timestamp.toISOString(),
          value: Math.min(100, Math.max(0, value.toFixed(2)))
        });
      }
      
      return {
        instanceId: id,
        metricType,
        unit: metricType === 'network' ? 'Mbps' : '%',
        dataPoints
      };
    } catch (error) {
      console.error(`Error getting metrics for instance with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create instance backup
   * @param {string} id - Instance ID
   * @param {Object} backupOptions - Backup configuration
   * @returns {Promise<Object>} Backup details
   */
  createBackup: async (id, backupOptions) => {
    // TODO: Implement backup creation logic with a real backup service
    // For now, return a placeholder response
    return { id: 'backup-id', instanceId: id, createdAt: new Date(), status: 'completed' };
  },

  /**
   * Restore instance from backup
   * @param {string} instanceId - Instance ID
   * @param {string} backupId - Backup ID
   * @returns {Promise<Object>} Restore operation details
   */
  restoreFromBackup: async (instanceId, backupId) => {
    // TODO: Implement restore logic with a real backup service
    // For now, return a placeholder response
    return { instanceId, backupId, status: 'in-progress' };
  },

  /**
   * Update instance status after restart
   * @param {string} id - Instance ID
   * @returns {Promise<Object>} Updated instance
   */
  updateInstanceStatusAfterRestart: async (id) => {
    try {
      const instance = await Instance.findById(id);
      
      if (!instance) {
        return null;
      }
      
      // If the instance is already running, no need to update
      if (instance.status === 'running') {
        return instance;
      }
      
      // Only update if the instance is in 'restarting' state
      if (instance.status !== 'restarting') {
        console.log(`Instance ${id} is not in 'restarting' state, current state: ${instance.status}`);
        return instance;
      }
      
      // Update the instance status to running after restart
      return await Instance.update(id, { status: 'running' });
    } catch (error) {
      console.error(`Error updating instance status after restart for ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update instance status after start
   * @param {string} id - Instance ID
   * @returns {Promise<Object>} Updated instance
   */
  updateInstanceStatusAfterStart: async (id) => {
    try {
      const instance = await Instance.findById(id);
      
      if (!instance) {
        return null;
      }
      
      // If the instance is already running, no need to update
      if (instance.status === 'running') {
        return instance;
      }
      
      // Only update if the instance is in 'starting' state
      if (instance.status !== 'starting') {
        console.log(`Instance ${id} is not in 'starting' state, current state: ${instance.status}`);
        return instance;
      }
      
      // Update the instance status to running after start
      return await Instance.update(id, { status: 'running' });
    } catch (error) {
      console.error(`Error updating instance status after start for ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update instance status after stop
   * @param {string} id - Instance ID
   * @returns {Promise<Object>} Updated instance
   */
  updateInstanceStatusAfterStop: async (id) => {
    try {
      const instance = await Instance.findById(id);
      
      if (!instance) {
        return null;
      }
      
      // If the instance is already stopped, no need to update
      if (instance.status === 'stopped') {
        return instance;
      }
      
      // Only update if the instance is in 'stopping' state
      if (instance.status !== 'stopping') {
        console.log(`Instance ${id} is not in 'stopping' state, current state: ${instance.status}`);
        return instance;
      }
      
      // Update the instance status to stopped after stop
      return await Instance.update(id, { status: 'stopped' });
    } catch (error) {
      console.error(`Error updating instance status after stop for ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Check if a VM is running
   * @param {string} id - Instance ID
   * @returns {Promise<boolean>} True if VM is running, false otherwise
   */
  checkVmStatus: async (id) => {
    try {
      const instance = await Instance.findById(id);
      
      if (!instance) {
        throw new Error(`Instance with ID ${id} not found`);
      }
      
      const provider = instance.provider.toUpperCase();
      
      // For self-hosted VMs
      if (provider === 'SELFHOSTED') {
        const vmName = instance.config?.vmName;
        const kvmHost = instance.config?.kvmHost;
        
        if (!vmName || !kvmHost) {
          throw new Error('Missing VM configuration');
        }
        
        // Create SSH connection config
        const sshConfig = {
          host: kvmHost,
          port: instance.config?.sshPort || 22,
          username: instance.config?.sshUser || 'root',
          readyTimeout: 10000
        };
        
        // Add authentication method
        if (instance.config?.sshPassword) {
          sshConfig.password = instance.config.sshPassword;
        } else {
          // Use agent-based authentication if no password is provided
          sshConfig.agent = process.env.SSH_AUTH_SOCK;
        }
        
        // Check if the VM process is running
        const checkCommand = `ps aux | grep -v grep | grep "${vmName}" | wc -l`;
        const result = await executeSSHCommand(sshConfig, checkCommand);
        
        const isRunning = parseInt(result.trim()) > 0;
        
        // Update the instance status if it doesn't match reality
        if (isRunning && instance.status !== 'running') {
          await Instance.update(id, { status: 'running' });
        } else if (!isRunning && instance.status !== 'stopped') {
          await Instance.update(id, { status: 'stopped' });
        }
        
        return isRunning;
      } else {
        // For cloud providers, we would make an API call to check the status
        // For now, just return the current status
        return instance.status === 'running';
      }
    } catch (error) {
      console.error(`Error checking VM status for instance with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Clean up orphaned VMs that are in virsh but not in our database
   * @param {string} hostIp - The IP address of the KVM host
   * @param {Object} sshConfig - SSH connection config
   * @returns {Promise<Array>} List of cleaned up VMs
   */
  cleanupOrphanedVMs: async (hostIp, sshConfig) => {
    try {
      console.log(`Cleaning up orphaned VMs on host ${hostIp}`);
      
      // Get all instances in our database for this host
      const allInstances = await Instance.findAll({ 
        provider: 'SELFHOSTED'
      });
      
      const managedVMs = allInstances
        .filter(instance => instance.config?.kvmHost === hostIp)
        .map(instance => instance.config?.vmName)
        .filter(Boolean);
      
      console.log(`Managed VMs in database for host ${hostIp}:`, managedVMs);
      
      // Get all VMs from virsh
      const virshListOutput = await executeSSHCommand(sshConfig, `virsh list --all`);
      const virshVMs = [];
      
      // Parse virsh output to get VM names
      const lines = virshListOutput.split('\n');
      for (let i = 2; i < lines.length; i++) { // Skip header lines
        const line = lines[i].trim();
        if (!line) continue;
        
        const parts = line.split(/\s+/);
        if (parts.length >= 3) {
          const vmName = parts[1];
          virshVMs.push(vmName);
        }
      }
      
      console.log(`VMs found in virsh on host ${hostIp}:`, virshVMs);
      
      // Find orphaned VMs (in virsh but not in our database)
      const orphanedVMs = virshVMs.filter(vm => !managedVMs.includes(vm));
      
      console.log(`Orphaned VMs on host ${hostIp}:`, orphanedVMs);
      
      // Clean up each orphaned VM
      const cleanedVMs = [];
      for (const vmName of orphanedVMs) {
        try {
          // Check if VM is running and stop it if needed
          const vmState = await executeSSHCommand(sshConfig, `virsh domstate ${vmName}`);
          
          if (vmState.trim() === 'running') {
            console.log(`Stopping orphaned VM ${vmName}`);
            await executeSSHCommand(sshConfig, `virsh destroy ${vmName}`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          
          // Undefine the VM
          console.log(`Undefining orphaned VM ${vmName}`);
          await executeSSHCommand(sshConfig, `virsh undefine ${vmName} --remove-all-storage`);
          
          cleanedVMs.push(vmName);
        } catch (error) {
          console.error(`Error cleaning up orphaned VM ${vmName}:`, error);
        }
      }
      
      return cleanedVMs;
    } catch (error) {
      console.error(`Error cleaning up orphaned VMs on host ${hostIp}:`, error);
      throw error;
    }
  },
  
  /**
   * Get SSH connection details for an instance
   * @param {string} id - Instance ID
   * @returns {Promise<Object>} SSH connection details
   */
  getSSHConnectionDetails: async (id) => {
    try {
      const instance = await Instance.findById(id);
      
      if (!instance) {
        throw new Error(`Instance with ID ${id} not found`);
      }
      
      const provider = instance.provider.toUpperCase();
      
      // For self-hosted VMs
      if (provider === 'SELFHOSTED') {
        const vmName = instance.config?.vmName;
        const kvmHost = instance.config?.kvmHost;
        
        if (!vmName || !kvmHost) {
          throw new Error('Missing VM configuration');
        }
        
        // Get SSH connection details
        const sshDetails = {
          host: instance.ip_address,
          port: instance.config?.vmSshPort || 22,
          username: instance.config?.sshUser || 'root',
          // We don't send the password for security reasons
          // The frontend will need to prompt for it
          authMethod: instance.config?.sshPassword ? 'password' : 'key',
          vmName: vmName,
          status: await module.exports.checkVmStatus(id)
        };
        
        return sshDetails;
      } else {
        // For cloud providers
        return {
          host: instance.ip_address,
          port: 22,
          username: instance.config?.sshUser || 'root',
          authMethod: 'key',
          status: instance.status === 'running'
        };
      }
    } catch (error) {
      console.error(`Error getting SSH connection details for instance with ID ${id}:`, error);
      throw error;
    }
  }
};

module.exports = instanceService; 