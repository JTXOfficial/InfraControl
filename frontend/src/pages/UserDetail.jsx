import { 
  Box, 
  Typography, 
  IconButton, 
  Button, 
  Tabs, 
  Tab, 
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme
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
  VpnKey as ApiKeyIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';

import TabPanel from '../components/user/TabPanel';
import UserNotFound from '../components/user/UserNotFound';
import UserProfile from '../components/user/UserProfile';
import UserPermissions from '../components/user/UserPermissions';
import UserActivity from '../components/user/UserActivity';
import useUserDetail from '../hooks/useUserDetail';

const UserDetail = () => {
  const theme = useTheme();
  const { id } = useParams();
  const {
    // State
    loading,
    user,
    error,
    successMessage,
    editMode,
    editedUser,
    tabValue,
    userPermissions,
    selectedRole,
    isCustomRole,
    permissionChanged,
    recentActivity,
    activityLoading,
    activityHasMore,
    
    // Handlers
    handleTabChange,
    handleBack,
    handleRefresh,
    handleEditUser,
    handleCancelEdit,
    handleSaveUser,
    handleDeleteUser,
    handleRoleChange,
    handlePermissionToggle,
    handleLoadMoreActivity,
    
    // Setters
    setError,
    setSuccessMessage
  } = useUserDetail(id);

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
        <UserProfile 
          user={user}
          editMode={editMode}
          editedUser={editedUser}
        />
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <UserPermissions
          selectedRole={selectedRole}
          isCustomRole={isCustomRole}
          userPermissions={userPermissions}
          permissionChanged={permissionChanged}
          onRoleChange={handleRoleChange}
          onPermissionToggle={handlePermissionToggle}
          onSavePermissions={() => {
            // TODO: Implement API call to save permissions
            console.log('Saving permissions:', {
              userId: id,
              role: selectedRole,
              permissions: userPermissions
            });
          }}
        />
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <UserActivity
          recentActivity={recentActivity}
          activityLoading={activityLoading}
          activityHasMore={activityHasMore}
          onLoadMore={handleLoadMoreActivity}
        />
      </TabPanel>
      
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6">User Settings</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>Settings management is under development.</Typography>
      </TabPanel>
      
      <TabPanel value={tabValue} index={4}>
        <Typography variant="h6">API Keys</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>API key management is under development.</Typography>
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