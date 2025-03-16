import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid,
  Divider,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  useTheme,
  CircularProgress
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import instanceService from '../../services/instanceService';

/**
 * Custom tooltip formatter for metrics charts
 */
const CustomTooltip = ({ active, payload, label, theme }) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 1.5,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Box key={`item-${index}`} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                backgroundColor: entry.color,
                mr: 1,
                borderRadius: '50%',
              }}
            />
            <Typography variant="body2" sx={{ mr: 1 }}>
              {entry.name}:
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {entry.value}%
            </Typography>
          </Box>
        ))}
      </Paper>
    );
  }
  return null;
};

/**
 * Custom tooltip for network chart
 */
const NetworkTooltip = ({ active, payload, label, theme }) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 1.5,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Box key={`item-${index}`} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                backgroundColor: entry.color,
                mr: 1,
                borderRadius: '50%',
              }}
            />
            <Typography variant="body2" sx={{ mr: 1 }}>
              {entry.name}:
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {entry.value} Mbps
            </Typography>
          </Box>
        ))}
      </Paper>
    );
  }
  return null;
};

/**
 * Metrics tab component showing historical metrics
 * @param {Object} props - Component props
 * @param {Object} props.instance - Instance data
 * @param {Object} props.metrics - Current metrics data
 * @param {Date} props.lastUpdated - Last updated timestamp
 * @param {Function} props.onRefresh - Refresh handler
 * @returns {JSX.Element} MetricsTab component
 */
const MetricsTab = ({ instance, metrics, lastUpdated, onRefresh }) => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('24h');
  const [metricsHistory, setMetricsHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const pollingRef = useRef(null);
  const pollingInterval = 3000; // 3 seconds

  // Calculate average metrics
  const calculateAverageMetrics = () => {
    if (!metricsHistory || metricsHistory.length === 0) {
      return {
        cpu: 0,
        memory: 0,
        disk: 0,
        network: 0
      };
    }
    
    const sum = metricsHistory.reduce((acc, item) => {
      // Handle different network data structures
      const networkTotal = item.networkIn !== undefined && item.networkOut !== undefined
        ? (item.networkIn + item.networkOut)
        : (item.network?.in || 0) + (item.network?.out || 0);
      
      return {
        cpu: acc.cpu + (item.cpu || 0),
        memory: acc.memory + (item.memory || 0),
        disk: acc.disk + (item.disk || 0),
        network: acc.network + networkTotal
      };
    }, { cpu: 0, memory: 0, disk: 0, network: 0 });
    
    const count = metricsHistory.length;
    
    return {
      cpu: Math.round(sum.cpu / count),
      memory: Math.round(sum.memory / count),
      disk: Math.round(sum.disk / count),
      network: Math.round((sum.network / count) * 10) / 10 // Round to 1 decimal place
    };
  };
  
  const averageMetrics = calculateAverageMetrics();

  // Fetch metrics history based on time range
  const fetchMetricsHistory = async () => {
    try {
      setLoading(true);
      console.log(`Fetching metrics history for time range: ${timeRange}`);
      
      // Try to fetch metrics history from the API
      try {
        const response = await instanceService.getInstanceMetricsHistory(instance.id, timeRange);
        if (response && response.status === 'success' && response.data && response.data.history) {
          console.log('Received metrics history from API:', response.data.history);
          
          // Normalize the data format
          const normalizedData = response.data.history.map(item => ({
            ...item,
            networkIn: item.networkIn !== undefined ? item.networkIn : (item.network?.in || 0),
            networkOut: item.networkOut !== undefined ? item.networkOut : (item.network?.out || 0)
          }));
          
          setMetricsHistory(normalizedData);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.log('API metrics history not available, generating mock data:', error.message);
        // Continue with mock data generation if API fails
      }
      
      // Generate mock data for demonstration purposes
      // Determine number of data points based on time range
      let dataPoints = 12;
      let timeFormat = 'HH:mm';
      
      switch(timeRange) {
        case '1h':
          dataPoints = 12; // 5-minute intervals
          timeFormat = 'HH:mm';
          break;
        case '6h':
          dataPoints = 12; // 30-minute intervals
          timeFormat = 'HH:mm';
          break;
        case '24h':
          dataPoints = 24; // 1-hour intervals
          timeFormat = 'HH:mm';
          break;
        case '7d':
          dataPoints = 7; // 1-day intervals
          timeFormat = 'MM/DD';
          break;
        case '30d':
          dataPoints = 30; // 1-day intervals
          timeFormat = 'MM/DD';
          break;
        default:
          dataPoints = 24;
      }
      
      // Generate timestamps based on current time and time range
      const now = new Date();
      const historyData = [];
      
      for (let i = dataPoints - 1; i >= 0; i--) {
        const timestamp = new Date();
        
        if (timeRange === '1h') {
          timestamp.setMinutes(now.getMinutes() - (i * 5));
        } else if (timeRange === '6h') {
          timestamp.setMinutes(now.getMinutes() - (i * 30));
        } else if (timeRange === '24h') {
          timestamp.setHours(now.getHours() - i);
        } else if (timeRange === '7d' || timeRange === '30d') {
          timestamp.setDate(now.getDate() - i);
        }
        
        // Format the time label based on the time range
        let timeLabel;
        if (timeFormat === 'HH:mm') {
          timeLabel = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
          timeLabel = timestamp.toLocaleDateString([], { month: 'numeric', day: 'numeric' });
        }
        
        // Generate random metrics data with some trend
        // For demo purposes, we'll make the data somewhat realistic
        const baselineCpu = 20 + Math.random() * 30;
        const baselineMemory = 30 + Math.random() * 40;
        const baselineDisk = 40 + Math.random() * 10;
        const baselineNetworkIn = 5 + Math.random() * 15;
        const baselineNetworkOut = 3 + Math.random() * 10;
        
        // Add some peaks during "business hours" if using 24h or longer time range
        let timeMultiplier = 1;
        if (timeRange !== '1h' && timeRange !== '6h') {
          const hour = timestamp.getHours();
          if (hour >= 9 && hour <= 17) {
            timeMultiplier = 1.5; // Higher usage during business hours
          }
        }
        
        // If instance is not running, set very low values
        const isRunning = instance.status === 'running';
        const runningMultiplier = isRunning ? 1 : 0.1;
        
        historyData.push({
          time: timeLabel,
          timestamp: timestamp.getTime(),
          cpu: Math.round(baselineCpu * timeMultiplier * runningMultiplier),
          memory: Math.round(baselineMemory * timeMultiplier * runningMultiplier),
          disk: Math.round(baselineDisk * runningMultiplier),
          networkIn: Math.round(baselineNetworkIn * timeMultiplier * runningMultiplier),
          networkOut: Math.round(baselineNetworkOut * timeMultiplier * runningMultiplier)
        });
      }
      
      // Add the current metrics as the last data point
      historyData.push({
        time: 'Now',
        timestamp: now.getTime(),
        cpu: metrics.cpu,
        memory: metrics.memory,
        disk: metrics.disk,
        networkIn: typeof metrics.network === 'object' ? (metrics.network.in || 0) : Math.round(metrics.network * 0.6),
        networkOut: typeof metrics.network === 'object' ? (metrics.network.out || 0) : Math.round(metrics.network * 0.4)
      });
      
      console.log(`Generated ${historyData.length} data points for metrics history`);
      setMetricsHistory(historyData);
      
    } catch (error) {
      console.error('Error fetching metrics history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Start metrics polling
  const startMetricsPolling = () => {
    console.log('Starting metrics history polling');
    
    // Clear any existing interval
    stopMetricsPolling();
    
    // Set up new polling interval
    pollingRef.current = setInterval(() => {
      fetchMetricsHistory();
    }, pollingInterval);
    
    console.log('Metrics history polling started');
  };

  // Stop metrics polling
  const stopMetricsPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
      console.log('Metrics history polling stopped');
    }
  };

  // Update metrics history when time range changes or metrics update
  useEffect(() => {
    if (instance && metrics) {
      fetchMetricsHistory();
    }
  }, [timeRange, metrics, instance]);

  // Start polling when component mounts, stop when unmounts
  useEffect(() => {
    if (instance && metrics) {
      startMetricsPolling();
    }
    
    return () => {
      stopMetricsPolling();
    };
  }, [instance, metrics]);

  // Handle time range change
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const handleRefresh = () => {
    // Show a brief animation to indicate refresh
    const button = document.getElementById('refresh-metrics-history-button');
    if (button) {
      button.classList.add('rotating');
      setTimeout(() => {
        button.classList.remove('rotating');
      }, 1000);
    }
    
    // Call the parent refresh function if provided
    if (onRefresh) {
      onRefresh();
    }
    
    fetchMetricsHistory();
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Resource Metrics
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              {lastUpdated && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={12} sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Auto-updating • Last updated: {lastUpdated.toLocaleTimeString()}
                  </Typography>
                </Box>
              )}
            </Box>
            <IconButton 
              onClick={handleRefresh}
              title="Refresh metrics history"
              id="refresh-metrics-history-button"
              sx={{
                mr: 2,
                '@keyframes rotate': {
                  '0%': {
                    transform: 'rotate(0deg)',
                  },
                  '100%': {
                    transform: 'rotate(360deg)',
                  },
                },
                '&.rotating': {
                  animation: 'rotate 1s linear',
                },
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="time-range-label">Time Range</InputLabel>
              <Select
                labelId="time-range-label"
                id="time-range-select"
                value={timeRange}
                label="Time Range"
                onChange={handleTimeRangeChange}
              >
                <MenuItem value="1h">Last Hour</MenuItem>
                <MenuItem value="6h">Last 6 Hours</MenuItem>
                <MenuItem value="24h">Last 24 Hours</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      {metricsHistory.length > 0 ? Math.max(...metricsHistory.map(item => item.cpu || 0)) : 0}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Peak CPU Usage
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {averageMetrics.cpu}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography variant="h6" color="secondary" gutterBottom>
                      {metricsHistory.length > 0 ? Math.max(...metricsHistory.map(item => item.memory || 0)) : 0}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Peak Memory Usage
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {averageMetrics.memory}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography variant="h6" color="error" gutterBottom>
                      {metricsHistory.length > 0 ? Math.max(...metricsHistory.map(item => item.disk || 0)) : 0}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Peak Disk Usage
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {averageMetrics.disk}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography variant="h6" color="success" gutterBottom>
                      {metricsHistory.length > 0 
                        ? Math.max(...metricsHistory.map(item => {
                            // Handle different network data structures
                            if (item.networkIn !== undefined && item.networkOut !== undefined) {
                              return (item.networkIn + item.networkOut);
                            } else if (item.network) {
                              return (item.network.in || 0) + (item.network.out || 0);
                            }
                            return 0;
                          })).toFixed(1)
                        : '0.0'} Mbps
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Peak Network Traffic
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {averageMetrics.network.toFixed(1)} Mbps
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              CPU Usage (%)
            </Typography>
            <Paper sx={{ p: 2, height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={metricsHistory}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip content={(props) => <CustomTooltip {...props} theme={theme} />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cpu" 
                    name="CPU Usage" 
                    stroke={theme.palette.primary.main} 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Memory Usage (%)
            </Typography>
            <Paper sx={{ p: 2, height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={metricsHistory}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip content={(props) => <CustomTooltip {...props} theme={theme} />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="memory" 
                    name="Memory Usage" 
                    stroke={theme.palette.secondary.main}
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Disk Usage (%)
            </Typography>
            <Paper sx={{ p: 2, height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={metricsHistory}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip content={(props) => <CustomTooltip {...props} theme={theme} />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="disk" 
                    name="Disk Usage" 
                    stroke={theme.palette.error.main}
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Network Traffic (Mbps)
            </Typography>
            <Paper sx={{ p: 2, height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={metricsHistory.map(item => ({
                    ...item,
                    // Ensure consistent network data format
                    networkIn: item.networkIn !== undefined ? item.networkIn : (item.network?.in || 0),
                    networkOut: item.networkOut !== undefined ? item.networkOut : (item.network?.out || 0)
                  }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip content={(props) => <NetworkTooltip {...props} theme={theme} />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="networkIn" 
                    name="Inbound" 
                    stroke={theme.palette.success.main} 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="networkOut" 
                    name="Outbound" 
                    stroke={theme.palette.warning.main} 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default MetricsTab;