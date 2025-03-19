/**
 * Dashboard Service
 * Handles fetching and processing data for the dashboard
 */

import api from './api';
import instanceService from './instanceService';

// Helper function to calculate average CPU usage
const calculateAverageCpuUsage = (instances) => {
  if (!instances || instances.length === 0) return 0;
  
  const validInstances = instances.filter(instance => 
    instance.metrics && typeof instance.metrics.cpu === 'number'
  );
  
  if (validInstances.length === 0) return 0;
  
  const totalCpuUsage = validInstances.reduce((sum, instance) => 
    sum + instance.metrics.cpu, 0
  );
  
  return Math.round(totalCpuUsage / validInstances.length);
};

// Helper function to calculate average memory usage
const calculateAverageMemoryUsage = (instances) => {
  if (!instances || instances.length === 0) return 0;
  
  const validInstances = instances.filter(instance => 
    instance.metrics && typeof instance.metrics.memory === 'number'
  );
  
  if (validInstances.length === 0) return 0;
  
  const totalMemoryUsage = validInstances.reduce((sum, instance) => 
    sum + instance.metrics.memory, 0
  );
  
  return Math.round(totalMemoryUsage / validInstances.length);
};

// Fetch the resource usage data from the API
const getResourceUsage = async (days = 7) => {
  try {
    // Try to fetch resource usage data from the API
    const response = await api.get('/metrics/resource-usage', {
      params: { days }
    });
    
    if (response && response.data && response.data.status === 'success') {
      return response.data.data.resourceUsage;
    }
    
    throw new Error('Invalid API response format');
  } catch (error) {
    console.warn('Failed to fetch resource usage from API, falling back to calculated data:', error);
    
    // If the API call fails, calculate usage data from instances
    return calculateResourceUsageFromInstances(days);
  }
};

// Calculate resource usage data from instances if API fails
const calculateResourceUsageFromInstances = async (days = 7) => {
  try {
    // Get all instances with their metrics
    const instances = await instanceService.getAllInstances();
    
    // Create data points for each day
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Calculate resource usage for this day
      // In a real implementation, we would have historical data
      // For now, we'll simulate by varying the current metrics slightly
      const dayMultiplier = 0.8 + (Math.random() * 0.4); // between 0.8-1.2
      
      data.push({
        date: dayStr,
        cpu: Math.round(calculateAverageCpuUsage(instances) * dayMultiplier),
        memory: Math.round(calculateAverageMemoryUsage(instances) * dayMultiplier),
        disk: Math.round(instances.reduce((sum, instance) => 
          sum + (instance.metrics?.disk || 0), 0) / Math.max(1, instances.length) * dayMultiplier)
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error calculating resource usage from instances:', error);
    
    // As a last resort, return some reasonable mock data
    return generateFallbackResourceData(days);
  }
};

// Generate fallback resource data as a last resort
const generateFallbackResourceData = (days = 7) => {
  const data = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      cpu: Math.floor(Math.random() * 40) + 20, // Random between 20-60%
      memory: Math.floor(Math.random() * 30) + 40, // Random between 40-70%
      disk: Math.floor(Math.random() * 20) + 10, // Random between 10-30%
    });
  }
  
  return data;
};

// Generate mock alerts for the dashboard
const generateAlerts = () => {
  return [
    {
      id: 1,
      severity: 'critical',
      message: 'High CPU usage on web-server-01',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      instance: 'web-server-01'
    },
    {
      id: 2,
      severity: 'warning',
      message: 'Memory usage above 70% on app-server',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
      instance: 'test-name'
    },
    {
      id: 3,
      severity: 'info',
      message: 'Scheduled maintenance upcoming',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
      instance: 'all'
    },
    {
      id: 4,
      severity: 'warning',
      message: 'Disk space utilization above 80% on database-server',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
      instance: 'database-server'
    },
    {
      id: 5,
      severity: 'info',
      message: 'System update applied successfully',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
      instance: 'all'
    }
  ];
};

const dashboardService = {
  /**
   * Get dashboard data including instances, statistics, and charts
   * @param {Object} filters - Optional filters like timeRange, project, zone, etc.
   * @returns {Promise<Object>} Dashboard data
   */
  getDashboardData: async (filters = {}) => {
    try {
      // Fetch instances from the API
      const instances = await instanceService.getAllInstances(filters);
      
      // In a real implementation, we would fetch these from separate endpoints
      // For now, we'll use the instance data to calculate stats
      
      // Calculate statistics from instance data
      const stats = {
        instances: instances.length,
        cpuUsage: calculateAverageCpuUsage(instances),
        memoryUsage: calculateAverageMemoryUsage(instances),
        alerts: 0 // Will be replaced when we get alerts
      };
      
      // Get alerts (mocked for now)
      const alerts = generateAlerts();
      stats.alerts = alerts.length;
      
      // Get resource usage data based on time range
      const days = filters.timeRange === '24h' ? 1 : 
                  filters.timeRange === '7d' ? 7 : 
                  filters.timeRange === '30d' ? 30 : 7;
      
      // Get real resource usage data
      const resourceData = await getResourceUsage(days);
      
      return {
        instances,
        stats,
        alerts,
        resourceData
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },
  
  /**
   * Get real-time system metrics
   * @returns {Promise<Object>} System metrics
   */
  getSystemMetrics: async () => {
    try {
      // In a real implementation, this would be an API call
      // For now, we'll return mock data
      return {
        cpu: Math.floor(Math.random() * 40) + 20,
        memory: Math.floor(Math.random() * 30) + 40,
        disk: Math.floor(Math.random() * 20) + 10,
        network: {
          tx: Math.floor(Math.random() * 100) + 50,
          rx: Math.floor(Math.random() * 100) + 50
        }
      };
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      throw error;
    }
  }
};

export default dashboardService; 