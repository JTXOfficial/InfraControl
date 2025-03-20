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

module.exports = {
  mapInstanceToFrontend
};