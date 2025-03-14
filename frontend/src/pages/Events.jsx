import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Divider,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  useTheme
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

const Events = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypes, setEventTypes] = useState([
    'All Types', 'Create', 'Update', 'Delete', 'Login', 'Logout', 'Error'
  ]);
  const [resourceTypes, setResourceTypes] = useState([
    'All Resources', 'Instance', 'User', 'Setting', 'System'
  ]);
  const [statuses, setStatuses] = useState([
    'All Statuses', 'Success', 'Failed', 'Warning'
  ]);
  const [filters, setFilters] = useState({
    eventType: 'All Types',
    resourceType: 'All Resources',
    status: 'All Statuses'
  });

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      const mockEvents = [
        { 
          id: '1', 
          time: '2025-03-14T09:30:00Z', 
          type: 'Create', 
          resource: 'Instance',
          resourceId: 'web-server-01',
          user: 'john.doe@example.com',
          ip: '192.168.1.100',
          details: 'Created new web server instance',
          status: 'Success',
          severity: 'Info'
        },
        { 
          id: '2', 
          time: '2025-03-14T08:45:22Z', 
          type: 'Update', 
          resource: 'User',
          resourceId: 'jane.smith',
          user: 'admin@example.com',
          ip: '192.168.1.101',
          details: 'Updated user permissions',
          status: 'Success',
          severity: 'Info'
        },
        { 
          id: '3', 
          time: '2025-03-14T07:15:10Z', 
          type: 'Delete', 
          resource: 'Instance',
          resourceId: 'test-server-03',
          user: 'john.doe@example.com',
          ip: '192.168.1.100',
          details: 'Deleted test server instance',
          status: 'Success',
          severity: 'Info'
        },
        { 
          id: '4', 
          time: '2025-03-14T06:30:45Z', 
          type: 'Login', 
          resource: 'System',
          resourceId: 'auth-service',
          user: 'jane.smith@example.com',
          ip: '192.168.1.102',
          details: 'User login successful',
          status: 'Success',
          severity: 'Info'
        },
        { 
          id: '5', 
          time: '2025-03-14T05:20:30Z', 
          type: 'Error', 
          resource: 'Instance',
          resourceId: 'db-server-01',
          user: 'system',
          ip: '192.168.1.103',
          details: 'Database connection failed',
          status: 'Failed',
          severity: 'Error'
        },
        { 
          id: '6', 
          time: '2025-03-14T04:10:15Z', 
          type: 'Update', 
          resource: 'Setting',
          resourceId: 'notification-settings',
          user: 'admin@example.com',
          ip: '192.168.1.101',
          details: 'Updated notification settings',
          status: 'Warning',
          severity: 'Warning'
        }
      ];
      
      setEvents(mockEvents);
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value
    });
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // Filter events based on search query and selected filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      searchQuery === '' || 
      event.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.resourceId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesEventType = 
      filters.eventType === 'All Types' || 
      event.type === filters.eventType;
    
    const matchesResourceType = 
      filters.resourceType === 'All Resources' || 
      event.resource === filters.resourceType;
    
    const matchesStatus = 
      filters.status === 'All Statuses' || 
      event.status === filters.status;
    
    return matchesSearch && matchesEventType && matchesResourceType && matchesStatus;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const getSeverityColor = (severity) => {
    switch(severity.toLowerCase()) {
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
          Event Logs
        </Typography>
      </Box>
      
      <Card>
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
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              id="status-select"
              value={filters.status}
              label="Status"
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              {statuses.map(status => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <IconButton onClick={handleRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
        
        <Divider />
        
        <TableContainer>
          <Table sx={{ minWidth: 650 }} size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Resource</TableCell>
                <TableCell>User</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>Details</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Severity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      No events found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>{formatDate(event.time)}</TableCell>
                    <TableCell>{event.type}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {event.resource}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {event.resourceId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{event.user}</TableCell>
                    <TableCell>{event.ip}</TableCell>
                    <TableCell>{event.details}</TableCell>
                    <TableCell>
                      <Chip 
                        label={event.status} 
                        size="small"
                        sx={{ 
                          bgcolor: `${getStatusColor(event.status)}20`,
                          color: getStatusColor(event.status),
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={event.severity} 
                        size="small"
                        sx={{ 
                          bgcolor: `${getSeverityColor(event.severity)}20`,
                          color: getSeverityColor(event.severity),
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default Events; 