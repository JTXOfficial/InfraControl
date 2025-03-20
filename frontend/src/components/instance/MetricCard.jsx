import React from 'react';
import { Box, Card, CardContent, Typography, LinearProgress, Avatar } from '@mui/material';
import { alpha } from '@mui/material/styles';

/**
 * MetricCard component for displaying instance metrics
 * 
 * @param {Object} props
 * @param {string} props.title - Metric name
 * @param {string} props.value - Metric value formatted as string
 * @param {React.ReactNode} props.icon - Icon to display
 * @param {string} props.color - Color for the icon and progress bar
 * @param {number} props.progress - Progress value (0-100)
 * @returns {JSX.Element}
 */
const MetricCard = ({ title, value, icon, color = '#1976d2', progress = 0 }) => {
  // Calculate progress color based on value
  const getProgressColor = (progress) => {
    if (progress >= 90) return '#f44336'; // Red for critical
    if (progress >= 70) return '#ff9800'; // Orange for warning
    return color; // Default color for normal
  };

  const progressColor = getProgressColor(progress);

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar
            sx={{
              bgcolor: alpha(color, 0.1),
              color: color,
              mr: 2,
              width: 40,
              height: 40
            }}
          >
            {icon}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h6" component="div">
              {value}
            </Typography>
          </Box>
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.min(progress, 100)}
          sx={{ 
            mt: 1, 
            height: 8, 
            borderRadius: 4,
            bgcolor: alpha(progressColor, 0.15),
            '& .MuiLinearProgress-bar': {
              bgcolor: progressColor
            }
          }}
        />
      </CardContent>
    </Card>
  );
};

export default MetricCard; 