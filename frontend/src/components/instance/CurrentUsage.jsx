import { useState, useEffect } from 'react';
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
  useTheme
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
 * @param {Object} props.metrics - Current metrics data
 * @param {Function} props.onRefresh - Refresh handler
 * @param {Date} props.lastUpdated - Last updated timestamp
 * @returns {JSX.Element} CurrentUsage component
 */
const CurrentUsage = ({ metrics, onRefresh, lastUpdated }) => {
  const theme = useTheme();

  const handleRefresh = () => {
    // Show a brief animation to indicate refresh
    const button = document.getElementById('refresh-metrics-button');
    if (button) {
      button.classList.add('rotating');
      setTimeout(() => {
        button.classList.remove('rotating');
      }, 1000);
    }
    
    onRefresh();
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

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Current Usage
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Divider sx={{ flex: 1, mr: 2 }} />
          <IconButton 
            size="small" 
            onClick={handleRefresh}
            title="Refresh metrics"
            id="refresh-metrics-button"
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
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          {lastUpdated && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={12} sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Auto-updating • Last updated: {lastUpdated.toLocaleTimeString()}
              </Typography>
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
              secondary={`${Math.round(metrics.cpu)}%`}
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
              secondary={`${Math.round(metrics.memory)}%`}
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
              secondary={`${Math.round(metrics.disk)}%`}
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
    </Card>
  );
};

export default CurrentUsage; 