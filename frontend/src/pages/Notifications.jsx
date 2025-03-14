import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid,
  Divider,
  Button,
  Tabs,
  Tab,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  useTheme
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  DeleteSweep as ClearAllIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Settings as SettingsIcon,
  MarkEmailRead as MarkReadIcon
} from '@mui/icons-material';

// Custom TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`notifications-tabpanel-${index}`}
      aria-labelledby={`notifications-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Notifications = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    console.log('Refreshing notifications...');
  };

  const handleMarkAllRead = () => {
    console.log('Marking all notifications as read...');
  };

  const handleClearAll = () => {
    console.log('Clearing all notifications...');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'success':
        return <SuccessIcon color="success" />;
      case 'info':
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'error':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'success':
        return theme.palette.success.main;
      case 'info':
      default:
        return theme.palette.info.main;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // Sample notifications data
  const allNotifications = [
    { id: 1, type: 'error', title: 'Instance Failure', message: 'Instance i-12345 has failed health checks.', timestamp: '2024-03-14T01:45:22', read: false },
    { id: 2, type: 'warning', title: 'High CPU Usage', message: 'Instance i-67890 is experiencing high CPU usage (95%).', timestamp: '2024-03-14T00:30:15', read: false },
    { id: 3, type: 'success', title: 'Backup Completed', message: 'Backup for instance i-12345 completed successfully.', timestamp: '2024-03-13T22:15:10', read: true },
    { id: 4, type: 'info', title: 'Maintenance Scheduled', message: 'System maintenance scheduled for March 15, 2024 at 02:00 UTC.', timestamp: '2024-03-13T18:20:05', read: false },
    { id: 5, type: 'warning', title: 'Disk Space Low', message: 'Instance i-54321 is running low on disk space (85% used).', timestamp: '2024-03-13T15:10:30', read: true },
    { id: 6, type: 'error', title: 'API Rate Limit Exceeded', message: 'API rate limit exceeded for user john.doe@example.com.', timestamp: '2024-03-13T12:05:45', read: true },
    { id: 7, type: 'success', title: 'Instance Created', message: 'New instance i-98765 created successfully.', timestamp: '2024-03-13T10:30:20', read: true },
    { id: 8, type: 'info', title: 'User Login', message: 'User jane.smith@example.com logged in from a new device.', timestamp: '2024-03-13T08:15:10', read: true },
    { id: 9, type: 'warning', title: 'Certificate Expiring', message: 'SSL certificate for api.example.com will expire in 7 days.', timestamp: '2024-03-12T22:45:30', read: true },
    { id: 10, type: 'error', title: 'Database Connection Failed', message: 'Failed to connect to database server db-prod-01.', timestamp: '2024-03-12T20:10:15', read: true },
    { id: 11, type: 'success', title: 'System Update Completed', message: 'System update to version 2.5.0 completed successfully.', timestamp: '2024-03-12T18:30:45', read: true },
    { id: 12, type: 'info', title: 'New Feature Available', message: 'New feature "Automated Scaling" is now available.', timestamp: '2024-03-12T15:20:10', read: true },
  ];

  const unreadNotifications = allNotifications.filter(notification => !notification.read);
  const errorNotifications = allNotifications.filter(notification => notification.type === 'error');
  const warningNotifications = allNotifications.filter(notification => notification.type === 'warning');
  const infoNotifications = allNotifications.filter(notification => notification.type === 'info');
  const successNotifications = allNotifications.filter(notification => notification.type === 'success');

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Notifications
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<MarkReadIcon />}
            onClick={handleMarkAllRead}
            sx={{ mr: 1 }}
          >
            Mark All Read
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<ClearAllIcon />}
            onClick={handleClearAll}
            sx={{ mr: 1 }}
          >
            Clear All
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="notification tabs"
                textColor="primary"
                indicatorColor="primary"
              >
                <Tab label="All" />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      Unread
                      <Chip 
                        label={unreadNotifications.length} 
                        size="small" 
                        sx={{ ml: 1, height: 20, minWidth: 20 }}
                      />
                    </Box>
                  } 
                />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      Errors
                      <Chip 
                        label={errorNotifications.length} 
                        size="small" 
                        color="error"
                        sx={{ ml: 1, height: 20, minWidth: 20 }}
                      />
                    </Box>
                  } 
                />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      Warnings
                      <Chip 
                        label={warningNotifications.length} 
                        size="small" 
                        color="warning"
                        sx={{ ml: 1, height: 20, minWidth: 20 }}
                      />
                    </Box>
                  } 
                />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <List sx={{ width: '100%' }}>
                {allNotifications.map((notification) => (
                  <ListItem
                    key={notification.id}
                    alignItems="flex-start"
                    sx={{ 
                      borderLeft: notification.read ? 'none' : `4px solid ${getNotificationColor(notification.type)}`,
                      bgcolor: notification.read ? 'transparent' : `${getNotificationColor(notification.type)}10`,
                      mb: 1,
                      borderRadius: 1
                    }}
                  >
                    <ListItemIcon>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" component="span" sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" component="span" color="text.primary" sx={{ display: 'block' }}>
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(notification.timestamp)}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="delete">
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <List sx={{ width: '100%' }}>
                {unreadNotifications.length > 0 ? (
                  unreadNotifications.map((notification) => (
                    <ListItem
                      key={notification.id}
                      alignItems="flex-start"
                      sx={{ 
                        borderLeft: `4px solid ${getNotificationColor(notification.type)}`,
                        bgcolor: `${getNotificationColor(notification.type)}10`,
                        mb: 1,
                        borderRadius: 1
                      }}
                    >
                      <ListItemIcon>
                        {getNotificationIcon(notification.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" component="span" sx={{ fontWeight: 'bold' }}>
                            {notification.title}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span" color="text.primary" sx={{ display: 'block' }}>
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(notification.timestamp)}
                            </Typography>
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="delete">
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                    <Typography variant="body1" color="text.secondary">
                      No unread notifications
                    </Typography>
                  </Box>
                )}
              </List>
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <List sx={{ width: '100%' }}>
                {errorNotifications.length > 0 ? (
                  errorNotifications.map((notification) => (
                    <ListItem
                      key={notification.id}
                      alignItems="flex-start"
                      sx={{ 
                        borderLeft: notification.read ? 'none' : `4px solid ${getNotificationColor(notification.type)}`,
                        bgcolor: notification.read ? 'transparent' : `${getNotificationColor(notification.type)}10`,
                        mb: 1,
                        borderRadius: 1
                      }}
                    >
                      <ListItemIcon>
                        {getNotificationIcon(notification.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" component="span" sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                            {notification.title}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span" color="text.primary" sx={{ display: 'block' }}>
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(notification.timestamp)}
                            </Typography>
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="delete">
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                    <Typography variant="body1" color="text.secondary">
                      No error notifications
                    </Typography>
                  </Box>
                )}
              </List>
            </TabPanel>
            
            <TabPanel value={tabValue} index={3}>
              <List sx={{ width: '100%' }}>
                {warningNotifications.length > 0 ? (
                  warningNotifications.map((notification) => (
                    <ListItem
                      key={notification.id}
                      alignItems="flex-start"
                      sx={{ 
                        borderLeft: notification.read ? 'none' : `4px solid ${getNotificationColor(notification.type)}`,
                        bgcolor: notification.read ? 'transparent' : `${getNotificationColor(notification.type)}10`,
                        mb: 1,
                        borderRadius: 1
                      }}
                    >
                      <ListItemIcon>
                        {getNotificationIcon(notification.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" component="span" sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                            {notification.title}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span" color="text.primary" sx={{ display: 'block' }}>
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(notification.timestamp)}
                            </Typography>
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="delete">
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                    <Typography variant="body1" color="text.secondary">
                      No warning notifications
                    </Typography>
                  </Box>
                )}
              </List>
            </TabPanel>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Notification Settings
                </Typography>
                <IconButton>
                  <SettingsIcon />
                </IconButton>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <List disablePadding>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <FormControlLabel
                    control={<Switch checked={true} color="primary" />}
                    label="Email Notifications"
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <FormControlLabel
                    control={<Switch checked={true} color="primary" />}
                    label="Browser Notifications"
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <FormControlLabel
                    control={<Switch checked={false} color="primary" />}
                    label="SMS Notifications"
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <FormControlLabel
                    control={<Switch checked={true} color="primary" />}
                    label="Slack Notifications"
                  />
                </ListItem>
              </List>
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Notification Types
              </Typography>
              <List disablePadding>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <FormControlLabel
                    control={<Switch checked={true} color="error" />}
                    label="Errors"
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <FormControlLabel
                    control={<Switch checked={true} color="warning" />}
                    label="Warnings"
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <FormControlLabel
                    control={<Switch checked={true} color="info" />}
                    label="Information"
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <FormControlLabel
                    control={<Switch checked={false} color="success" />}
                    label="Success"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card variant="outlined" sx={{ bgcolor: theme.palette.error.main + '20', textAlign: 'center', p: 2 }}>
                    <ErrorIcon color="error" sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="h4">{errorNotifications.length}</Typography>
                    <Typography variant="body2">Errors</Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined" sx={{ bgcolor: theme.palette.warning.main + '20', textAlign: 'center', p: 2 }}>
                    <WarningIcon color="warning" sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="h4">{warningNotifications.length}</Typography>
                    <Typography variant="body2">Warnings</Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined" sx={{ bgcolor: theme.palette.info.main + '20', textAlign: 'center', p: 2 }}>
                    <InfoIcon color="info" sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="h4">{infoNotifications.length}</Typography>
                    <Typography variant="body2">Information</Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined" sx={{ bgcolor: theme.palette.success.main + '20', textAlign: 'center', p: 2 }}>
                    <SuccessIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="h4">{successNotifications.length}</Typography>
                    <Typography variant="body2">Success</Typography>
                  </Card>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Notification Retention
                </Typography>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Retention Period</InputLabel>
                  <Select
                    value="30"
                    label="Retention Period"
                  >
                    <MenuItem value="7">7 days</MenuItem>
                    <MenuItem value="14">14 days</MenuItem>
                    <MenuItem value="30">30 days</MenuItem>
                    <MenuItem value="90">90 days</MenuItem>
                    <MenuItem value="180">180 days</MenuItem>
                    <MenuItem value="365">365 days</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Notifications; 