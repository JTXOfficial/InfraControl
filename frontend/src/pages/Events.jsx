import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Menu,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';

const Events = () => {
  const theme = useTheme();
  const navigate = useNavigate();
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
  
  // Export menu state
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  const exportMenuOpen = Boolean(exportMenuAnchor);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/events');
      // const data = await response.json();
      
      // Mock data for development
      const mockEvents = Array.from({ length: 20 }, (_, i) => ({
        id: `evt-${1000 + i}`,
        time: new Date(Date.now() - i * 3600000).toISOString(),
        type: ['Create', 'Update', 'Delete', 'Login', 'Logout', 'Error'][Math.floor(Math.random() * 6)],
        resource: ['Instance', 'User', 'Setting', 'System'][Math.floor(Math.random() * 4)],
        resourceId: `res-${2000 + i}`,
        user: ['admin@example.com', 'user1@example.com', 'user2@example.com'][Math.floor(Math.random() * 3)],
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
        details: `Event details for event ${1000 + i}`,
        status: ['Success', 'Failed', 'Warning'][Math.floor(Math.random() * 3)],
        severity: ['Critical', 'Error', 'Warning', 'Info'][Math.floor(Math.random() * 4)]
      }));
      
      setEvents(mockEvents);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchEvents();
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleRowClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const handleExportMenuOpen = (event) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  const handleExportJSON = () => {
    const dataToExport = filteredEvents.map(event => ({
      id: event.id,
      timestamp: event.time,
      type: event.type,
      resource: event.resource,
      resourceId: event.resourceId,
      user: event.user,
      ip: event.ip,
      details: event.details,
      status: event.status,
      severity: event.severity
    }));
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `events-export-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    handleExportMenuClose();
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Type', 'Resource', 'ResourceID', 'User', 'IP', 'Details', 'Status', 'Severity'];
    
    const dataRows = filteredEvents.map(event => [
      event.id,
      event.time,
      event.type,
      event.resource,
      event.resourceId,
      event.user,
      event.ip,
      event.details,
      event.status,
      event.severity
    ]);
    
    const csvContent = [
      headers.join(','),
      ...dataRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csvContent);
    
    const exportFileDefaultName = `events-export-${new Date().toISOString().split('T')[0]}.csv`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    handleExportMenuClose();
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
    
    if (filters.status !== 'All Statuses' && event.status !== filters.status) {
      return false;
    }
    
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
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
          Event Logs
        </Typography>
        
        <Box>
          <Tooltip title="Export Events">
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportMenuOpen}
              sx={{ mr: 1 }}
            >
              Export
            </Button>
          </Tooltip>
          <Menu
            anchorEl={exportMenuAnchor}
            open={exportMenuOpen}
            onClose={handleExportMenuClose}
          >
            <MenuItem onClick={handleExportJSON}>Export as JSON</MenuItem>
            <MenuItem onClick={handleExportCSV}>Export as CSV</MenuItem>
          </Menu>
        </Box>
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
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      No events found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.map((event) => (
                  <TableRow 
                    key={event.id} 
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleRowClick(event.id)}
                  >
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
                    <TableCell align="center">
                      <IconButton 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/events/${event.id}`);
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
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