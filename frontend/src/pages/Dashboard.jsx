import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Divider,
  useTheme,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Switch,
  FormControlLabel,
  Menu,
  ListItemIcon,
  ListItemText,
  Badge,
  Alert
} from '@mui/material';
import {
  Storage as StorageIcon,
  Memory as MemoryIcon,
  NetworkCheck as NetworkIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  DateRange as DateRangeIcon,
  Today as TodayIcon,
  LastPage as LastWeekIcon,
  CalendarMonth as CalendarMonthIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import dashboardService from '../services/dashboardService';
import { useNotifications } from '../contexts/NotificationContext';

// Mock data for resource usage chart
const generateResourceData = (days = 7) => {
  const data = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      cpu: Math.floor(Math.random() * 40) + 20, // Random between 20-60%
      memory: Math.floor(Math.random() * 30) + 40, // Random between 40-70%
      disk: Math.floor(Math.random() * 20) + 10, // Random between 10-30%
    });
  }
  
  return data;
};

// Mock data for alerts
const generateAlerts = () => {
  return [
    {
      id: 1,
      severity: 'critical',
      message: 'High CPU usage on web-server-01',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      instance: 'web-server-01'
    },
    {
      id: 2,
      severity: 'warning',
      message: 'Memory usage above 70% on app-server',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
      instance: 'test-name'
    },
    {
      id: 3,
      severity: 'info',
      message: 'Scheduled maintenance upcoming',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
      instance: 'all'
    }
  ];
};

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(30); // seconds
  const autoRefreshTimerRef = useRef(null);
  const { createTaskCompletionNotification } = useNotifications?.() || {};
  
  // Dashboard state
  const [dashboardData, setDashboardData] = useState({
    instances: [],
    stats: {
      instances: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      alerts: 0
    },
    alerts: [],
    resourceData: []
  });
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('All Projects');
  const [selectedZone, setSelectedZone] = useState('All Zones');
  const [timeRange, setTimeRange] = useState('7d');
  const [error, setError] = useState(null);
  
  // Menu states
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [timeRangeMenuAnchor, setTimeRangeMenuAnchor] = useState(null);
  const [refreshMenuAnchor, setRefreshMenuAnchor] = useState(null);
  
  // Projects and zones data
  const [projects, setProjects] = useState(['Default', 'e-commerce', 'test-project']);
  const [zones, setZones] = useState(['Default', 'us-west1-a', 'us-east1-b']);
  
  const fetchDashboardData = async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      // Fetch dashboard data from service
      const data = await dashboardService.getDashboardData({
        timeRange,
        project: selectedProject !== 'All Projects' ? selectedProject : undefined,
        zone: selectedZone !== 'All Zones' ? selectedZone : undefined,
        search: searchQuery || undefined
      });
      
      // Update dashboard state with fetched data
      setDashboardData(data);
      
      // If this is a manual refresh, show notification
      if (refreshing && !loading && createTaskCompletionNotification) {
        createTaskCompletionNotification('Dashboard data refreshed successfully');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
    
    // Cleanup function
    return () => {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
      }
    };
  }, [timeRange, selectedProject, selectedZone]);
  
  // Set up auto-refresh
  useEffect(() => {
    if (autoRefreshTimerRef.current) {
      clearInterval(autoRefreshTimerRef.current);
      autoRefreshTimerRef.current = null;
    }
    
    if (autoRefresh) {
      autoRefreshTimerRef.current = setInterval(() => {
        fetchDashboardData();
      }, autoRefreshInterval * 1000);
    }
    
    return () => {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
      }
    };
  }, [autoRefresh, autoRefreshInterval]);
  
  const handleRefresh = () => {
    fetchDashboardData();
  };
  
  const handleAutoRefreshChange = (event) => {
    setAutoRefresh(event.target.checked);
  };
  
  const handleIntervalChange = (event) => {
    setAutoRefreshInterval(Number(event.target.value));
  };
  
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    setTimeRangeMenuAnchor(null);
  };
  
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  const handleSearchSubmit = (event) => {
    if (event.key === 'Enter') {
      fetchDashboardData();
    }
  };
  
  const handleProjectChange = (event) => {
    setSelectedProject(event.target.value);
  };
  
  const handleZoneChange = (event) => {
    setSelectedZone(event.target.value);
  };
  
  const handleAddInstance = () => {
    navigate('/instances/create');
  };
  
  const handleEditInstance = (id) => {
    navigate(`/instances/${id}`);
  };
  
  const handleDeleteInstance = (id) => {
    // In a real app, you would confirm deletion first
    console.log(`Delete instance ${id}`);
  };
  
  // Filter instances based on search query and selected filters
  const filteredInstances = dashboardData.instances.filter(instance => {
    const matchesSearch = 
      searchQuery === '' || 
      instance.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instance.ip?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProject = 
      selectedProject === 'All Projects' || 
      instance.project === selectedProject;
    
    const matchesZone = 
      selectedZone === 'All Zones' || 
      instance.zone === selectedZone;
    
    return matchesSearch && matchesProject && matchesZone;
  });
  
  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ 
            backgroundColor: `${color}.dark`, 
            borderRadius: '8px', 
            p: 1,
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mt: 1 }}>
          {loading ? <CircularProgress size={24} /> : value}
        </Typography>
      </CardContent>
    </Card>
  );

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'running':
        return 'success';
      case 'stopped':
        return 'error';
      case 'provisioning':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'critical':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'info':
        return theme.palette.info.main;
      default:
        return theme.palette.text.secondary;
    }
  };
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  const getTimeRangeLabel = () => {
    switch(timeRange) {
      case '24h':
        return 'Last 24 Hours';
      case '7d':
        return 'Last 7 Days';
      case '30d':
        return 'Last 30 Days';
      case 'custom':
        return 'Custom Range';
      default:
        return 'Last 7 Days';
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Time Range Selector */}
          <Button 
            variant="outlined" 
            startIcon={<DateRangeIcon />}
            onClick={(e) => setTimeRangeMenuAnchor(e.currentTarget)}
            sx={{ mr: 1 }}
            size="small"
          >
            {getTimeRangeLabel()}
          </Button>
          
          <Menu
            anchorEl={timeRangeMenuAnchor}
            open={Boolean(timeRangeMenuAnchor)}
            onClose={() => setTimeRangeMenuAnchor(null)}
          >
            <MenuItem onClick={() => handleTimeRangeChange('24h')}>
              <ListItemIcon>
                <TodayIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Last 24 Hours</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleTimeRangeChange('7d')}>
              <ListItemIcon>
                <LastWeekIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Last 7 Days</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleTimeRangeChange('30d')}>
              <ListItemIcon>
                <CalendarMonthIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Last 30 Days</ListItemText>
            </MenuItem>
          </Menu>
          
          {/* Refresh Controls */}
          <Tooltip title="Refresh Settings">
            <IconButton 
              onClick={(e) => setRefreshMenuAnchor(e.currentTarget)}
              sx={{ mr: 1 }}
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={refreshMenuAnchor}
            open={Boolean(refreshMenuAnchor)}
            onClose={() => setRefreshMenuAnchor(null)}
          >
            <MenuItem>
              <FormControlLabel
                control={
                  <Switch 
                    checked={autoRefresh} 
                    onChange={handleAutoRefreshChange}
                    size="small"
                  />
                }
                label="Auto-refresh"
              />
            </MenuItem>
            {autoRefresh && (
              <MenuItem>
                <FormControl size="small" fullWidth>
                  <InputLabel id="refresh-interval-label">Interval</InputLabel>
                  <Select
                    labelId="refresh-interval-label"
                    value={autoRefreshInterval}
                    label="Interval"
                    onChange={handleIntervalChange}
                  >
                    <MenuItem value={10}>10 seconds</MenuItem>
                    <MenuItem value={30}>30 seconds</MenuItem>
                    <MenuItem value={60}>1 minute</MenuItem>
                    <MenuItem value={300}>5 minutes</MenuItem>
                  </Select>
                </FormControl>
              </MenuItem>
            )}
          </Menu>
          
          <Tooltip title="Refresh Now">
            <IconButton 
              onClick={handleRefresh} 
              disabled={refreshing}
              sx={{ mr: 1 }}
            >
              {refreshing ? (
                <CircularProgress size={24} />
              ) : (
                <RefreshIcon />
              )}
            </IconButton>
          </Tooltip>
          
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAddInstance}
          >
            Add Instance
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Instances" 
            value={dashboardData.stats.instances} 
            icon={<StorageIcon sx={{ color: theme.palette.primary.light }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="CPU Usage" 
            value={`${dashboardData.stats.cpuUsage}%`} 
            icon={<MemoryIcon sx={{ color: theme.palette.info.light }} />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Memory Usage" 
            value={`${dashboardData.stats.memoryUsage}%`} 
            icon={<NetworkIcon sx={{ color: theme.palette.success.light }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Active Alerts" 
            value={dashboardData.stats.alerts} 
            icon={<WarningIcon sx={{ color: theme.palette.warning.light }} />}
            color="warning"
          />
        </Grid>
      </Grid>
      
      <Card sx={{ mb: 4 }}>
        <CardHeader 
          title={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Instances</Typography>
              {refreshing && <CircularProgress size={20} sx={{ ml: 2 }} />}
            </Box>
          }
          sx={{ pb: 0 }}
        />
        
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            placeholder="Search instances..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleSearchSubmit}
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
            <InputLabel id="project-select-label">Project</InputLabel>
            <Select
              labelId="project-select-label"
              id="project-select"
              value={selectedProject}
              label="Project"
              onChange={handleProjectChange}
            >
              <MenuItem value="All Projects">All Projects</MenuItem>
              {projects.map(project => (
                <MenuItem key={project} value={project}>{project}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="zone-select-label">Zone</InputLabel>
            <Select
              labelId="zone-select-label"
              id="zone-select"
              value={selectedZone}
              label="Zone"
              onChange={handleZoneChange}
            >
              <MenuItem value="All Zones">All Zones</MenuItem>
              {zones.map(zone => (
                <MenuItem key={zone} value={zone}>{zone}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        <Divider sx={{ mt: 2 }} />
        <TableContainer component={Box}>
          <Table sx={{ minWidth: 650 }} size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Instance</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Zone</TableCell>
                <TableCell>IP</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>CPU</TableCell>
                <TableCell>Memory</TableCell>
                <TableCell>Disk</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : filteredInstances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      No instances found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredInstances.map((instance) => (
                  <TableRow key={instance.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {instance.name}
                        </Typography>
                        {instance.url && (
                          <Typography variant="caption" color="text.secondary" component="div">
                            {instance.url}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{instance.project || '-'}</TableCell>
                    <TableCell>{instance.zone || instance.region || '-'}</TableCell>
                    <TableCell>{instance.ip || instance.ip_address || '-'}</TableCell>
                    <TableCell>{instance.type || instance.instance_type || '-'}</TableCell>
                    <TableCell>{instance.cpu || '-'}</TableCell>
                    <TableCell>{instance.memory || '-'}</TableCell>
                    <TableCell>{instance.disk || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={instance.status || 'Unknown'} 
                        size="small" 
                        color={getStatusColor(instance.status)}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        sx={{ mr: 1 }}
                        onClick={() => handleEditInstance(instance.id)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteInstance(instance.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader 
              title={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Resource Usage</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getTimeRangeLabel()}
                  </Typography>
                </Box>
              } 
            />
            <Divider />
            <CardContent sx={{ height: 300 }}>
              {loading ? (
                <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dashboardData.resourceData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis unit="%" />
                    <RechartsTooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="cpu" 
                      name="CPU Usage" 
                      stackId="1" 
                      stroke={theme.palette.info.main} 
                      fill={theme.palette.info.light} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="memory" 
                      name="Memory Usage" 
                      stackId="2" 
                      stroke={theme.palette.success.main} 
                      fill={theme.palette.success.light} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="disk" 
                      name="Disk Usage" 
                      stackId="3" 
                      stroke={theme.palette.warning.main} 
                      fill={theme.palette.warning.light} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Recent Alerts</Typography>
                  <Badge badgeContent={dashboardData.alerts.length} color="error">
                    <WarningIcon color="action" />
                  </Badge>
                </Box>
              } 
            />
            <Divider />
            <CardContent sx={{ maxHeight: 300, overflow: 'auto' }}>
              {loading ? (
                <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                  <CircularProgress />
                </Box>
              ) : (
                dashboardData.alerts.length > 0 ? (
                  <Box>
                    {dashboardData.alerts.map(alert => (
                      <Box 
                        key={alert.id} 
                        sx={{ 
                          mb: 2, 
                          p: 1.5, 
                          borderRadius: 1, 
                          bgcolor: theme.palette.background.default,
                          borderLeft: `4px solid ${getSeverityColor(alert.severity)}`
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {alert.message}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {alert.instance}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimestamp(alert.timestamp)}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100 }}>
                    <Typography variant="body2" color="text.secondary">No active alerts</Typography>
                  </Box>
                )
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 