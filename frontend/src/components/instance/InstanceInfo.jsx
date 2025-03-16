import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid,
  Divider,
  IconButton,
  Chip,
  useTheme
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

/**
 * Formats a date string into a readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Instance information component showing basic details
 * @param {Object} props - Component props
 * @param {Object} props.instance - Instance data
 * @param {Function} props.onRefresh - Refresh handler
 * @returns {JSX.Element} InstanceInfo component
 */
const InstanceInfo = ({ instance, onRefresh }) => {
  const theme = useTheme();

  const handleRefresh = () => {
    // Show a brief animation to indicate refresh
    const button = document.getElementById('refresh-instance-button');
    if (button) {
      button.classList.add('rotating');
      setTimeout(() => {
        button.classList.remove('rotating');
      }, 1000);
    }
    
    onRefresh();
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Instance Information
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Divider sx={{ flex: 1, mr: 2 }} />
          <IconButton 
            size="small" 
            onClick={handleRefresh}
            title="Refresh instance information"
            id="refresh-instance-button"
            sx={{
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
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Instance ID
              </Typography>
              <Typography variant="body1">
                {instance.id || 'N/A'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body1">
                {instance.name || 'N/A'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Project
              </Typography>
              <Typography variant="body1">
                {instance.projectName || instance.project || 'Default'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Zone
              </Typography>
              <Typography variant="body1">
                {instance.zone || 'N/A'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Provider
              </Typography>
              <Typography variant="body1">
                {instance.provider || 'N/A'}
              </Typography>
            </Box>
            
            {instance.url && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  URL
                </Typography>
                <Typography variant="body1">
                  <a href={instance.url} target="_blank" rel="noopener noreferrer" style={{ color: theme.palette.primary.main }}>
                    {instance.url}
                  </a>
                </Typography>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                IP Address
              </Typography>
              <Typography variant="body1">
                {instance.ip || 'N/A'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Stack
              </Typography>
              <Typography variant="body1">
                {instance.stack || 'N/A'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              <Typography variant="body1">
                <Chip 
                  label={instance.status} 
                  size="small"
                  color={
                    instance.status === 'running' ? 'success' : 
                    instance.status === 'restarting' ? 'warning' :
                    instance.status === 'starting' ? 'info' :
                    instance.status === 'stopping' ? 'warning' : 'error'
                  }
                />
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body1">
                {instance.createdAt ? formatDate(instance.createdAt) : 'N/A'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Last Updated
              </Typography>
              <Typography variant="body1">
                {instance.updatedAt ? formatDate(instance.updatedAt) : 'N/A'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        {instance.description && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Description
            </Typography>
            <Typography variant="body1">
              {instance.description}
            </Typography>
          </Box>
        )}
        
        {instance.tags && instance.tags.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Tags
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {instance.tags.map(tag => (
                <Chip 
                  key={tag} 
                  label={tag} 
                  size="small"
                  sx={{ 
                    bgcolor: `${theme.palette.primary.main}20`,
                    color: theme.palette.primary.main
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default InstanceInfo; 