import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Avatar, 
  Chip,
  useTheme 
} from '@mui/material';
import { formatDate, getInitials } from '../../utils/userUtils';

const UserProfile = ({ user, editMode, editedUser }) => {
  const theme = useTheme();

  const renderUserInfo = () => {
    const displayUser = editMode ? editedUser : user;
    
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="textSecondary">ID</Typography>
          <Typography variant="body1">{displayUser.id}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="textSecondary">Status</Typography>
          <Typography variant="body1">{displayUser.status}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="textSecondary">Role</Typography>
          <Typography variant="body1">{displayUser.role}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="textSecondary">Created</Typography>
          <Typography variant="body1">{formatDate(displayUser.createdAt)}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="textSecondary">Last Login</Typography>
          <Typography variant="body1">{formatDate(displayUser.lastLogin)}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="textSecondary">Department</Typography>
          <Typography variant="body1">{displayUser.department || 'N/A'}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="textSecondary">Position</Typography>
          <Typography variant="body1">{displayUser.position || 'N/A'}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="textSecondary">Location</Typography>
          <Typography variant="body1">{displayUser.location || 'N/A'}</Typography>
        </Grid>
      </Grid>
    );
  };

  return (
    <>
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
              {renderUserInfo()}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  );
};

export default UserProfile;