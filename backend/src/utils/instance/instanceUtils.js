const parseUsageValue = (value) => {
  if (typeof value === 'number') {
    return value;
  }
  
  if (value === 'NaN') {
    return 0;
  }
  
  const match = value?.match(/(\d+(\.\d+)?)/);
  return match && match[1] ? parseFloat(match[1]) : 0;
};

const parseSystemUsage = (systemUsage) => {
  const metrics = {
    cpu: 45, // Default values
    memory: 62,
    disk: 30,
    lastUpdated: new Date().toISOString()
  };

  if (!systemUsage) {
    return metrics;
  }

  // Parse CPU usage
  if (systemUsage.cpuUsage) {
    metrics.cpu = parseUsageValue(systemUsage.cpuUsage);
  }

  // Parse memory usage
  if (systemUsage.memoryUsage && systemUsage.memoryUsage.percentUsed) {
    metrics.memory = parseUsageValue(systemUsage.memoryUsage.percentUsed);
  }

  // Parse disk usage
  if (systemUsage.diskUsage && systemUsage.diskUsage.percentUsed) {
    metrics.disk = parseUsageValue(systemUsage.diskUsage.percentUsed);
  }

  // Update timestamp
  if (systemUsage.lastSystemUsageCheck) {
    metrics.lastUpdated = systemUsage.lastSystemUsageCheck;
  }

  return metrics;
};

const createSshConfig = ({ host, port = 22, username = 'root', password, useAgent = true }) => {
  const config = {
    host,
    port,
    username,
    readyTimeout: 20000,
    keepaliveInterval: 10000
  };

  if (password) {
    config.password = password;
  } else if (useAgent && process.env.SSH_AUTH_SOCK) {
    config.agent = process.env.SSH_AUTH_SOCK;
    config.tryKeyboard = true;
  }

  return config;
};

module.exports = {
  parseUsageValue,
  parseSystemUsage,
  createSshConfig
};