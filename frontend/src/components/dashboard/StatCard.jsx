import { Box, Card, CardContent, Typography, CircularProgress } from '@mui/material';

const StatCard = ({ title, value, icon, color, loading }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ 
          backgroundColor: `${color}.dark`, 
          borderRadius: '8px', 
          p: 1,
          mr: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mt: 1 }}>
        {loading ? <CircularProgress size={24} /> : value}
      </Typography>
    </CardContent>
  </Card>
);

export default StatCard;