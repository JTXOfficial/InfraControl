/**
 * Instance Service
 * Handles all operations related to infrastructure instances
 */

const { executeSSHCommand } = require('./ssh/operations');
const { fetchSystemUsage } = require('./monitoring/systemUsage');
const { validateProviderCredentials } = require('./providers/validation');
const cloudProviders = require('./providers/config');
const {
  getAllInstances,
  getInstanceById,
  createInstance,
  updateInstance,
  deleteInstance,
  changeInstanceState
} = require('./core/operations');

const instanceService = {
  // Core instance operations
  getAllInstances,
  getInstanceById,
  createInstance,
  updateInstance,
  deleteInstance,
  changeInstanceState,

  // SSH operations
  executeSSHCommand,

  // System monitoring
  fetchSystemUsage,

  // Provider operations
  validateProviderCredentials,
  
  // Configuration
  cloudProviders
};

module.exports = instanceService;