/**
 * Core Instance Operations
 */

const { Instance } = require('../../../models');
const { v4: uuidv4 } = require('uuid');
const { validateProviderCredentials } = require('../providers/validation');
const { updateSystemUsageOnCreation } = require('../monitoring/systemUsage');
const cloudProviders = require('../providers/config');

/**
 * Get all instances with optional filtering
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} List of instances
 */
const getAllInstances = async (filters = {}) => {
  try {
    return await Instance.findAll(filters);
  } catch (error) {
    console.error('Error getting all instances:', error);
    throw error;
  }
};

/**
 * Get instance by ID
 * @param {string} id - Instance ID
 * @returns {Promise<Object>} Instance details
 */
const getInstanceById = async (id) => {
  try {
    return await Instance.findById(id);
  } catch (error) {
    console.error(`Error getting instance with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new instance
 * @param {Object} instanceData - Instance data
 * @returns {Promise<Object>} Created instance
 */
const createInstance = async (instanceData) => {
  try {
    const provider = instanceData.provider.toUpperCase();
    
    // For self-hosted machines
    if (provider === 'SELF HOST') {
      if (!instanceData.ip_address) {
        throw new Error('IP address is required for self-hosted machines');
      }
      
      const newInstance = await Instance.create({
        name: instanceData.name,
        type: instanceData.type || 'vm',
        status: 'running',
        provider: 'SELF HOST',
        zone: instanceData.zone,
        region: instanceData.zone,
        project_id: instanceData.project,
        ip_address: instanceData.ip_address,
        cpu: instanceData.cpu || 1,
        memory: instanceData.memory || 1,
        disk: instanceData.disk || 20,
        config: {
          ...instanceData.config,
          provisionedAt: new Date().toISOString()
        }
      });

      return await updateSystemUsageOnCreation(newInstance);
    }
    
    // For cloud providers
    if (!cloudProviders[provider]) {
      throw new Error(`Unsupported cloud provider: ${provider}`);
    }
    
    await validateProviderCredentials(provider);
    
    // Create initial database record
    const newInstance = await Instance.create(instanceData);
    
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
      let providerResponse = await simulateProviderCreation(provider, providerConfig, provisioningData);
      
      // Extract IP address and instance ID from provider response
      const { ipAddress, providerInstanceId } = extractProviderResponseData(provider, providerResponse);
      
      // Update the instance with the provider's response data
      return await Instance.update(newInstance.id, {
        status: 'running',
        ip_address: ipAddress,
        config: {
          ...instanceData.config,
          providerInstanceId,
          providerResponse: JSON.stringify(providerResponse),
          provisionedAt: new Date().toISOString()
        }
      });
    } catch (providerError) {
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
};

/**
 * Update an existing instance
 * @param {string} id - Instance ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated instance
 */
const updateInstance = async (id, updateData) => {
  try {
    return await Instance.update(id, updateData);
  } catch (error) {
    console.error(`Error updating instance with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete an instance
 * @param {string} id - Instance ID
 * @returns {Promise<boolean>} Success status
 */
const deleteInstance = async (id) => {
  try {
    const instance = await Instance.findById(id);
    
    if (!instance) {
      return false;
    }
    
    const provider = instance.provider.toUpperCase();
    
    if (provider === 'SELF HOST') {
      console.log(`Deleting self-hosted instance record in database for ${instance.name}`);
    } else if (provider && instance.config?.providerInstanceId && cloudProviders[provider]) {
      await simulateProviderDeletion(provider, instance);
    }
    
    const deletedInstance = await Instance.delete(id);
    return !!deletedInstance;
  } catch (error) {
    console.error(`Error deleting instance with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Change instance state (start, stop, restart)
 * @param {string} id - Instance ID
 * @param {string} action - Action to perform (start, stop, restart)
 * @returns {Promise<Object>} Updated instance state
 */
const changeInstanceState = async (id, action) => {
  try {
    const instance = await Instance.findById(id);
    
    if (!instance) {
      return null;
    }
    
    const provider = instance.provider.toUpperCase();
    const providerInstanceId = instance.config?.providerInstanceId;
    
    // For self-hosted instances, just update the database status
    if (provider === 'SELF HOST') {
      return await updateInstanceState(instance, action);
    }
    
    if (provider && providerInstanceId && cloudProviders[provider]) {
      await simulateProviderStateChange(provider, instance, action);
      return await updateInstanceState(instance, action);
    }
    
    return null;
  } catch (error) {
    console.error(`Error changing instance state:`, error);
    throw error;
  }
};

// Helper functions

const simulateProviderCreation = async (provider, providerConfig, provisioningData) => {
  console.log(`Creating ${provider} instance with config:`, { 
    provider,
    region: provisioningData.region,
    instanceType: provisioningData.instanceType
  });
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  switch (provider) {
    case 'AWS':
      return {
        InstanceId: `i-${uuidv4().substring(0, 8)}`,
        PrivateIpAddress: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        PublicIpAddress: `54.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        State: { Name: 'running' }
      };
    case 'GCP':
      return {
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
    case 'AZURE':
      return {
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
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
};

const extractProviderResponseData = (provider, providerResponse) => {
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
  
  return { ipAddress, providerInstanceId };
};

const simulateProviderDeletion = async (provider, instance) => {
  console.log(`Simulating ${provider} instance deletion for ${instance.config.providerInstanceId}`);
  await new Promise(resolve => setTimeout(resolve, 1500));
};

const simulateProviderStateChange = async (provider, instance, action) => {
  console.log(`Simulating ${provider} instance ${action} for ${instance.config.providerInstanceId}`);
  await new Promise(resolve => setTimeout(resolve, 1500));
};

const updateInstanceState = async (instance, action) => {
  let newStatus;
  switch (action) {
    case 'start':
      newStatus = 'running';
      break;
    case 'stop':
    case 'force-stop':
      newStatus = 'stopped';
      break;
    case 'restart':
      newStatus = 'running';
      break;
    default:
      throw new Error(`Unsupported action: ${action}`);
  }
  
  return await Instance.update(instance.id, {
    status: newStatus,
    config: {
      ...instance.config,
      lastStateChange: new Date().toISOString(),
      lastAction: action
    }
  });
};

module.exports = {
  getAllInstances,
  getInstanceById,
  createInstance,
  updateInstance,
  deleteInstance,
  changeInstanceState
};