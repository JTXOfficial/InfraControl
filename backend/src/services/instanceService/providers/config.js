/**
 * Cloud provider configuration
 */

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
  'SELF HOST': {
    enabled: process.env.SELF_HOSTED_ENABLED === 'true' || true,
    sshKeyPath: process.env.SELF_HOSTED_SSH_KEY_PATH || '~/.ssh/id_rsa',
    defaultUser: process.env.SELF_HOSTED_DEFAULT_USER || 'admin',
    defaultPort: parseInt(process.env.SELF_HOSTED_DEFAULT_PORT || '22', 10)
  }
};

module.exports = cloudProviders;