import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
  Grid
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { format } from 'date-fns';
import instanceService from '../services/instanceService';
import { useSnackbar } from 'notistack';
import { useTheme } from '@mui/material/styles';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import SdCardIcon from '@mui/icons-material/SdCard';

// Import components
import TabPanel from '../components/instance/TabPanel';
import InstanceHeader from '../components/instance/InstanceHeader';
import InstanceInfo from '../components/instance/InstanceInfo';
import ResourceAllocation from '../components/instance/ResourceAllocation';
import CurrentUsage from '../components/instance/CurrentUsage';
import MetricsTab from '../components/instance/MetricsTab';
import ConsoleTab from '../components/instance/ConsoleTab';
import SettingsTab from '../components/instance/SettingsTab';
import MetricCard from '../components/instance/MetricCard';

// Maximum number of metrics data points to store
const MAX_METRICS_HISTORY = 100;

// Local storage key for metrics history
const getMetricsStorageKey = (instanceId) => `metrics_history_${instanceId}`;

const InstanceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [instance, setInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: { in: 0, out: 0 }
  });
  const [metricsHistory, setMetricsHistory] = useState([]);
  const [timeRange, setTimeRange] = useState('1h');
  const [activeTab, setActiveTab] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [status, setStatus] = useState('');
  const pollingRef = useRef(null);
  const pollingInterval = 3000; // 3 seconds
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  // Load metrics history from localStorage on component mount
  useEffect(() => {
    if (id) {
      loadMetricsHistory();
    }
  }, [id]);

  // Add metrics to history
  const addMetricsToHistory = (newMetrics) => {
    if (!newMetrics) return;
    
    // Add to history with timestamp
    const timestamp = new Date();
    setMetricsHistory(prev => {
      // Keep only the last MAX_METRICS_HISTORY data points to avoid memory issues
      const newHistory = [...prev, { ...newMetrics, timestamp }];
      if (newHistory.length > MAX_METRICS_HISTORY) {
        return newHistory.slice(-MAX_METRICS_HISTORY);
      }
      return newHistory;
    });
  };

  useEffect(() => {
    fetchInstanceDetails();
    
    // Start metrics polling when component mounts
    startMetricsPolling();
    
    // Clean up on unmount
    return () => {
      stopMetricsPolling();
    };
  }, [id]);

  // Save metrics history to localStorage whenever it changes
  useEffect(() => {
    if (id && metricsHistory.length > 0) {
      saveMetricsHistory();
    }
  }, [metricsHistory]);

  const loadMetricsHistory = () => {
    try {
      const storageKey = getMetricsStorageKey(id);
      const savedMetrics = localStorage.getItem(storageKey);
      
      if (savedMetrics) {
        const parsedMetrics = JSON.parse(savedMetrics);
        
        // Convert string timestamps back to Date objects
        const processedMetrics = parsedMetrics.map(item => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        
        setMetricsHistory(processedMetrics);
        console.log(`Loaded ${processedMetrics.length} metrics data points from localStorage`);
      }
    } catch (error) {
      console.error('Error loading metrics history from localStorage:', error);
    }
  };

  const saveMetricsHistory = () => {
    try {
      const storageKey = getMetricsStorageKey(id);
      localStorage.setItem(storageKey, JSON.stringify(metricsHistory));
    } catch (error) {
      console.error('Error saving metrics history to localStorage:', error);
    }
  };

  const fetchInstanceDetails = async () => {
    try {
      setLoading(true);
      const data = await instanceService.getInstanceById(id);
      console.log('Instance details:', data);
      setInstance(data);
      
      // Fetch initial metrics
      fetchInstanceMetrics();
    } catch (error) {
      console.error('Error fetching instance details:', error);
      enqueueSnackbar('Failed to load instance details', { variant: 'error' });
      navigate('/instances');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstanceMetrics = async () => {
    try {
      console.log(`Fetching metrics for instance ${id}`);
      
      // For demo purposes, generate random metrics
      // In production, this would be an API call
      const isRunning = instance && instance.status === 'running';
      
      // Generate more realistic metrics based on instance status
      const newMetrics = {
        cpu: isRunning ? Math.random() * 100 : Math.random() * 5,
        memory: isRunning ? 20 + Math.random() * 60 : Math.random() * 10,
        disk: 10 + Math.random() * 40,
        network: {
          in: isRunning ? Math.random() * 10 : Math.random() * 0.5,
          out: isRunning ? Math.random() * 8 : Math.random() * 0.3
        }
      };
      
      // Update current metrics
      setMetrics(newMetrics);
      
      // Add to history with timestamp
      const timestamp = new Date();
      setMetricsHistory(prev => {
        // Keep only the last MAX_METRICS_HISTORY data points to avoid memory issues
        const newHistory = [...prev, { ...newMetrics, timestamp }];
        if (newHistory.length > MAX_METRICS_HISTORY) {
          return newHistory.slice(-MAX_METRICS_HISTORY);
        }
        return newHistory;
      });
      
      // Update last updated timestamp
      setLastUpdated(new Date());
      
      console.log('Metrics updated:', newMetrics);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const startMetricsPolling = () => {
    console.log('Starting metrics polling');
    
    // Clear any existing interval
    stopMetricsPolling();
    
    // Set up new polling interval
    pollingRef.current = setInterval(() => {
      if (instance) {
        fetchInstanceMetrics();
      }
    }, pollingInterval);
    
    console.log('Metrics polling started');
  };

  const stopMetricsPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
      console.log('Metrics polling stopped');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleRefresh = () => {
    fetchInstanceDetails();
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    return format(lastUpdated, 'HH:mm:ss');
  };

  // Clear metrics history
  const clearMetricsHistory = () => {
    try {
      const storageKey = getMetricsStorageKey(id);
      localStorage.removeItem(storageKey);
      setMetricsHistory([]);
      enqueueSnackbar('Metrics history cleared', { variant: 'success' });
    } catch (error) {
      console.error('Error clearing metrics history:', error);
      enqueueSnackbar('Failed to clear metrics history', { variant: 'error' });
    }
  };

  const fetchInstance = async () => {
    try {
      setLoading(true);
      const data = await instanceService.getInstanceById(id);
      setInstance(data.instance);
      // Update current metrics
      setMetrics(data.instance.metrics);
      // Add current metrics to history
      addMetricsToHistory(data.instance.metrics);
      setStatus(data.instance.status);
    } catch (error) {
      console.error('Error fetching instance:', error);
      enqueueSnackbar('Failed to fetch instance details', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  const refreshSystemUsage = async () => {
    try {
      setRefreshing(true);
      
      // Only fetch for self-hosted instances
      if (instance?.provider?.toUpperCase() !== 'SELF HOST') {
        enqueueSnackbar('System usage data can only be fetched for self-hosted instances', { variant: 'warning' });
        return;
      }
      
      const data = await instanceService.fetchSystemUsage(id);
      setInstance(data.instance);
      // Update current metrics
      setMetrics(data.instance.metrics);
      // Add current metrics to history
      addMetricsToHistory(data.instance.metrics);
      
      enqueueSnackbar('System usage data refreshed successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error refreshing system usage:', error);
      enqueueSnackbar('Failed to refresh system usage data', { variant: 'error' });
    } finally {
      setRefreshing(false);
    }
  };

  if (loading && !instance) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {instance && (
        <>
          <InstanceHeader 
            instance={instance} 
            onRefresh={handleRefresh} 
          />
          
          <Box sx={{ mt: 3, mb: 2 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="instance tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Overview" />
              <Tab label="Metrics" />
              <Tab label="Console" />
              <Tab label="Settings" />
              <Tab label="Logs" />
              <Tab label="Networking" />
              <Tab label="Storage" />
            </Tabs>
          </Box>
          
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <InstanceInfo instance={instance} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <ResourceAllocation instance={instance} />
              </Box>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <CurrentUsage 
                instanceId={id}
                initialMetrics={metrics}
              />
            </Box>
          </TabPanel>
          
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={fetchInstance}
                disabled={loading}
                sx={{ mr: 1 }}
              >
                Refresh
              </Button>
              {instance?.provider?.toUpperCase() === 'SELF HOST' && (
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<RefreshIcon />}
                  onClick={refreshSystemUsage}
                  disabled={refreshing}
                >
                  Refresh System Usage
                </Button>
              )}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button 
                size="small" 
                color="secondary" 
                onClick={clearMetricsHistory}
                disabled={metricsHistory.length === 0}
              >
                Clear History
              </Button>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <MetricCard
                  title="CPU Usage"
                  value={`${Math.round(metrics.cpu)}%`}
                  icon={<MemoryIcon />}
                  color={theme.palette.primary.main}
                  progress={metrics.cpu}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <MetricCard
                  title="Memory Usage"
                  value={`${Math.round(metrics.memory)}%`}
                  icon={<StorageIcon />}
                  color={theme.palette.secondary.main}
                  progress={metrics.memory}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <MetricCard
                  title="Disk Usage"
                  value={`${Math.round(metrics.disk)}%`}
                  icon={<SdCardIcon />}
                  color={theme.palette.success.main}
                  progress={metrics.disk}
                />
              </Grid>
              {metrics.lastUpdated && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" align="right" sx={{ display: 'block', mt: 1 }}>
                    Last updated: {new Date(metrics.lastUpdated).toLocaleString()}
                  </Typography>
                </Grid>
              )}
            </Grid>
            <MetricsTab 
              instance={instance}
              metrics={metrics}
              lastUpdated={lastUpdated}
              onRefresh={fetchInstanceMetrics}
            />
          </TabPanel>
          
          <TabPanel value={activeTab} index={2}>
            <ConsoleTab instance={instance} />
          </TabPanel>
          
          <TabPanel value={activeTab} index={3}>
            <SettingsTab instance={instance} onRefresh={handleRefresh} />
          </TabPanel>
          
          <TabPanel value={activeTab} index={4}>
            <Typography variant="h6">Logs</Typography>
            <Typography>Log content will be displayed here</Typography>
          </TabPanel>
          
          <TabPanel value={activeTab} index={5}>
            <Typography variant="h6">Networking</Typography>
            <Typography>Network configuration will be displayed here</Typography>
          </TabPanel>
          
          <TabPanel value={activeTab} index={6}>
            <Typography variant="h6">Storage</Typography>
            <Typography>Storage information will be displayed here</Typography>
          </TabPanel>
        </>
      )}
    </Container>
  );
};

export default InstanceDetail;