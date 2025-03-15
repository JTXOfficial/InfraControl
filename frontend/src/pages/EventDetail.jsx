import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Paper,
  IconButton,
  useTheme
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/events/${id}`);
        // const data = await response.json();
        
        // Mock data for development
        const mockEvent = {
          id: id,
          time: new Date().toISOString(),
          type: 'Update',
          resource: 'Instance',
          resourceId: 'inst-12345',
          user: 'admin@example.com',
          ip: '192.168.1.1',
          details: 'Instance configuration updated',
          status: 'Success',
          severity: 'Info',
          metadata: {
            changes: [
              { field: 'CPU', oldValue: '2', newValue: '4' },
              { field: 'Memory', oldValue: '4GB', newValue: '8GB' }
            ],
            region: 'us-west-2',
            tags: ['production', 'web-server']
          },
          relatedEvents: ['evt-12346', 'evt-12347']
        };
        
        setEvent(mockEvent);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching event details:', error);
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  const handleBack = () => {
    navigate('/events');
  };

  const handleExport = () => {
    if (!event) return;
    
    // Create JSON file for download
    const dataStr = JSON.stringify(event, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `event-${event.id}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // TODO: Add toast notification
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'success':
        return theme.palette.success.main;
      case 'failed':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'critical':
        return theme.palette.error.dark;
      case 'error':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'info':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!event) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
          Back to Events
        </Button>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">Event not found</Typography>
          <Typography variant="body2" color="text.secondary">
            The event you're looking for doesn't exist or you don't have permission to view it.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Back to Events
        </Button>
        <Button 
          startIcon={<DownloadIcon />} 
          variant="outlined"
          onClick={handleExport}
        >
          Export
        </Button>
      </Box>

      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Event Details
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Event ID
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ mr: 1 }}>
                  {event.id}
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => copyToClipboard(event.id)}
                  sx={{ p: 0.5 }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Timestamp
              </Typography>
              <Typography variant="body1">
                {new Date(event.time).toLocaleString()}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Event Type
              </Typography>
              <Typography variant="body1">
                {event.type}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Resource
              </Typography>
              <Box>
                <Typography variant="body1">
                  {event.resource}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {event.resourceId}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                User
              </Typography>
              <Typography variant="body1">
                {event.user}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                IP Address
              </Typography>
              <Typography variant="body1">
                {event.ip}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Status
              </Typography>
              <Chip 
                label={event.status} 
                size="small"
                sx={{ 
                  bgcolor: `${getStatusColor(event.status)}20`,
                  color: getStatusColor(event.status),
                  fontWeight: 500
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Severity
              </Typography>
              <Chip 
                label={event.severity} 
                size="small"
                sx={{ 
                  bgcolor: `${getSeverityColor(event.severity)}20`,
                  color: getSeverityColor(event.severity),
                  fontWeight: 500
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Event Details
          </Typography>
          <Typography variant="body1">
            {event.details}
          </Typography>
        </CardContent>
      </Card>

      {event.metadata && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Metadata
            </Typography>
            
            {event.metadata.changes && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Changes
                </Typography>
                <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
                  <Box sx={{ display: 'table', width: '100%', borderCollapse: 'collapse' }}>
                    <Box sx={{ display: 'table-header-group' }}>
                      <Box sx={{ display: 'table-row' }}>
                        <Box sx={{ display: 'table-cell', p: 1.5, fontWeight: 'bold', borderBottom: 1, borderColor: 'divider' }}>Field</Box>
                        <Box sx={{ display: 'table-cell', p: 1.5, fontWeight: 'bold', borderBottom: 1, borderColor: 'divider' }}>Old Value</Box>
                        <Box sx={{ display: 'table-cell', p: 1.5, fontWeight: 'bold', borderBottom: 1, borderColor: 'divider' }}>New Value</Box>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'table-row-group' }}>
                      {event.metadata.changes.map((change, index) => (
                        <Box key={index} sx={{ display: 'table-row' }}>
                          <Box sx={{ display: 'table-cell', p: 1.5, borderBottom: index < event.metadata.changes.length - 1 ? 1 : 0, borderColor: 'divider' }}>{change.field}</Box>
                          <Box sx={{ display: 'table-cell', p: 1.5, borderBottom: index < event.metadata.changes.length - 1 ? 1 : 0, borderColor: 'divider' }}>{change.oldValue}</Box>
                          <Box sx={{ display: 'table-cell', p: 1.5, borderBottom: index < event.metadata.changes.length - 1 ? 1 : 0, borderColor: 'divider' }}>{change.newValue}</Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Paper>
              </Box>
            )}
            
            {event.metadata.tags && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {event.metadata.tags.map((tag, index) => (
                    <Chip key={index} label={tag} size="small" />
                  ))}
                </Box>
              </Box>
            )}
            
            {event.metadata.region && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Region
                </Typography>
                <Typography variant="body2">
                  {event.metadata.region}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {event.relatedEvents && event.relatedEvents.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Related Events
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {event.relatedEvents.map((eventId, index) => (
                <Chip 
                  key={index} 
                  label={eventId} 
                  clickable
                  onClick={() => navigate(`/events/${eventId}`)}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default EventDetail; 