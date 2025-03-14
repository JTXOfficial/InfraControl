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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel,
  useTheme
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Storage as StorageIcon,
  Language as LanguageIcon,
  Backup as BackupIcon
} from '@mui/icons-material';

// Custom TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
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

const Settings = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    console.log('Refreshing settings...');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          System Settings
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Box>
      
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="settings tabs"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="General" icon={<LanguageIcon />} iconPosition="start" />
            <Tab label="Security" icon={<SecurityIcon />} iconPosition="start" />
            <Tab label="Notifications" icon={<NotificationsIcon />} iconPosition="start" />
            <Tab label="Storage" icon={<StorageIcon />} iconPosition="start" />
            <Tab label="Backup" icon={<BackupIcon />} iconPosition="start" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    System Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="System Name"
                        variant="outlined"
                        size="small"
                        defaultValue="InfraControl"
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Administrator Email"
                        variant="outlined"
                        size="small"
                        defaultValue="admin@example.com"
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth variant="outlined" size="small">
                        <InputLabel>Environment</InputLabel>
                        <Select
                          value="production"
                          label="Environment"
                        >
                          <MenuItem value="development">Development</MenuItem>
                          <MenuItem value="staging">Staging</MenuItem>
                          <MenuItem value="production">Production</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Regional Settings
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                        <InputLabel>Default Timezone</InputLabel>
                        <Select
                          value="UTC"
                          label="Default Timezone"
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
                      <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                        <InputLabel>Default Language</InputLabel>
                        <Select
                          value="en"
                          label="Default Language"
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
                    <Grid item xs={12}>
                      <FormControl fullWidth variant="outlined" size="small">
                        <InputLabel>Date Format</InputLabel>
                        <Select
                          value="MM/DD/YYYY"
                          label="Date Format"
                        >
                          <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                          <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                          <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    UI Settings
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                        <InputLabel>Default Theme</InputLabel>
                        <Select
                          value="dark"
                          label="Default Theme"
                        >
                          <MenuItem value="light">Light</MenuItem>
                          <MenuItem value="dark">Dark</MenuItem>
                          <MenuItem value="system">System Default</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch checked={true} color="primary" />}
                        label="Allow Users to Change Theme"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch checked={true} color="primary" />}
                        label="Enable Animations"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch checked={true} color="primary" />}
                        label="Show Help Tips"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Session Settings
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                        <InputLabel>Session Timeout</InputLabel>
                        <Select
                          value="30"
                          label="Session Timeout"
                        >
                          <MenuItem value="15">15 minutes</MenuItem>
                          <MenuItem value="30">30 minutes</MenuItem>
                          <MenuItem value="60">1 hour</MenuItem>
                          <MenuItem value="120">2 hours</MenuItem>
                          <MenuItem value="240">4 hours</MenuItem>
                          <MenuItem value="480">8 hours</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch checked={true} color="primary" />}
                        label="Remember User Sessions"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch checked={true} color="primary" />}
                        label="Force Re-login After Timeout"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="outlined" sx={{ mr: 2 }}>
                  Reset to Defaults
                </Button>
                <Button variant="contained" color="primary" startIcon={<SaveIcon />}>
                  Save Changes
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Authentication Settings
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch checked={true} color="primary" />}
                        label="Require Strong Passwords"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                        <InputLabel>Password Expiration</InputLabel>
                        <Select
                          value="90"
                          label="Password Expiration"
                        >
                          <MenuItem value="30">30 days</MenuItem>
                          <MenuItem value="60">60 days</MenuItem>
                          <MenuItem value="90">90 days</MenuItem>
                          <MenuItem value="180">180 days</MenuItem>
                          <MenuItem value="365">365 days</MenuItem>
                          <MenuItem value="never">Never</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch checked={true} color="primary" />}
                        label="Enforce Password History (5 passwords)"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch checked={true} color="primary" />}
                        label="Lock Account After Failed Attempts (5 attempts)"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Two-Factor Authentication
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch checked={true} color="primary" />}
                        label="Enable Two-Factor Authentication"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                        <InputLabel>Default 2FA Method</InputLabel>
                        <Select
                          value="app"
                          label="Default 2FA Method"
                        >
                          <MenuItem value="app">Authenticator App</MenuItem>
                          <MenuItem value="sms">SMS</MenuItem>
                          <MenuItem value="email">Email</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch checked={false} color="primary" />}
                        label="Require 2FA for All Users"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch checked={true} color="primary" />}
                        label="Require 2FA for Admin Users"
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
                    API Security
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch checked={true} color="primary" />}
                        label="Enable API Access"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                        <InputLabel>Default API Rate Limit</InputLabel>
                        <Select
                          value="1000"
                          label="Default API Rate Limit"
                        >
                          <MenuItem value="100">100 requests per minute</MenuItem>
                          <MenuItem value="500">500 requests per minute</MenuItem>
                          <MenuItem value="1000">1000 requests per minute</MenuItem>
                          <MenuItem value="5000">5000 requests per minute</MenuItem>
                          <MenuItem value="unlimited">Unlimited</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch checked={true} color="primary" />}
                        label="Require HTTPS for API"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth variant="outlined" size="small">
                        <InputLabel>API Key Expiration</InputLabel>
                        <Select
                          value="365"
                          label="API Key Expiration"
                        >
                          <MenuItem value="30">30 days</MenuItem>
                          <MenuItem value="90">90 days</MenuItem>
                          <MenuItem value="180">180 days</MenuItem>
                          <MenuItem value="365">365 days</MenuItem>
                          <MenuItem value="never">Never</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Security Monitoring
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch checked={true} color="primary" />}
                        label="Log All Authentication Attempts"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch checked={true} color="primary" />}
                        label="Log All API Requests"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch checked={true} color="primary" />}
                        label="Log All Admin Actions"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch checked={true} color="primary" />}
                        label="Alert on Suspicious Activity"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="outlined" sx={{ mr: 2 }}>
                  Reset to Defaults
                </Button>
                <Button variant="contained" color="primary" startIcon={<SaveIcon />}>
                  Save Changes
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Notification Settings
          </Typography>
          <Typography variant="body1" paragraph>
            Configure system-wide notification settings here. Individual user notification preferences can be set in user profiles.
          </Typography>
          
          {/* Notification settings content will be implemented here */}
          <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography>
              Notification settings will be implemented here
            </Typography>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Storage Settings
          </Typography>
          <Typography variant="body1" paragraph>
            Configure storage providers, quotas, and retention policies.
          </Typography>
          
          {/* Storage settings content will be implemented here */}
          <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography>
              Storage settings will be implemented here
            </Typography>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>
            Backup Settings
          </Typography>
          <Typography variant="body1" paragraph>
            Configure system backup schedules, retention policies, and storage locations.
          </Typography>
          
          {/* Backup settings content will be implemented here */}
          <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography>
              Backup settings will be implemented here
            </Typography>
          </Box>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default Settings; 