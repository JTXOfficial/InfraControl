import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Divider,
  IconButton,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  Alert,
  Snackbar,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Storage as StorageIcon,
  Memory as MemoryIcon,
  NetworkCheck as NetworkIcon
} from '@mui/icons-material';
import instanceService from '../../services/instanceService';

/**
 * Current usage component showing real-time metrics
 * @param {Object} props - Component props
 * @param {string} props.instanceId - ID of the instance to fetch metrics for
 * @param {Object} props.initialMetrics - Initial metrics data (optional)
 * @returns {JSX.Element} CurrentUsage component
 */
const CurrentUsage = ({ instanceId, initialMetrics }) => {
  const theme = useTheme();
  const [metrics, setMetrics] = useState(initialMetrics || {
    cpu: 0,
    memory: 0,
    disk: 0,
    network: { in: 0, out: 0 }
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const refreshIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const REFRESH_INTERVAL = 30; // seconds

  // Set up auto-refresh on component mount
  useEffect(() => {
    // Initial fetch
    fetchMetrics();
    
    // Set up auto-refresh interval
    refreshIntervalRef.current = setInterval(fetchMetrics, REFRESH_INTERVAL * 1000);
    
    // Set up countdown timer
    setCountdown(REFRESH_INTERVAL);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : REFRESH_INTERVAL));
    }, 1000);
    
    // Clean up intervals on component unmount
    return () => {
      clearInterval(refreshIntervalRef.current);
      clearInterval(countdownIntervalRef.current);
    };
  }, [instanceId]);

  // Reset countdown when refresh happens
  useEffect(() => {
    if (lastUpdated) {
      setCountdown(REFRESH_INTERVAL);
    }
  }, [lastUpdated]);

  const handleRefresh = () => {
    // Show a brief animation to indicate refresh
    const button = document.getElementById('refresh-metrics-button');
    if (button) {
      button.classList.add('rotating');
      setTimeout(() => {
        button.classList.remove('rotating');
      }, 1000);
    }
    
    // Reset the intervals to keep them in sync with manual refresh
    clearInterval(refreshIntervalRef.current);
    clearInterval(countdownIntervalRef.current);
    
    refreshIntervalRef.current = setInterval(fetchMetrics, REFRESH_INTERVAL * 1000);
    setCountdown(REFRESH_INTERVAL);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : REFRESH_INTERVAL));
    }, 1000);
    
    fetchMetrics();
  };

  // Calculate total network usage for progress indicator
  const calculateNetworkPercentage = () => {
    if (!metrics.network) return 0;
    
    // Assuming 100Mbps is 100% for visualization purposes
    const total = typeof metrics.network === 'object' 
      ? (metrics.network.in + metrics.network.out) 
      : metrics.network;
      
    return Math.min(Math.round((total / 100) * 100), 100);
  };

  const networkPercentage = calculateNetworkPercentage();

  /**
   * Fetch current metrics from the API
   */
  const fetchMetrics = async () => {
    if (!instanceId) return;
    
    setLoading(true);
    try {
      // Use direct curl to instance's system usage endpoint
      const systemData = await instanceService.fetchSystemUsage(instanceId);
      
      if (systemData && systemData.data && systemData.data.metrics) {
        console.log('Successfully retrieved system usage data via direct curl');
        setMetrics(systemData.data.metrics);
        setLastUpdated(new Date());
        setError(null);
      } else {
        throw new Error('Invalid response format from system usage endpoint');
      }
    } catch (err) {
      console.error('Error fetching instance metrics:', err);
      setError('Failed to fetch metrics. Please try again.');
      setShowError(true);
      
      // If we don't have metrics yet, use placeholder data
      if (!lastUpdated) {
        setMetrics({
          cpu: Math.floor(Math.random() * 30) + 10,
          memory: Math.floor(Math.random() * 40) + 20,
          disk: Math.floor(Math.random() * 50) + 10,
          network: {
            in: Math.floor(Math.random() * 5) + 1,
            out: Math.floor(Math.random() * 3) + 1
          }
        });
        setLastUpdated(new Date());
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Current Usage
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Divider sx={{ flex: 1, mr: 2 }} />
          <Tooltip title="Refresh metrics now">
            <IconButton 
              size="small" 
              onClick={handleRefresh}
              title="Refresh metrics"
              id="refresh-metrics-button"
              disabled={loading}
              sx={{
                '@keyframes rotate': {
                  '0%': {
                    transform: 'rotate(0deg)',
                  },
                  '100%': {
                    transform: 'rotate(360deg)',
                  },
                },
                '@keyframes pulse': {
                  '0%': {
                    opacity: 0.7,
                  },
                  '50%': {
                    opacity: 1,
                  },
                  '100%': {
                    opacity: 0.7,
                  },
                },
                '&.rotating': {
                  animation: 'rotate 1s linear',
                },
                '&.pulse': {
                  animation: 'pulse 2s infinite',
                  color: theme.palette.primary.main,
                },
              }}
            >
              {loading ? <CircularProgress size={16} /> : <RefreshIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          {lastUpdated && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              borderRadius: '16px',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              px: 1,
              py: 0.5
            }}>
              {loading ? (
                <CircularProgress size={12} sx={{ mr: 1 }} />
              ) : (
                <Box 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                    mr: 1, 
                    bgcolor: 'success.main', 
                    borderRadius: '50%',
                    boxShadow: '0 0 4px rgba(76, 175, 80, 0.8)'
                  }} 
                />
              )}
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  fontWeight: 500
                }}
              >
                {loading ? 'Updating...' : 'Auto'}
              </Typography>
              
              <Box 
                component="span" 
                sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${countdown < 5 ? theme.palette.primary.main : theme.palette.divider}`,
                  borderRadius: '12px',
                  minWidth: 28,
                  height: 20,
                  px: 0.5,
                  ml: 1,
                  bgcolor: countdown < 5 ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <Typography 
                  variant="caption"
                  component="span"
                  sx={{ 
                    fontWeight: countdown < 5 ? 'bold' : 'medium',
                    color: countdown < 5 ? theme.palette.primary.main : 'inherit',
                    fontSize: '0.7rem',
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {countdown}s
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
        
        <List disablePadding>
          <ListItem disablePadding sx={{ py: 1 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <MemoryIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="CPU Usage" 
              secondary={`${metrics.cpu.toFixed(2)}%`}
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              secondaryTypographyProps={{ variant: 'body1' }}
            />
            <Box sx={{ width: 60 }}>
              <CircularProgress 
                variant="determinate" 
                value={metrics.cpu} 
                size={40}
                thickness={4}
                sx={{ 
                  color: metrics.cpu > 80 ? 'error.main' : 
                         metrics.cpu > 60 ? 'warning.main' : 'success.main'
                }}
              />
            </Box>
          </ListItem>
          
          <ListItem disablePadding sx={{ py: 1 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <StorageIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Memory Usage" 
              secondary={`${metrics.memory.toFixed(2)}%`}
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              secondaryTypographyProps={{ variant: 'body1' }}
            />
            <Box sx={{ width: 60 }}>
              <CircularProgress 
                variant="determinate" 
                value={metrics.memory} 
                size={40}
                thickness={4}
                sx={{ 
                  color: metrics.memory > 80 ? 'error.main' : 
                         metrics.memory > 60 ? 'warning.main' : 'success.main'
                }}
              />
            </Box>
          </ListItem>
          
          <ListItem disablePadding sx={{ py: 1 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <StorageIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Disk Usage" 
              secondary={`${metrics.disk.toFixed(2)}%`}
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              secondaryTypographyProps={{ variant: 'body1' }}
            />
            <Box sx={{ width: 60 }}>
              <CircularProgress 
                variant="determinate" 
                value={metrics.disk} 
                size={40}
                thickness={4}
                sx={{ 
                  color: metrics.disk > 80 ? 'error.main' : 
                         metrics.disk > 60 ? 'warning.main' : 'success.main'
                }}
              />
            </Box>
          </ListItem>
          
          <ListItem disablePadding sx={{ py: 1 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <NetworkIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Network Traffic" 
              secondary={
                <Box>
                  <Typography variant="body1">
                    {typeof metrics.network === 'object' 
                      ? `↓ ${metrics.network.in.toFixed(1)} Mbps • ↑ ${metrics.network.out.toFixed(1)} Mbps` 
                      : `${metrics.network} Mbps`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total: {typeof metrics.network === 'object' 
                      ? (metrics.network.in + metrics.network.out).toFixed(1) 
                      : metrics.network} Mbps
                  </Typography>
                </Box>
              }
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
            />
            <Box sx={{ width: 60 }}>
              <CircularProgress 
                variant="determinate" 
                value={networkPercentage} 
                size={40}
                thickness={4}
                sx={{ 
                  color: networkPercentage > 80 ? 'error.main' : 
                         networkPercentage > 60 ? 'warning.main' : 'success.main'
                }}
              />
            </Box>
          </ListItem>
        </List>
      </CardContent>

      <Snackbar 
        open={showError} 
        autoHideDuration={6000} 
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setShowError(false)}>
          {error}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default CurrentUsage; 