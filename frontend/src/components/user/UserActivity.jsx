import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Button,
  CircularProgress,
  useTheme
} from '@mui/material';
import { formatDate, formatActivityDate } from '../../utils/userUtils';
import { activityIcons, getActivityColor } from '../../constants/userConstants';

const UserActivity = ({
  recentActivity,
  activityLoading,
  activityHasMore,
  onLoadMore
}) => {
  const theme = useTheme();

  const renderActivityIcon = (type) => {
    const Icon = activityIcons[type] || activityIcons.default;
    return <Icon fontSize="small" />;
  };

  if (recentActivity.length === 0) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <Paper variant="outlined">
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No activity found for this user
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Recent Activity
      </Typography>
      
      <Paper variant="outlined">
        <List disablePadding>
          {recentActivity.map((activity, index) => {
            const activityDate = new Date(activity.timestamp);
            
            // Group activities by date
            const showDateDivider = index === 0 || 
              new Date(recentActivity[index - 1].timestamp).toDateString() !== activityDate.toDateString();
            
            return (
              <Box key={activity.id}>
                {showDateDivider && (
                  <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {formatActivityDate(activity.timestamp)}
                    </Typography>
                  </Box>
                )}
                
                <ListItem 
                  divider={index < recentActivity.length - 1}
                  sx={{ py: 2 }}
                >
                  <ListItemIcon sx={{ 
                    color: getActivityColor(theme, activity.type),
                    minWidth: 40
                  }}>
                    {renderActivityIcon(activity.type)}
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
                onClick={onLoadMore}
                disabled={activityLoading}
                startIcon={activityLoading ? <CircularProgress size={16} /> : null}
              >
                {activityLoading ? 'Loading...' : 'Load More'}
              </Button>
            </Box>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default UserActivity;