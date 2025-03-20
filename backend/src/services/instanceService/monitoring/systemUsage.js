/**
 * System Usage Monitoring
 */

const { Instance } = require('../../../models');
const util = require('util');
const { exec } = require('child_process');
const execPromise = util.promisify(exec);

/**
 * Fetch system usage data for an instance
 * @param {string} id - Instance ID
 * @returns {Promise<Object>} Updated instance with system usage data
 */
const fetchSystemUsage = async (id) => {
  try {
    // First get the instance details
    const instance = await Instance.findById(id);
    
    if (!instance) {
      throw new Error(`Instance with ID ${id} not found`);
    }
    
    // Only fetch for self-hosted instances
    if (instance.provider.toUpperCase() !== 'SELF HOST' || !instance.ip_address) {
      console.log(`Skipping system usage fetch for non-self-hosted or instances without IP: ${instance.name}`);
      return instance;
    }
    
    console.log(`Fetching system usage data for instance ${id} at ${instance.ip_address}`);
    
    // Create URL with the IP address
    const systemUsageUrl = `http://${instance.ip_address}:3000/api/system-usage`;
    
    // Execute curl command with a 5 second timeout
    console.log(`Executing curl command: curl -s -m 5 ${systemUsageUrl}`);
    const { stdout, stderr } = await execPromise(`curl -s -m 5 ${systemUsageUrl}`);
    
    if (stderr) {
      console.error('Curl command error:', stderr);
      throw new Error(`Curl command error: ${stderr}`);
    }
    
    if (!stdout) {
      console.error('Empty response from curl command');
      throw new Error('Empty response from curl command');
    }
    
    console.log('Curl command response:', stdout);
    
    // Parse the JSON response
    const response = JSON.parse(stdout);
    
    console.log('Successfully fetched system usage data:', response);
    
    // Update the instance with the system usage data
    const updatedInstance = await Instance.update(id, {
      config: {
        ...instance.config,
        systemUsage: response,
        lastSystemUsageCheck: new Date().toISOString()
      }
    });
    
    return updatedInstance;
  } catch (error) {
    console.error(`Error fetching system usage for instance with ID ${id}:`, error);
    return null;
  }
};

/**
 * Update system usage data during instance creation
 * @param {Object} instance - Instance object
 * @returns {Promise<Object>} Updated instance with system usage data
 */
const updateSystemUsageOnCreation = async (instance) => {
  try {
    if (instance.provider.toUpperCase() !== 'SELF HOST' || !instance.ip_address) {
      return instance;
    }

    console.log(`Fetching initial system usage data for instance ${instance.id} at ${instance.ip_address}`);
    
    const systemUsageUrl = `http://${instance.ip_address}:3000/api/system-usage`;
    const { stdout, stderr } = await execPromise(`curl -s -m 5 ${systemUsageUrl}`);
    
    if (stderr || !stdout) {
      console.log(`Could not fetch initial system usage data: ${stderr || 'Empty response'}`);
      return instance;
    }
    
    const response = JSON.parse(stdout);
    
    // Update the instance with the system usage data
    const updatedInstance = await Instance.update(instance.id, {
      config: {
        ...instance.config,
        systemUsage: response,
        lastSystemUsageCheck: new Date().toISOString()
      }
    });
    
    return updatedInstance;
  } catch (error) {
    console.log(`Could not fetch initial system usage data: ${error.message}`);
    return instance;
  }
};

module.exports = {
  fetchSystemUsage,
  updateSystemUsageOnCreation
};