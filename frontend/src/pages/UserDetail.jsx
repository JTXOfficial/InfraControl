import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Paper,
  Snackbar,
  Alert,
  TextField
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
import userService from '../services/userService';

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

// Fallback component for when user data is not available
const UserNotFound = ({ id, onBack }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '70vh',
      textAlign: 'center'
    }}>
      <Typography variant="h4" color="error" gutterBottom>
        User Not Found
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        We couldn't find a user with ID: {id}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          color="primary"
          onClick={onBack}
          startIcon={<ArrowBackIcon />}
        >
          Back to Users
        </Button>
        <Button 
          variant="outlined" 
          component={Link} 
          to="/users"
          startIcon={<RefreshIcon />}
        >
          Refresh
        </Button>
      </Box>
    </Box>
  );
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
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      console.log('Fetching user data for ID:', id);
      // Add a small delay to ensure the component is mounted
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const userData = await userService.getUserById(id);
      console.log('User data received:', userData);
      
      if (!userData) {
        console.error('User data is null or undefined');
        setError('User not found');
        setLoading(false);
        return;
      }
      
      setUser(userData);
      setError(null);
      
      // Initialize editedUser with the fetched user data
      setEditedUser({
        ...userData,
        first_name: userData.name?.split(' ')[0] || '',
        last_name: userData.name?.split(' ').slice(1).join(' ') || '',
        status: userData.status || 'active'
      });
      
    } catch (err) {
      console.error('Failed to fetch user details:', err);
      setError('Failed to load user details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('UserDetail component mounted with ID:', id);
    fetchUserData();
    
    // Cleanup function
    return () => {
      console.log('UserDetail component unmounting');
    };
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
    fetchUserData();
  };

  const handleEditUser = () => {
    // Set edit mode and initialize editedUser with current user data
    setEditMode(true);
    setEditedUser({
      ...user,
      first_name: user.name?.split(' ')[0] || '',
      last_name: user.name?.split(' ').slice(1).join(' ') || ''
    });
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedUser(null);
  };

  const handleSaveUser = async () => {
    try {
      setLoading(true);
      
      // Prepare update data
      const updateData = {
        first_name: editedUser.first_name,
        last_name: editedUser.last_name,
        email: editedUser.email,
        role: editedUser.role,
        department: editedUser.department,
        position: editedUser.position,
        phone: editedUser.phone,
        location: editedUser.location,
        is_active: editedUser.status === 'active'
      };
      
      // Update user
      const updatedUser = await userService.updateUser(id, updateData);
      
      // Update local state
      setUser(updatedUser);
      setEditMode(false);
      setEditedUser(null);
      setSuccessMessage('User updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to update user:', err);
      setError('Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = (e) => {
    setEditedUser(prev => ({
      ...prev,
      status: e.target.value
    }));
  };

  const handleDeleteUser = async () => {
    try {
      setLoading(true);
      await userService.deleteUser(id);
      navigate('/users');
    } catch (err) {
      console.error(`Failed to delete user ${id}:`, err);
      setError('Failed to delete user. Please try again.');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
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
    if (!user || activityLoading || !activityHasMore) return;
    
    setActivityLoading(true);
    try {
      const activityData = await userService.getUserActivity(id, activityPage);
      
      if (activityPage === 1) {
        setRecentActivity(activityData.activities);
      } else {
        setRecentActivity(prev => [...prev, ...activityData.activities]);
      }
      
      setActivityHasMore(activityData.activities.length > 0 && activityData.pagination.hasNextPage);
    } catch (err) {
      console.error('Failed to fetch user activity:', err);
      setError('Failed to load user activity. Please try again.');
    } finally {
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
        <Typography variant="body1" sx={{ ml: 2 }}>Loading user data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography variant="h6" color="error" gutterBottom>{error}</Typography>
        <Button 
          variant="contained" 
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Back to Users
        </Button>
      </Box>
    );
  }

  if (!user) {
    return <UserNotFound id={id} onBack={handleBack} />;
  }

  // Render the user detail view
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
          {editMode ? (
            <>
              <Button 
                variant="outlined" 
                onClick={handleCancelEdit}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleSaveUser}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <>
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
            </>
          )}
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
        <Typography variant="h6">User Profile</Typography>
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                  <Typography variant="h6">{user.name}</Typography>
                  <Typography variant="body2" color="textSecondary">{user.email}</Typography>
                  <Chip 
                    label={user.role} 
                    color="primary" 
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Typography variant="subtitle1" gutterBottom>User Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">ID</Typography>
                    <Typography variant="body1">{user.id}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Status</Typography>
                    <Typography variant="body1">{user.status}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Role</Typography>
                    <Typography variant="body1">{user.role}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Created</Typography>
                    <Typography variant="body1">{formatDate(user.createdAt)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Last Login</Typography>
                    <Typography variant="body1">{formatDate(user.lastLogin)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Department</Typography>
                    <Typography variant="body1">{user.department || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Position</Typography>
                    <Typography variant="body1">{user.position || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Location</Typography>
                    <Typography variant="body1">{user.location || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6">User Permissions</Typography>
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="body1">Permission management is under development.</Typography>
          </CardContent>
        </Card>
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6">User Activity</Typography>
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="body1">Activity log is under development.</Typography>
          </CardContent>
        </Card>
      </TabPanel>
      
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6">User Settings</Typography>
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="body1">Settings management is under development.</Typography>
          </CardContent>
        </Card>
      </TabPanel>
      
      <TabPanel value={tabValue} index={4}>
        <Typography variant="h6">API Keys</Typography>
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="body1">API key management is under development.</Typography>
          </CardContent>
        </Card>
      </TabPanel>
      
      {error && (
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      )}
      
      {successMessage && (
        <Snackbar 
          open={!!successMessage} 
          autoHideDuration={3000} 
          onClose={() => setSuccessMessage(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default UserDetail; 