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
  VpnKey as ApiKeyIcon,
  Logout as LogoutIcon,
  Add as AddIcon
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

// Permission data structure
const permissionGroups = [
  {
    name: 'Instance Management',
    permissions: [
      { id: 'instance:view', name: 'View Instances', description: 'View instance details and status' },
      { id: 'instance:create', name: 'Create Instances', description: 'Create new instances' },
      { id: 'instance:edit', name: 'Edit Instances', description: 'Modify instance configuration' },
      { id: 'instance:delete', name: 'Delete Instances', description: 'Delete instances' },
      { id: 'instance:restart', name: 'Restart Instances', description: 'Restart instances' }
    ]
  },
  {
    name: 'User Management',
    permissions: [
      { id: 'user:view', name: 'View Users', description: 'View user details' },
      { id: 'user:create', name: 'Create Users', description: 'Create new users' },
      { id: 'user:edit', name: 'Edit Users', description: 'Modify user details and permissions' },
      { id: 'user:delete', name: 'Delete Users', description: 'Delete users' }
    ]
  },
  {
    name: 'Settings',
    permissions: [
      { id: 'settings:view', name: 'View Settings', description: 'View system settings' },
      { id: 'settings:edit', name: 'Edit Settings', description: 'Modify system settings' }
    ]
  },
  {
    name: 'Events & Logs',
    permissions: [
      { id: 'events:view', name: 'View Events', description: 'View event logs' },
      { id: 'events:export', name: 'Export Events', description: 'Export event logs' }
    ]
  }
];

// Predefined roles with permissions
const predefinedRoles = {
  admin: {
    name: 'Administrator',
    description: 'Full access to all features',
    permissions: [
      'instance:view', 'instance:create', 'instance:edit', 'instance:delete', 'instance:restart',
      'user:view', 'user:create', 'user:edit', 'user:delete',
      'settings:view', 'settings:edit',
      'events:view', 'events:export'
    ]
  },
  manager: {
    name: 'Manager',
    description: 'Can manage instances and view users',
    permissions: [
      'instance:view', 'instance:create', 'instance:edit', 'instance:restart',
      'user:view',
      'settings:view',
      'events:view', 'events:export'
    ]
  },
  operator: {
    name: 'Operator',
    description: 'Can view and restart instances',
    permissions: [
      'instance:view', 'instance:restart',
      'events:view'
    ]
  },
  viewer: {
    name: 'Viewer',
    description: 'Read-only access',
    permissions: [
      'instance:view',
      'events:view'
    ]
  }
};

// Activity types and their icons
const activityIcons = {
  login: <PersonIcon fontSize="small" />,
  logout: <LogoutIcon fontSize="small" />,
  create: <AddIcon fontSize="small" />,
  update: <EditIcon fontSize="small" />,
  delete: <DeleteIcon fontSize="small" />,
  permission: <SecurityIcon fontSize="small" />,
  settings: <SettingsIcon fontSize="small" />
};

const UserDetail = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityPage, setActivityPage] = useState(1);
  const [activityHasMore, setActivityHasMore] = useState(true);
  const [userPermissions, setUserPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [permissionChanged, setPermissionChanged] = useState(false);

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

  useEffect(() => {
    if (user) {
      // Set initial permissions based on user role
      if (user.role && predefinedRoles[user.role.toLowerCase()]) {
        setSelectedRole(user.role.toLowerCase());
        setUserPermissions(predefinedRoles[user.role.toLowerCase()].permissions);
        setIsCustomRole(false);
      } else {
        setSelectedRole('custom');
        setUserPermissions(user.permissions || []);
        setIsCustomRole(true);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user && tabValue === 2) { // Load activity when the activity tab is selected
      fetchUserActivity();
    }
  }, [user, tabValue, activityPage]);

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

  const handleRoleChange = (event) => {
    const role = event.target.value;
    setSelectedRole(role);
    
    if (role === 'custom') {
      setIsCustomRole(true);
      // Keep current permissions when switching to custom
    } else {
      setIsCustomRole(false);
      setUserPermissions(predefinedRoles[role].permissions);
      setPermissionChanged(true);
    }
  };
  
  const handlePermissionToggle = (permissionId) => {
    setUserPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
    
    // When manually changing permissions, switch to custom role
    if (!isCustomRole) {
      setSelectedRole('custom');
      setIsCustomRole(true);
    }
    
    setPermissionChanged(true);
  };
  
  const handleSavePermissions = () => {
    // TODO: Implement API call to save permissions
    console.log('Saving permissions:', {
      userId: id,
      role: selectedRole,
      permissions: userPermissions
    });
    
    setPermissionChanged(false);
    // Show success message
  };
  
  const isPermissionEnabled = (permissionId) => {
    return userPermissions.includes(permissionId);
  };

  const fetchUserActivity = async () => {
    if (!user || activityLoading) return;
    
    setActivityLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/users/${id}/activity?page=${activityPage}`);
      // const data = await response.json();
      
      // Mock data for development
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      const mockActivity = Array.from({ length: 10 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(i / 2));
        date.setHours(date.getHours() - (i % 12));
        
        const types = ['login', 'logout', 'update', 'create', 'delete', 'permission', 'settings'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        let description = '';
        switch (type) {
          case 'login':
            description = 'Logged in to the system';
            break;
          case 'logout':
            description = 'Logged out of the system';
            break;
          case 'update':
            description = 'Updated profile information';
            break;
          case 'create':
            description = 'Created a new instance';
            break;
          case 'delete':
            description = 'Deleted an instance';
            break;
          case 'permission':
            description = 'Permission settings changed';
            break;
          case 'settings':
            description = 'Updated account settings';
            break;
          default:
            description = 'Performed an action';
        }
        
        return {
          id: `act-${Date.now()}-${i}`,
          type,
          description,
          timestamp: date.toISOString(),
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          details: {
            browser: 'Chrome',
            os: 'Windows 10',
            location: 'New York, USA'
          }
        };
      });
      
      setRecentActivity(prev => 
        activityPage === 1 ? mockActivity : [...prev, ...mockActivity]
      );
      setActivityHasMore(activityPage < 3); // Limit to 3 pages for mock data
      setActivityLoading(false);
    } catch (error) {
      console.error('Error fetching user activity:', error);
      setActivityLoading(false);
    }
  };
  
  const handleLoadMoreActivity = () => {
    setActivityPage(prev => prev + 1);
  };
  
  const getActivityIcon = (type) => {
    return activityIcons[type] || <HistoryIcon fontSize="small" />;
  };
  
  const getActivityColor = (type) => {
    switch (type) {
      case 'login':
        return theme.palette.success.main;
      case 'logout':
        return theme.palette.info.main;
      case 'create':
        return theme.palette.success.main;
      case 'update':
        return theme.palette.warning.main;
      case 'delete':
        return theme.palette.error.main;
      case 'permission':
        return theme.palette.secondary.main;
      case 'settings':
        return theme.palette.primary.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const renderPermissionsTab = () => (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Role Assignment
        </Typography>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <InputLabel id="role-select-label" sx={{ mb: 1 }}>User Role</InputLabel>
              <Select
                labelId="role-select-label"
                id="role-select"
                value={selectedRole}
                onChange={handleRoleChange}
                fullWidth
              >
                {Object.entries(predefinedRoles).map(([key, role]) => (
                  <MenuItem key={key} value={key}>
                    {role.name}
                  </MenuItem>
                ))}
                <MenuItem value="custom">Custom Role</MenuItem>
              </Select>
              
              {!isCustomRole && selectedRole && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {predefinedRoles[selectedRole].description}
                </Typography>
              )}
            </Grid>
          </Grid>
          
          {permissionChanged && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleSavePermissions}
              >
                Save Changes
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
      
      <Box>
        <Typography variant="h6" gutterBottom>
          Permissions
        </Typography>
        
        {permissionGroups.map((group) => (
          <Paper key={group.name} variant="outlined" sx={{ mb: 3 }}>
            <Box sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="subtitle1" fontWeight="medium">
                {group.name}
              </Typography>
            </Box>
            <Divider />
            <List disablePadding>
              {group.permissions.map((permission) => (
                <ListItem 
                  key={permission.id}
                  divider
                  secondaryAction={
                    <Switch
                      edge="end"
                      checked={isPermissionEnabled(permission.id)}
                      onChange={() => handlePermissionToggle(permission.id)}
                      disabled={!isCustomRole && selectedRole !== 'custom'}
                    />
                  }
                >
                  <ListItemText 
                    primary={permission.name}
                    secondary={permission.description}
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        ))}
      </Box>
    </Box>
  );

  const renderActivityTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Recent Activity
      </Typography>
      
      <Paper variant="outlined">
        {recentActivity.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No activity found for this user
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {recentActivity.map((activity, index) => {
              const activityDate = new Date(activity.timestamp);
              const formattedDate = formatDate(activity.timestamp);
              
              // Group activities by date
              const showDateDivider = index === 0 || 
                new Date(recentActivity[index - 1].timestamp).toDateString() !== activityDate.toDateString();
              
              return (
                <Box key={activity.id}>
                  {showDateDivider && (
                    <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {activityDate.toDateString() === new Date().toDateString() 
                          ? 'Today' 
                          : activityDate.toDateString() === new Date(Date.now() - 86400000).toDateString()
                            ? 'Yesterday'
                            : activityDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
                        }
                      </Typography>
                    </Box>
                  )}
                  
                  <ListItem 
                    divider={index < recentActivity.length - 1}
                    sx={{ py: 2 }}
                  >
                    <ListItemIcon sx={{ 
                      color: getActivityColor(activity.type),
                      minWidth: 40
                    }}>
                      {getActivityIcon(activity.type)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={activity.description}
                      secondary={
                        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {activityDate.toLocaleTimeString()} • IP: {activity.ip}
                          </Typography>
                          {activity.details && (
                            <Typography variant="caption" color="text.secondary">
                              {activity.details.browser} • {activity.details.os} • {activity.details.location}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                </Box>
              );
            })}
            
            {activityHasMore && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Button 
                  onClick={handleLoadMoreActivity}
                  disabled={activityLoading}
                  startIcon={activityLoading ? <CircularProgress size={16} /> : null}
                >
                  {activityLoading ? 'Loading...' : 'Load More'}
                </Button>
              </Box>
            )}
          </List>
        )}
      </Paper>
    </Box>
  );

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
                
                {renderActivityTab()}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        {renderPermissionsTab()}
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        {renderActivityTab()}
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