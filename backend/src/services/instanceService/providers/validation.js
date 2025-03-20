/**
 * Provider credential validation
 */

const axios = require('axios');
const cloudProviders = require('./config');

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
        
      case 'SELF HOST':
        // For self-hosted, we just check if it's enabled
        if (!providerConfig.enabled) {
          throw new Error('Self-hosted provider is not enabled');
        }
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

module.exports = {
  validateProviderCredentials
};