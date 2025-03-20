// Status color mapping
export const getStatusColor = (status) => {
  switch(status?.toLowerCase()) {
    case 'running':
      return 'success';
    case 'stopped':
      return 'error';
    case 'provisioning':
      return 'warning';
    default:
      return 'default';
  }
};

// Severity color mapping
export const getSeverityColor = (severity, theme) => {
  switch(severity?.toLowerCase()) {
    case 'critical':
      return theme.palette.error.main;
    case 'warning':
      return theme.palette.warning.main;
    case 'info':
      return theme.palette.info.main;
    default:
      return theme.palette.text.secondary;
  }
};

// Format timestamp to locale string
export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

// Get time range label
export const getTimeRangeLabel = (timeRange) => {
  switch(timeRange) {
    case '24h':
      return 'Last 24 Hours';
    case '7d':
      return 'Last 7 Days';
    case '30d':
      return 'Last 30 Days';
    case 'custom':
      return 'Custom Range';
    default:
      return 'Last 7 Days';
  }
};

// Calculate current resource usage from resource data
export const getCurrentResourceUsage = (resourceData) => {
  if (!resourceData || resourceData.length === 0) {
    return { cpu: 0, memory: 0, disk: 0 };
  }
  return resourceData[resourceData.length - 1];
};

// Calculate average resource usage from resource data
export const getAverageResourceUsage = (resourceData) => {
  if (!resourceData || resourceData.length === 0) {
    return { cpu: 0, memory: 0, disk: 0 };
  }
  
  const sum = resourceData.reduce(
    (acc, item) => ({
      cpu: acc.cpu + (item.cpu || 0),
      memory: acc.memory + (item.memory || 0),
      disk: acc.disk + (item.disk || 0)
    }),
    { cpu: 0, memory: 0, disk: 0 }
  );
  
  const count = resourceData.length;
  return {
    cpu: Math.round(sum.cpu / count),
    memory: Math.round(sum.memory / count),
    disk: Math.round(sum.disk / count)
  };
};

// Filter instances based on search query and selected filters
export const filterInstances = (instances, searchQuery, selectedProject, selectedZone) => {
  return instances.filter(instance => {
    const matchesSearch = 
      searchQuery === '' || 
      instance.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instance.ip?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProject = 
      selectedProject === 'All Projects' || 
      instance.project === selectedProject;
    
    const matchesZone = 
      selectedZone === 'All Zones' || 
      instance.zone === selectedZone;
    
    return matchesSearch && matchesProject && matchesZone;
  });
};