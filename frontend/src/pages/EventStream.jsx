import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Switch,
  FormControlLabel,
  Chip,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Paper,
  useTheme
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';

const EventStream = () => {
  const theme = useTheme();
  const [events, setEvents] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [filters, setFilters] = useState({
    eventType: 'All Types',
    resourceType: 'All Resources',
    severity: 'All Severities'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypes] = useState([
    'All Types', 'Create', 'Update', 'Delete', 'Login', 'Logout', 'Error'
  ]);
  const [resourceTypes] = useState([
    'All Resources', 'Instance', 'User', 'Setting', 'System'
  ]);
  const [severities] = useState([
    'All Severities', 'Critical', 'Error', 'Warning', 'Info'
  ]);
  
  const eventListRef = useRef(null);
  const eventStreamInterval = useRef(null);

  useEffect(() => {
    // Start the event stream
    startEventStream();
    
    // Clean up on unmount
    return () => {
      if (eventStreamInterval.current) {
        clearInterval(eventStreamInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom when new events are added (if not paused)
    if (!isPaused && eventListRef.current) {
      eventListRef.current.scrollTop = eventListRef.current.scrollHeight;
    }
  }, [events, isPaused]);

  const startEventStream = () => {
    // Clear any existing interval
    if (eventStreamInterval.current) {
      clearInterval(eventStreamInterval.current);
    }
    
    // Set up interval to simulate real-time events
    eventStreamInterval.current = setInterval(() => {
      if (!isPaused) {
        addRandomEvent();
      }
    }, 3000); // Add a new event every 3 seconds
  };

  const addRandomEvent = () => {
    const eventTypes = ['Create', 'Update', 'Delete', 'Login', 'Logout', 'Error'];
    const resourceTypes = ['Instance', 'User', 'Setting', 'System'];
    const users = ['admin@example.com', 'user1@example.com', 'user2@example.com'];
    const statuses = ['Success', 'Failed', 'Warning'];
    const severities = ['Critical', 'Error', 'Warning', 'Info'];
    
    const randomEvent = {
      id: `evt-${Date.now()}`,
      time: new Date().toISOString(),
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      resource: resourceTypes[Math.floor(Math.random() * resourceTypes.length)],
      resourceId: `res-${2000 + Math.floor(Math.random() * 1000)}`,
      user: users[Math.floor(Math.random() * users.length)],
      ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
      details: `Event generated at ${new Date().toLocaleTimeString()}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      severity: severities[Math.floor(Math.random() * severities.length)]
    };
    
    setEvents(prevEvents => {
      // Keep only the last 100 events to prevent performance issues
      const updatedEvents = [...prevEvents, randomEvent];
      if (updatedEvents.length > 100) {
        return updatedEvents.slice(-100);
      }
      return updatedEvents;
    });
  };

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
  };

  const handleClearEvents = () => {
    setEvents([]);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Apply filters and search
  const filteredEvents = events.filter(event => {
    // Apply search query
    if (searchQuery && !Object.values(event).some(value => 
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )) {
      return false;
    }
    
    // Apply filters
    if (filters.eventType !== 'All Types' && event.type !== filters.eventType) {
      return false;
    }
    
    if (filters.resourceType !== 'All Resources' && event.resource !== filters.resourceType) {
      return false;
    }
    
    if (filters.severity !== 'All Severities' && event.severity !== filters.severity) {
      return false;
    }
    
    return true;
  });

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString();
  };

  const getSeverityColor = (severity) => {
    switch(severity.toLowerCase()) {
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

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Real-time Event Stream
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={!isPaused}
                onChange={handleTogglePause}
                color="primary"
              />
            }
            label={isPaused ? "Stream Paused" : "Stream Active"}
          />
          
          <IconButton 
            onClick={handleTogglePause}
            color={isPaused ? "primary" : "default"}
            sx={{ ml: 1 }}
          >
            {isPaused ? <PlayIcon /> : <PauseIcon />}
          </IconButton>
          
          <Button 
            variant="outlined" 
            startIcon={<ClearIcon />}
            onClick={handleClearEvents}
            sx={{ ml: 2 }}
          >
            Clear
          </Button>
        </Box>
      </Box>
      
      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            placeholder="Search events..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ flexGrow: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="event-type-select-label">Event Type</InputLabel>
            <Select
              labelId="event-type-select-label"
              id="event-type-select"
              value={filters.eventType}
              label="Event Type"
              onChange={(e) => handleFilterChange('eventType', e.target.value)}
            >
              {eventTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="resource-type-select-label">Resource Type</InputLabel>
            <Select
              labelId="resource-type-select-label"
              id="resource-type-select"
              value={filters.resourceType}
              label="Resource Type"
              onChange={(e) => handleFilterChange('resourceType', e.target.value)}
            >
              {resourceTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="severity-select-label">Severity</InputLabel>
            <Select
              labelId="severity-select-label"
              id="severity-select"
              value={filters.severity}
              label="Severity"
              onChange={(e) => handleFilterChange('severity', e.target.value)}
            >
              {severities.map(severity => (
                <MenuItem key={severity} value={severity}>{severity}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Card>
      
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box 
            ref={eventListRef}
            sx={{ 
              height: '60vh', 
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column-reverse', // Show newest events at the top
              bgcolor: theme.palette.background.default,
              borderRadius: 1
            }}
          >
            {filteredEvents.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No events to display
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {[...filteredEvents].reverse().map((event, index) => (
                  <Box key={event.id}>
                    {index > 0 && <Divider />}
                    <ListItem 
                      sx={{ 
                        py: 1.5,
                        borderLeft: 4, 
                        borderColor: getSeverityColor(event.severity),
                        '&:hover': {
                          bgcolor: `${theme.palette.action.hover}`
                        }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 0.5 }}>
                            <Typography variant="body2" component="span" fontWeight="bold">
                              {formatTime(event.time)}
                            </Typography>
                            <Chip 
                              label={event.type} 
                              size="small"
                              sx={{ 
                                bgcolor: theme.palette.primary.main + '20',
                                color: theme.palette.primary.main,
                                fontWeight: 500
                              }}
                            />
                            <Chip 
                              label={event.resource} 
                              size="small"
                              sx={{ 
                                bgcolor: theme.palette.secondary.main + '20',
                                color: theme.palette.secondary.main,
                                fontWeight: 500
                              }}
                            />
                            <Chip 
                              label={event.status} 
                              size="small"
                              sx={{ 
                                bgcolor: `${getStatusColor(event.status)}20`,
                                color: getStatusColor(event.status),
                                fontWeight: 500
                              }}
                            />
                            <Chip 
                              label={event.severity} 
                              size="small"
                              sx={{ 
                                bgcolor: `${getSeverityColor(event.severity)}20`,
                                color: getSeverityColor(event.severity),
                                fontWeight: 500
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" component="span">
                              {event.details}
                            </Typography>
                            <Box sx={{ mt: 0.5, display: 'flex', gap: 2 }}>
                              <Typography variant="caption" color="text.secondary">
                                User: {event.user}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                IP: {event.ip}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Resource ID: {event.resourceId}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  </Box>
                ))}
              </List>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EventStream; 