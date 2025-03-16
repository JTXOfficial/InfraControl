import { useState } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Button, 
  Chip 
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Refresh as RestartIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import instanceService from '../../services/instanceService';
import { useSnackbar } from 'notistack';

/**
 * Instance header component with action buttons
 * @param {Object} props - Component props
 * @param {Object} props.instance - Instance data
 * @param {Function} props.onBack - Back button handler
 * @param {Function} props.onRefresh - Refresh button handler
 * @param {Function} props.onDelete - Delete button handler
 * @returns {JSX.Element} InstanceHeader component
 */
const InstanceHeader = ({ instance, onBack, onRefresh, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleStartInstance = async () => {
    try {
      setLoading(true);
      await instanceService.startInstance(instance.id);
      
      // Show success notification
      enqueueSnackbar('Instance start initiated', { variant: 'success' });
      
      // Refresh instance details
      onRefresh();
      
    } catch (error) {
      console.error(`Error starting instance ${instance.id}:`, error);
      enqueueSnackbar(`Failed to start instance: ${error.message}`, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStopInstance = async () => {
    try {
      setLoading(true);
      await instanceService.stopInstance(instance.id);
      
      // Show success notification
      enqueueSnackbar('Instance stop initiated', { variant: 'success' });
      
      // Refresh instance details
      onRefresh();
      
    } catch (error) {
      console.error(`Error stopping instance ${instance.id}:`, error);
      enqueueSnackbar(`Failed to stop instance: ${error.message}`, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRestartInstance = async () => {
    try {
      setLoading(true);
      await instanceService.restartInstance(instance.id);
      
      // Show success notification
      enqueueSnackbar('Instance restart initiated', { variant: 'success' });
      
      // Refresh instance details
      onRefresh();
      
    } catch (error) {
      console.error(`Error restarting instance ${instance.id}:`, error);
      enqueueSnackbar(`Failed to restart instance: ${error.message}`, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={onBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {instance.name}
        </Typography>
        <Chip 
          label={instance.status} 
          size="small"
          color={
            instance.status === 'running' ? 'success' : 
            instance.status === 'restarting' ? 'warning' :
            instance.status === 'starting' ? 'info' :
            instance.status === 'stopping' ? 'warning' : 'error'
          }
          sx={{ ml: 2 }}
        />
      </Box>
      
      <Box>
        <IconButton onClick={onRefresh} sx={{ mr: 1 }}>
          <RefreshIcon />
        </IconButton>
        {instance.status === 'running' ? (
          <>
            <Button 
              variant="outlined" 
              startIcon={<StopIcon />}
              onClick={handleStopInstance}
              sx={{ mr: 1 }}
              disabled={loading || instance.status === 'stopping' || instance.status === 'restarting'}
            >
              Stop
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<RestartIcon />}
              onClick={handleRestartInstance}
              sx={{ mr: 1 }}
              disabled={loading || instance.status === 'restarting' || instance.status === 'stopping'}
            >
              Restart
            </Button>
          </>
        ) : instance.status === 'restarting' ? (
          <>
            <Button 
              variant="outlined" 
              startIcon={<RestartIcon />}
              disabled
              sx={{ mr: 1 }}
            >
              Restarting...
            </Button>
          </>
        ) : instance.status === 'stopping' ? (
          <>
            <Button 
              variant="outlined" 
              startIcon={<StopIcon />}
              disabled
              sx={{ mr: 1 }}
            >
              Stopping...
            </Button>
          </>
        ) : instance.status === 'starting' ? (
          <>
            <Button 
              variant="outlined" 
              startIcon={<PlayArrowIcon />}
              disabled
              sx={{ mr: 1 }}
            >
              Starting...
            </Button>
          </>
        ) : (
          <Button 
            variant="outlined" 
            color="success"
            startIcon={<PlayArrowIcon />}
            onClick={handleStartInstance}
            sx={{ mr: 1 }}
            disabled={loading || instance.status === 'starting'}
          >
            Start
          </Button>
        )}
        <Button 
          variant="outlined" 
          color="error"
          startIcon={<DeleteIcon />}
          onClick={onDelete}
          disabled={loading}
        >
          Delete
        </Button>
      </Box>
    </Box>
  );
};

export default InstanceHeader; 