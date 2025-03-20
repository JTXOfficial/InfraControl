import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Divider,
  Badge,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  Warning as WarningIcon
} from '@mui/icons-material';

const AlertsPanel = ({
  loading,
  alerts,
  getSeverityColor,
  formatTimestamp
}) => {
  const theme = useTheme();

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader 
        title={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Recent Alerts</Typography>
            <Badge badgeContent={alerts.length} color="error">
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
          alerts.length > 0 ? (
            <Box>
              {alerts.map(alert => (
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
  );
};

export default AlertsPanel;