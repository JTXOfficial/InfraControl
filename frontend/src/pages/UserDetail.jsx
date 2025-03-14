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
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  useTheme,
  InputLabel,
  Select,
  MenuItem,
  Paper
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  VpnKey as ApiKeyIcon
} from '@mui/icons-material';

// Custom TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
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

const UserDetail = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Simulate API call to fetch user details
    const timer = setTimeout(() => {
      const mockUser = {
        id,
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'Administrator',
        status: 'active',
        avatar: null,
        department: 'IT Operations',
        position: 'Senior DevOps Engineer',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        createdAt: '2024-01-10T08:30:00Z',
        lastLogin: '2025-03-14T09:15:22Z',
        permissions: [
          'instances:read',
          'instances:write',
          'instances:delete',
          'users:read',
          'users:write',
          'settings:read',
          'settings:write'
        ]
      };
      
      setUser(mockUser);
      
      // Simulate recent activity data
      setRecentActivity([
        { 
          id: 1, 
          action: 'Created instance', 
          resource: 'web-server-01', 
          timestamp: '2025-03-14T08:30:00Z' 
        },
        { 
          id: 2, 
          action: 'Updated user', 
          resource: 'jane.smith@example.com', 
          timestamp: '2025-03-13T14:45:00Z' 
        },
        { 
          id: 3, 
          action: 'Deleted instance', 
          resource: 'test-server-03', 
          timestamp: '2025-03-12T11:20:00Z' 
        },
        { 
          id: 4, 
          action: 'Modified settings', 
          resource: 'Notification preferences', 
          timestamp: '2025-03-10T16:15:00Z' 
        }
      ]);
      
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleBack = () => {
    navigate('/users');
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleEditUser = () => {
    console.log(`Edit user ${id}`);
  };

  const handleDeleteUser = () => {
    console.log(`Delete user ${id}`);
    navigate('/users');
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

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
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
            {user.name}
          </Typography>
          <Chip 
            label={user.status} 
            size="small"
            color={user.status === 'active' ? 'success' : 'error'}
            sx={{ ml: 2 }}
          />
        </Box>
        
        <Box>
          <IconButton onClick={handleRefresh} sx={{ mr: 1 }}>
            <RefreshIcon />
          </IconButton>
          <Button 
            variant="outlined" 
            startIcon={<EditIcon />}
            onClick={handleEditUser}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button 
            variant="outlined" 
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteUser}
          >
            Delete
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="user tabs"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Profile" icon={<PersonIcon />} iconPosition="start" />
          <Tab label="Permissions" icon={<SecurityIcon />} iconPosition="start" />
          <Tab label="Activity" icon={<HistoryIcon />} iconPosition="start" />
          <Tab label="Settings" icon={<SettingsIcon />} iconPosition="start" />
          <Tab label="API Keys" icon={<ApiKeyIcon />} iconPosition="start" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
                <Avatar 
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    mb: 2,
                    bgcolor: theme.palette.primary.main,
                    fontSize: '2rem'
                  }}
                >
                  {getInitials(user.name)}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {user.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {user.email}
                </Typography>
                <Chip 
                  label={user.role} 
                  color="primary" 
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Account Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    User ID
                  </Typography>
                  <Typography variant="body1">
                    {user.id}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      component="span" 
                      sx={{ 
                        display: 'inline-block', 
                        width: 10, 
                        height: 10, 
                        borderRadius: '50%', 
                        bgcolor: user.status === 'active' ? 'success.main' : 'error.main',
                        mr: 1
                      }} 
                    />
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(user.createdAt)}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Last Login
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(user.lastLogin)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Full Name
                      </Typography>
                      <Typography variant="body1">
                        {user.name}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {user.email}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body1">
                        {user.phone}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Department
                      </Typography>
                      <Typography variant="body1">
                        {user.department}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Position
                      </Typography>
                      <Typography variant="body1">
                        {user.position}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Location
                      </Typography>
                      <Typography variant="body1">
                        {user.location}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List disablePadding>
                  {recentActivity.map((activity) => (
                    <ListItem 
                      key={activity.id}
                      disablePadding
                      sx={{ 
                        py: 1.5,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        '&:last-child': { borderBottom: 'none' }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body1">
                              {activity.action}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(activity.timestamp)}
                            </Typography>
                          </Box>
                        }
                        secondary={activity.resource}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              User Permissions
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Instance Management
                </Typography>
                <List disablePadding>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={user.permissions.includes('instances:read')}
                          color="primary"
                        />
                      }
                      label="View instances"
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={user.permissions.includes('instances:write')}
                          color="primary"
                        />
                      }
                      label="Create/Edit instances"
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={user.permissions.includes('instances:delete')}
                          color="primary"
                        />
                      }
                      label="Delete instances"
                    />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  User Management
                </Typography>
                <List disablePadding>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={user.permissions.includes('users:read')}
                          color="primary"
                        />
                      }
                      label="View users"
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={user.permissions.includes('users:write')}
                          color="primary"
                        />
                      }
                      label="Create/Edit users"
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={user.permissions.includes('users:delete')}
                          color="primary"
                        />
                      }
                      label="Delete users"
                    />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Settings
                </Typography>
                <List disablePadding>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={user.permissions.includes('settings:read')}
                          color="primary"
                        />
                      }
                      label="View settings"
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={user.permissions.includes('settings:write')}
                          color="primary"
                        />
                      }
                      label="Modify settings"
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Activity History
              </Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="activity-time-range-label">Time Range</InputLabel>
                <Select
                  labelId="activity-time-range-label"
                  id="activity-time-range-select"
                  value="7d"
                  label="Time Range"
                >
                  <MenuItem value="24h">Last 24 Hours</MenuItem>
                  <MenuItem value="7d">Last 7 Days</MenuItem>
                  <MenuItem value="30d">Last 30 Days</MenuItem>
                  <MenuItem value="90d">Last 90 Days</MenuItem>
                  <MenuItem value="all">All Time</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <Box sx={{ height: 400, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ position: 'sticky', top: 0, background: theme.palette.background.paper, zIndex: 1 }}>
                    <tr>
                      <th style={{ padding: '16px', textAlign: 'left', borderBottom: `1px solid ${theme.palette.divider}` }}>Timestamp</th>
                      <th style={{ padding: '16px', textAlign: 'left', borderBottom: `1px solid ${theme.palette.divider}` }}>Action</th>
                      <th style={{ padding: '16px', textAlign: 'left', borderBottom: `1px solid ${theme.palette.divider}` }}>Resource</th>
                      <th style={{ padding: '16px', textAlign: 'left', borderBottom: `1px solid ${theme.palette.divider}` }}>IP Address</th>
                      <th style={{ padding: '16px', textAlign: 'left', borderBottom: `1px solid ${theme.palette.divider}` }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { timestamp: '2024-03-14 01:45:22', action: 'Login', resource: 'System', ip: '192.168.1.1', status: 'success' },
                      { timestamp: '2024-03-14 01:46:15', action: 'Create', resource: 'Instance (i-12345)', ip: '192.168.1.1', status: 'success' },
                      { timestamp: '2024-03-14 01:50:33', action: 'Update', resource: 'Instance (i-12345)', ip: '192.168.1.1', status: 'success' },
                      { timestamp: '2024-03-14 02:05:12', action: 'Start', resource: 'Instance (i-12345)', ip: '192.168.1.1', status: 'success' },
                      { timestamp: '2024-03-13 14:22:45', action: 'Login', resource: 'System', ip: '192.168.1.1', status: 'success' },
                      { timestamp: '2024-03-13 14:30:18', action: 'Create', resource: 'User (user-789)', ip: '192.168.1.1', status: 'success' },
                      { timestamp: '2024-03-13 14:35:22', action: 'Update', resource: 'User (user-789)', ip: '192.168.1.1', status: 'success' },
                      { timestamp: '2024-03-13 15:10:05', action: 'Delete', resource: 'Instance (i-54321)', ip: '192.168.1.1', status: 'success' },
                      { timestamp: '2024-03-12 09:15:33', action: 'Login', resource: 'System', ip: '192.168.1.1', status: 'success' },
                      { timestamp: '2024-03-12 09:22:17', action: 'Create', resource: 'Instance (i-54321)', ip: '192.168.1.1', status: 'success' },
                      { timestamp: '2024-03-12 09:45:52', action: 'Update', resource: 'Instance (i-54321)', ip: '192.168.1.1', status: 'success' },
                      { timestamp: '2024-03-12 10:05:18', action: 'Start', resource: 'Instance (i-54321)', ip: '192.168.1.1', status: 'success' },
                      { timestamp: '2024-03-11 11:30:42', action: 'Login', resource: 'System', ip: '192.168.1.1', status: 'success' },
                      { timestamp: '2024-03-11 11:45:15', action: 'Update', resource: 'User Settings', ip: '192.168.1.1', status: 'success' },
                      { timestamp: '2024-03-11 12:05:33', action: 'Create', resource: 'API Key', ip: '192.168.1.1', status: 'success' },
                    ].map((activity, index) => (
                      <tr key={index} style={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <td style={{ padding: '16px' }}>{activity.timestamp}</td>
                        <td style={{ padding: '16px' }}>
                          <Chip 
                            label={activity.action} 
                            size="small"
                            color={
                              activity.action === 'Create' ? 'success' :
                              activity.action === 'Update' ? 'primary' :
                              activity.action === 'Delete' ? 'error' :
                              activity.action === 'Start' ? 'info' :
                              'default'
                            }
                            sx={{ minWidth: '80px' }}
                          />
                        </td>
                        <td style={{ padding: '16px' }}>{activity.resource}</td>
                        <td style={{ padding: '16px' }}>{activity.ip}</td>
                        <td style={{ padding: '16px' }}>
                          <Chip 
                            label={activity.status} 
                            size="small"
                            color={activity.status === 'success' ? 'success' : 'error'}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Paper>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button variant="outlined" startIcon={<RefreshIcon />}>
                Refresh
              </Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>
      
      <TabPanel value={tabValue} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              User Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Account Settings
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                          <InputLabel>Email Notifications</InputLabel>
                          <Select
                            value="all"
                            label="Email Notifications"
                          >
                            <MenuItem value="all">All Notifications</MenuItem>
                            <MenuItem value="important">Important Only</MenuItem>
                            <MenuItem value="none">None</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                          <InputLabel>Two-Factor Authentication</InputLabel>
                          <Select
                            value="disabled"
                            label="Two-Factor Authentication"
                          >
                            <MenuItem value="disabled">Disabled</MenuItem>
                            <MenuItem value="app">Authenticator App</MenuItem>
                            <MenuItem value="sms">SMS</MenuItem>
                            <MenuItem value="email">Email</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={<Switch checked={true} color="primary" />}
                          label="Session Timeout (30 minutes)"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Interface Settings
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                          <InputLabel>Theme</InputLabel>
                          <Select
                            value="dark"
                            label="Theme"
                          >
                            <MenuItem value="light">Light</MenuItem>
                            <MenuItem value="dark">Dark</MenuItem>
                            <MenuItem value="system">System Default</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                          <InputLabel>Default Page</InputLabel>
                          <Select
                            value="dashboard"
                            label="Default Page"
                          >
                            <MenuItem value="dashboard">Dashboard</MenuItem>
                            <MenuItem value="instances">Instances</MenuItem>
                            <MenuItem value="users">Users</MenuItem>
                            <MenuItem value="events">Events</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={<Switch checked={true} color="primary" />}
                          label="Enable Animations"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Password
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                          <InputLabel>Current Password</InputLabel>
                          <Select
                            value="********"
                            label="Current Password"
                          >
                            <MenuItem value="********">********</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                          <InputLabel>New Password</InputLabel>
                          <Select
                            value=""
                            label="New Password"
                          >
                            <MenuItem value=""><em>Enter new password</em></MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth variant="outlined" size="small">
                          <InputLabel>Confirm New Password</InputLabel>
                          <Select
                            value=""
                            label="Confirm New Password"
                          >
                            <MenuItem value=""><em>Confirm new password</em></MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                          <Button variant="contained" color="primary" size="small">
                            Change Password
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Timezone & Language
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                          <InputLabel>Timezone</InputLabel>
                          <Select
                            value="UTC"
                            label="Timezone"
                          >
                            <MenuItem value="UTC">UTC</MenuItem>
                            <MenuItem value="America/New_York">Eastern Time (ET)</MenuItem>
                            <MenuItem value="America/Chicago">Central Time (CT)</MenuItem>
                            <MenuItem value="America/Denver">Mountain Time (MT)</MenuItem>
                            <MenuItem value="America/Los_Angeles">Pacific Time (PT)</MenuItem>
                            <MenuItem value="Europe/London">London (GMT)</MenuItem>
                            <MenuItem value="Europe/Paris">Paris (CET)</MenuItem>
                            <MenuItem value="Asia/Tokyo">Tokyo (JST)</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth variant="outlined" size="small">
                          <InputLabel>Language</InputLabel>
                          <Select
                            value="en"
                            label="Language"
                          >
                            <MenuItem value="en">English</MenuItem>
                            <MenuItem value="es">Spanish</MenuItem>
                            <MenuItem value="fr">French</MenuItem>
                            <MenuItem value="de">German</MenuItem>
                            <MenuItem value="ja">Japanese</MenuItem>
                            <MenuItem value="zh">Chinese</MenuItem>
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
      
      <TabPanel value={tabValue} index={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                API Keys
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<ApiKeyIcon />}
              >
                Generate New Key
              </Button>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      API Access
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      API keys allow you to authenticate with the InfraControl API. Keep your API keys secure and never share them publicly.
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={<Switch checked={true} color="primary" />}
                          label="Enable API Access"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth variant="outlined" size="small">
                          <InputLabel>API Rate Limit</InputLabel>
                          <Select
                            value="1000"
                            label="API Rate Limit"
                          >
                            <MenuItem value="100">100 requests per minute</MenuItem>
                            <MenuItem value="500">500 requests per minute</MenuItem>
                            <MenuItem value="1000">1000 requests per minute</MenuItem>
                            <MenuItem value="5000">5000 requests per minute</MenuItem>
                            <MenuItem value="unlimited">Unlimited</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Active API Keys
                </Typography>
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                  <Box sx={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '16px', textAlign: 'left', borderBottom: `1px solid ${theme.palette.divider}` }}>Name</th>
                          <th style={{ padding: '16px', textAlign: 'left', borderBottom: `1px solid ${theme.palette.divider}` }}>Key Prefix</th>
                          <th style={{ padding: '16px', textAlign: 'left', borderBottom: `1px solid ${theme.palette.divider}` }}>Created</th>
                          <th style={{ padding: '16px', textAlign: 'left', borderBottom: `1px solid ${theme.palette.divider}` }}>Last Used</th>
                          <th style={{ padding: '16px', textAlign: 'left', borderBottom: `1px solid ${theme.palette.divider}` }}>Status</th>
                          <th style={{ padding: '16px', textAlign: 'right', borderBottom: `1px solid ${theme.palette.divider}` }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { 
                            name: 'Production API Key', 
                            prefix: 'ic_prod_', 
                            created: '2024-03-10', 
                            lastUsed: '2024-03-14', 
                            status: 'active' 
                          },
                          { 
                            name: 'Development API Key', 
                            prefix: 'ic_dev_', 
                            created: '2024-03-11', 
                            lastUsed: '2024-03-13', 
                            status: 'active' 
                          },
                          { 
                            name: 'Testing API Key', 
                            prefix: 'ic_test_', 
                            created: '2024-03-12', 
                            lastUsed: '2024-03-12', 
                            status: 'active' 
                          },
                          { 
                            name: 'Backup API Key', 
                            prefix: 'ic_backup_', 
                            created: '2024-03-13', 
                            lastUsed: 'Never', 
                            status: 'inactive' 
                          },
                        ].map((key, index) => (
                          <tr key={index} style={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                            <td style={{ padding: '16px' }}>{key.name}</td>
                            <td style={{ padding: '16px' }}>{key.prefix}***************</td>
                            <td style={{ padding: '16px' }}>{key.created}</td>
                            <td style={{ padding: '16px' }}>{key.lastUsed}</td>
                            <td style={{ padding: '16px' }}>
                              <Chip 
                                label={key.status} 
                                size="small"
                                color={key.status === 'active' ? 'success' : 'default'}
                              />
                            </td>
                            <td style={{ padding: '16px', textAlign: 'right' }}>
                              <Button 
                                variant="outlined" 
                                size="small" 
                                sx={{ mr: 1 }}
                                color={key.status === 'active' ? 'warning' : 'success'}
                              >
                                {key.status === 'active' ? 'Disable' : 'Enable'}
                              </Button>
                              <Button 
                                variant="outlined" 
                                color="error" 
                                size="small"
                              >
                                Revoke
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ mt: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      API Key Permissions
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Configure the default permissions for new API keys. Individual key permissions can be modified after creation.
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <FormControlLabel
                          control={<Switch checked={true} color="primary" />}
                          label="Read Instances"
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormControlLabel
                          control={<Switch checked={true} color="primary" />}
                          label="Modify Instances"
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormControlLabel
                          control={<Switch checked={false} color="primary" />}
                          label="Delete Instances"
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormControlLabel
                          control={<Switch checked={true} color="primary" />}
                          label="Read Users"
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormControlLabel
                          control={<Switch checked={false} color="primary" />}
                          label="Modify Users"
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormControlLabel
                          control={<Switch checked={false} color="primary" />}
                          label="Delete Users"
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormControlLabel
                          control={<Switch checked={true} color="primary" />}
                          label="Read Events"
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormControlLabel
                          control={<Switch checked={false} color="primary" />}
                          label="Modify Settings"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
};

export default UserDetail; 