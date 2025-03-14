import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid,
  CircularProgress,
  Divider,
  IconButton,
  Button,
  Tabs,
  Tab,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Refresh as RestartIcon,
  Delete as DeleteIcon,
  Storage as StorageIcon,
  Memory as MemoryIcon,
  NetworkCheck as NetworkIcon,
  Info as InfoIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Terminal as TerminalIcon,
  Backup as BackupIcon
} from '@mui/icons-material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// Custom TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`instance-tabpanel-${index}`}
      aria-labelledby={`instance-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const InstanceDetail = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [instance, setInstance] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [metrics, setMetrics] = useState({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0
  });

  useEffect(() => {
    // Simulate API call to fetch instance details
    const timer = setTimeout(() => {
      const mockInstance = {
        id,
        name: 'web-server-01',
        url: 'https://web01.example.com',
        type: 'web-server',
        status: 'running',
        project: 'e-commerce',
        zone: 'us-west1-a',
        ip: '10.0.0.1231',
        stack: 'LAMP',
        cpu: 4,
        memory: '8.0 GB',
        disk: '50 GB',
        os: 'Ubuntu 22.04 LTS',
        createdAt: '2025-01-15T10:30:00Z',
        updatedAt: '2025-03-10T15:45:22Z',
        tags: ['production', 'web', 'public'],
        description: 'Primary web server for e-commerce platform'
      };
      
      setInstance(mockInstance);
      
      // Simulate metrics data
      setMetrics({
        cpu: 45,
        memory: 62,
        disk: 30,
        network: 25
      });
      
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleBack = () => {
    navigate('/instances');
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleStartInstance = () => {
    console.log(`Start instance ${id}`);
  };

  const handleStopInstance = () => {
    console.log(`Stop instance ${id}`);
  };

  const handleRestartInstance = () => {
    console.log(`Restart instance ${id}`);
  };

  const handleDeleteInstance = () => {
    console.log(`Delete instance ${id}`);
    navigate('/instances');
  };

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {instance.name}
          </Typography>
          <Chip 
            label={instance.status} 
            size="small"
            color={instance.status === 'running' ? 'success' : 'error'}
            sx={{ ml: 2 }}
          />
        </Box>
        
        <Box>
          <IconButton onClick={handleRefresh} sx={{ mr: 1 }}>
            <RefreshIcon />
          </IconButton>
          {instance.status === 'running' ? (
            <>
              <Button 
                variant="outlined" 
                startIcon={<StopIcon />}
                onClick={handleStopInstance}
                sx={{ mr: 1 }}
              >
                Stop
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<RestartIcon />}
                onClick={handleRestartInstance}
                sx={{ mr: 1 }}
              >
                Restart
              </Button>
            </>
          ) : (
            <Button 
              variant="contained" 
              color="success"
              startIcon={<StartIcon />}
              onClick={handleStartInstance}
              sx={{ mr: 1 }}
            >
              Start
            </Button>
          )}
          <Button 
            variant="outlined" 
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteInstance}
          >
            Delete
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="instance tabs"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Overview" icon={<InfoIcon />} iconPosition="start" />
          <Tab label="Metrics" icon={<HistoryIcon />} iconPosition="start" />
          <Tab label="Settings" icon={<SettingsIcon />} iconPosition="start" />
          <Tab label="Console" icon={<TerminalIcon />} iconPosition="start" />
          <Tab label="Backups" icon={<BackupIcon />} iconPosition="start" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Instance Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Instance ID
                      </Typography>
                      <Typography variant="body1">
                        {instance.id}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Name
                      </Typography>
                      <Typography variant="body1">
                        {instance.name}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Type
                      </Typography>
                      <Typography variant="body1">
                        {instance.type}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Project
                      </Typography>
                      <Typography variant="body1">
                        {instance.project}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Zone
                      </Typography>
                      <Typography variant="body1">
                        {instance.zone}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        IP Address
                      </Typography>
                      <Typography variant="body1">
                        {instance.ip}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Stack
                      </Typography>
                      <Typography variant="body1">
                        {instance.stack}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Operating System
                      </Typography>
                      <Typography variant="body1">
                        {instance.os}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Created
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(instance.createdAt)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Last Updated
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(instance.updatedAt)}
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
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resource Allocation
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List disablePadding>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <MemoryIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="CPU" 
                      secondary={`${instance.cpu} vCPUs`}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body1' }}
                    />
                  </ListItem>
                  
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <StorageIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Memory" 
                      secondary={instance.memory}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body1' }}
                    />
                  </ListItem>
                  
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <StorageIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Disk" 
                      secondary={instance.disk}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body1' }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Usage
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List disablePadding>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <MemoryIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="CPU Usage" 
                      secondary={`${metrics.cpu}%`}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body1' }}
                    />
                  </ListItem>
                  
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <StorageIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Memory Usage" 
                      secondary={`${metrics.memory}%`}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body1' }}
                    />
                  </ListItem>
                  
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <StorageIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Disk Usage" 
                      secondary={`${metrics.disk}%`}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body1' }}
                    />
                  </ListItem>
                  
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <NetworkIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Network Usage" 
                      secondary={`${metrics.network}%`}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body1' }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Resource Metrics
              </Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="time-range-label">Time Range</InputLabel>
                <Select
                  labelId="time-range-label"
                  id="time-range-select"
                  value="24h"
                  label="Time Range"
                >
                  <MenuItem value="1h">Last Hour</MenuItem>
                  <MenuItem value="6h">Last 6 Hours</MenuItem>
                  <MenuItem value="24h">Last 24 Hours</MenuItem>
                  <MenuItem value="7d">Last 7 Days</MenuItem>
                  <MenuItem value="30d">Last 30 Days</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  CPU Usage (%)
                </Typography>
                <Paper sx={{ p: 2, height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { time: '00:00', value: 12 },
                        { time: '01:00', value: 15 },
                        { time: '02:00', value: 25 },
                        { time: '03:00', value: 32 },
                        { time: '04:00', value: 28 },
                        { time: '05:00', value: 20 },
                        { time: '06:00', value: 18 },
                        { time: '07:00', value: 22 },
                        { time: '08:00', value: 35 },
                        { time: '09:00', value: 45 },
                        { time: '10:00', value: 62 },
                        { time: '11:00', value: 58 },
                        { time: '12:00', value: 52 },
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        name="CPU Usage" 
                        stroke={theme.palette.primary.main} 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Memory Usage (%)
                </Typography>
                <Paper sx={{ p: 2, height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[
                        { time: '00:00', value: 25 },
                        { time: '01:00', value: 28 },
                        { time: '02:00', value: 32 },
                        { time: '03:00', value: 35 },
                        { time: '04:00', value: 38 },
                        { time: '05:00', value: 42 },
                        { time: '06:00', value: 45 },
                        { time: '07:00', value: 48 },
                        { time: '08:00', value: 52 },
                        { time: '09:00', value: 55 },
                        { time: '10:00', value: 58 },
                        { time: '11:00', value: 62 },
                        { time: '12:00', value: 65 },
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        name="Memory Usage" 
                        stroke={theme.palette.secondary.main}
                        fill={`${theme.palette.secondary.main}40`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Disk Usage (%)
                </Typography>
                <Paper sx={{ p: 2, height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[
                        { time: '00:00', value: 42 },
                        { time: '01:00', value: 43 },
                        { time: '02:00', value: 44 },
                        { time: '03:00', value: 45 },
                        { time: '04:00', value: 46 },
                        { time: '05:00', value: 47 },
                        { time: '06:00', value: 48 },
                        { time: '07:00', value: 49 },
                        { time: '08:00', value: 50 },
                        { time: '09:00', value: 51 },
                        { time: '10:00', value: 52 },
                        { time: '11:00', value: 53 },
                        { time: '12:00', value: 54 },
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        name="Disk Usage" 
                        stroke={theme.palette.error.main}
                        fill={`${theme.palette.error.main}40`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Network Traffic (Mbps)
                </Typography>
                <Paper sx={{ p: 2, height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { time: '00:00', in: 5, out: 2 },
                        { time: '01:00', in: 6, out: 3 },
                        { time: '02:00', in: 8, out: 4 },
                        { time: '03:00', in: 12, out: 6 },
                        { time: '04:00', in: 15, out: 8 },
                        { time: '05:00', in: 18, out: 10 },
                        { time: '06:00', in: 22, out: 12 },
                        { time: '07:00', in: 25, out: 15 },
                        { time: '08:00', in: 28, out: 18 },
                        { time: '09:00', in: 32, out: 22 },
                        { time: '10:00', in: 35, out: 25 },
                        { time: '11:00', in: 38, out: 28 },
                        { time: '12:00', in: 42, out: 32 },
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="in" 
                        name="Inbound" 
                        stroke={theme.palette.success.main} 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="out" 
                        name="Outbound" 
                        stroke={theme.palette.warning.main} 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Instance Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Basic Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                          <InputLabel>Instance Name</InputLabel>
                          <Select
                            value={instance.name}
                            label="Instance Name"
                          >
                            <MenuItem value={instance.name}>{instance.name}</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                          <InputLabel>Instance Type</InputLabel>
                          <Select
                            value={instance.type}
                            label="Instance Type"
                          >
                            <MenuItem value="t2.micro">t2.micro (1 vCPU, 1 GiB RAM)</MenuItem>
                            <MenuItem value="t2.small">t2.small (1 vCPU, 2 GiB RAM)</MenuItem>
                            <MenuItem value="t2.medium">t2.medium (2 vCPU, 4 GiB RAM)</MenuItem>
                            <MenuItem value="t2.large">t2.large (2 vCPU, 8 GiB RAM)</MenuItem>
                            <MenuItem value="t2.xlarge">t2.xlarge (4 vCPU, 16 GiB RAM)</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth variant="outlined" size="small">
                          <InputLabel>Region</InputLabel>
                          <Select
                            value={instance.region}
                            label="Region"
                          >
                            <MenuItem value="us-east-1">US East (N. Virginia)</MenuItem>
                            <MenuItem value="us-east-2">US East (Ohio)</MenuItem>
                            <MenuItem value="us-west-1">US West (N. California)</MenuItem>
                            <MenuItem value="us-west-2">US West (Oregon)</MenuItem>
                            <MenuItem value="eu-west-1">EU (Ireland)</MenuItem>
                            <MenuItem value="eu-central-1">EU (Frankfurt)</MenuItem>
                            <MenuItem value="ap-northeast-1">Asia Pacific (Tokyo)</MenuItem>
                            <MenuItem value="ap-southeast-1">Asia Pacific (Singapore)</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Tags
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {instance.tags && instance.tags.map(tag => (
                        <Chip 
                          key={tag} 
                          label={tag} 
                          size="small"
                          onDelete={() => {}}
                          sx={{ 
                            bgcolor: `${theme.palette.primary.main}20`,
                            color: theme.palette.primary.main
                          }}
                        />
                      ))}
                      <Chip 
                        label="Add Tag" 
                        size="small"
                        color="primary"
                        variant="outlined"
                        onClick={() => {}}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Network Settings
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                          <InputLabel>VPC</InputLabel>
                          <Select
                            value="vpc-default"
                            label="VPC"
                          >
                            <MenuItem value="vpc-default">Default VPC</MenuItem>
                            <MenuItem value="vpc-custom">Custom VPC</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                          <InputLabel>Subnet</InputLabel>
                          <Select
                            value="subnet-default"
                            label="Subnet"
                          >
                            <MenuItem value="subnet-default">Default Subnet</MenuItem>
                            <MenuItem value="subnet-public">Public Subnet</MenuItem>
                            <MenuItem value="subnet-private">Private Subnet</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth variant="outlined" size="small">
                          <InputLabel>Security Group</InputLabel>
                          <Select
                            value="sg-default"
                            label="Security Group"
                          >
                            <MenuItem value="sg-default">Default Security Group</MenuItem>
                            <MenuItem value="sg-web">Web Server Security Group</MenuItem>
                            <MenuItem value="sg-db">Database Security Group</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Storage Settings
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                          <InputLabel>Root Volume Type</InputLabel>
                          <Select
                            value="gp2"
                            label="Root Volume Type"
                          >
                            <MenuItem value="gp2">General Purpose SSD (gp2)</MenuItem>
                            <MenuItem value="gp3">General Purpose SSD (gp3)</MenuItem>
                            <MenuItem value="io1">Provisioned IOPS SSD (io1)</MenuItem>
                            <MenuItem value="io2">Provisioned IOPS SSD (io2)</MenuItem>
                            <MenuItem value="st1">Throughput Optimized HDD (st1)</MenuItem>
                            <MenuItem value="sc1">Cold HDD (sc1)</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth variant="outlined" size="small">
                          <InputLabel>Root Volume Size (GB)</InputLabel>
                          <Select
                            value="50"
                            label="Root Volume Size (GB)"
                          >
                            <MenuItem value="8">8 GB</MenuItem>
                            <MenuItem value="16">16 GB</MenuItem>
                            <MenuItem value="32">32 GB</MenuItem>
                            <MenuItem value="50">50 GB</MenuItem>
                            <MenuItem value="100">100 GB</MenuItem>
                            <MenuItem value="200">200 GB</MenuItem>
                            <MenuItem value="500">500 GB</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button variant="outlined" sx={{ mr: 2 }}>
                    Cancel
                  </Button>
                  <Button variant="contained" color="primary">
                    Save Changes
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>
      
      <TabPanel value={tabValue} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Console
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box 
              sx={{ 
                height: 400, 
                bgcolor: 'rgba(0, 0, 0, 0.7)', 
                borderRadius: 1,
                p: 2,
                fontFamily: 'monospace',
                color: '#fff',
                overflow: 'auto'
              }}
            >
              <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
                $ ssh user@{instance.ip}
                <br />
                Welcome to Ubuntu 22.04 LTS
                <br />
                <br />
                Last login: Fri Mar 14 02:06:55 2025 from 192.168.1.1
                <br />
                user@{instance.name}:~$ _
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>
      
      <TabPanel value={tabValue} index={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Backups
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<BackupIcon />}
              >
                Create Backup
              </Button>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Backup Schedule
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                          <InputLabel>Backup Frequency</InputLabel>
                          <Select
                            value="daily"
                            label="Backup Frequency"
                          >
                            <MenuItem value="disabled">Disabled</MenuItem>
                            <MenuItem value="hourly">Hourly</MenuItem>
                            <MenuItem value="daily">Daily</MenuItem>
                            <MenuItem value="weekly">Weekly</MenuItem>
                            <MenuItem value="monthly">Monthly</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                          <InputLabel>Retention Period</InputLabel>
                          <Select
                            value="7"
                            label="Retention Period"
                          >
                            <MenuItem value="1">1 Day</MenuItem>
                            <MenuItem value="7">7 Days</MenuItem>
                            <MenuItem value="14">14 Days</MenuItem>
                            <MenuItem value="30">30 Days</MenuItem>
                            <MenuItem value="90">90 Days</MenuItem>
                            <MenuItem value="365">365 Days</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Button variant="contained" color="primary" size="small">
                            Save Schedule
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Backup History
                </Typography>
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                  <Box sx={{ height: 400, overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ position: 'sticky', top: 0, background: theme.palette.background.paper, zIndex: 1 }}>
                        <tr>
                          <th style={{ padding: '16px', textAlign: 'left', borderBottom: `1px solid ${theme.palette.divider}` }}>ID</th>
                          <th style={{ padding: '16px', textAlign: 'left', borderBottom: `1px solid ${theme.palette.divider}` }}>Created</th>
                          <th style={{ padding: '16px', textAlign: 'left', borderBottom: `1px solid ${theme.palette.divider}` }}>Size</th>
                          <th style={{ padding: '16px', textAlign: 'left', borderBottom: `1px solid ${theme.palette.divider}` }}>Status</th>
                          <th style={{ padding: '16px', textAlign: 'left', borderBottom: `1px solid ${theme.palette.divider}` }}>Type</th>
                          <th style={{ padding: '16px', textAlign: 'right', borderBottom: `1px solid ${theme.palette.divider}` }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { id: 'bkp-001', created: '2024-03-14 01:00:00', size: '10.5 GB', status: 'completed', type: 'automated' },
                          { id: 'bkp-002', created: '2024-03-13 01:00:00', size: '10.2 GB', status: 'completed', type: 'automated' },
                          { id: 'bkp-003', created: '2024-03-12 01:00:00', size: '10.1 GB', status: 'completed', type: 'automated' },
                          { id: 'bkp-004', created: '2024-03-11 01:00:00', size: '9.8 GB', status: 'completed', type: 'automated' },
                          { id: 'bkp-005', created: '2024-03-10 01:00:00', size: '9.7 GB', status: 'completed', type: 'automated' },
                          { id: 'bkp-006', created: '2024-03-09 01:00:00', size: '9.5 GB', status: 'completed', type: 'automated' },
                          { id: 'bkp-007', created: '2024-03-08 01:00:00', size: '9.3 GB', status: 'completed', type: 'automated' },
                          { id: 'bkp-008', created: '2024-03-07 01:00:00', size: '9.1 GB', status: 'completed', type: 'automated' },
                        ].map((backup) => (
                          <tr key={backup.id} style={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                            <td style={{ padding: '16px' }}>{backup.id}</td>
                            <td style={{ padding: '16px' }}>{backup.created}</td>
                            <td style={{ padding: '16px' }}>{backup.size}</td>
                            <td style={{ padding: '16px' }}>
                              <Chip 
                                label={backup.status} 
                                size="small"
                                color={backup.status === 'completed' ? 'success' : 'warning'}
                              />
                            </td>
                            <td style={{ padding: '16px' }}>{backup.type}</td>
                            <td style={{ padding: '16px', textAlign: 'right' }}>
                              <Button 
                                variant="outlined" 
                                size="small" 
                                sx={{ mr: 1 }}
                              >
                                Restore
                              </Button>
                              <Button 
                                variant="outlined" 
                                color="error" 
                                size="small"
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
};

export default InstanceDetail; 