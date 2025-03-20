import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  Switch,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  DateRange as DateRangeIcon,
  Today as TodayIcon,
  LastPage as LastWeekIcon,
  CalendarMonth as CalendarMonthIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Add as AddIcon
} from '@mui/icons-material';

const DashboardHeader = ({
  timeRange,
  autoRefresh,
  autoRefreshInterval,
  refreshing,
  onTimeRangeChange,
  onAutoRefreshChange,
  onIntervalChange,
  onRefresh,
  onAddInstance,
  getTimeRangeLabel
}) => {
  const [timeRangeMenuAnchor, setTimeRangeMenuAnchor] = useState(null);
  const [refreshMenuAnchor, setRefreshMenuAnchor] = useState(null);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h4" component="h1">
        Dashboard
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {/* Time Range Selector */}
        <Button 
          variant="outlined" 
          startIcon={<DateRangeIcon />}
          onClick={(e) => setTimeRangeMenuAnchor(e.currentTarget)}
          sx={{ mr: 1 }}
          size="small"
        >
          {getTimeRangeLabel(timeRange)}
        </Button>
        
        <Menu
          anchorEl={timeRangeMenuAnchor}
          open={Boolean(timeRangeMenuAnchor)}
          onClose={() => setTimeRangeMenuAnchor(null)}
        >
          <MenuItem onClick={() => {
            onTimeRangeChange('24h');
            setTimeRangeMenuAnchor(null);
          }}>
            <ListItemIcon>
              <TodayIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Last 24 Hours</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            onTimeRangeChange('7d');
            setTimeRangeMenuAnchor(null);
          }}>
            <ListItemIcon>
              <LastWeekIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Last 7 Days</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            onTimeRangeChange('30d');
            setTimeRangeMenuAnchor(null);
          }}>
            <ListItemIcon>
              <CalendarMonthIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Last 30 Days</ListItemText>
          </MenuItem>
        </Menu>
        
        {/* Refresh Controls */}
        <Tooltip title="Refresh Settings">
          <IconButton 
            onClick={(e) => setRefreshMenuAnchor(e.currentTarget)}
            sx={{ mr: 1 }}
          >
            <MoreVertIcon />
          </IconButton>
        </Tooltip>
        
        <Menu
          anchorEl={refreshMenuAnchor}
          open={Boolean(refreshMenuAnchor)}
          onClose={() => setRefreshMenuAnchor(null)}
        >
          <MenuItem>
            <FormControlLabel
              control={
                <Switch 
                  checked={autoRefresh} 
                  onChange={onAutoRefreshChange}
                  size="small"
                />
              }
              label="Auto-refresh"
            />
          </MenuItem>
          {autoRefresh && (
            <MenuItem>
              <FormControl size="small" fullWidth>
                <InputLabel id="refresh-interval-label">Interval</InputLabel>
                <Select
                  labelId="refresh-interval-label"
                  value={autoRefreshInterval}
                  label="Interval"
                  onChange={onIntervalChange}
                >
                  <MenuItem value={10}>10 seconds</MenuItem>
                  <MenuItem value={30}>30 seconds</MenuItem>
                  <MenuItem value={60}>1 minute</MenuItem>
                  <MenuItem value={300}>5 minutes</MenuItem>
                </Select>
              </FormControl>
            </MenuItem>
          )}
        </Menu>
        
        <Tooltip title="Refresh Now">
          <IconButton 
            onClick={onRefresh} 
            disabled={refreshing}
            sx={{ mr: 1 }}
          >
            {refreshing ? (
              <CircularProgress size={24} />
            ) : (
              <RefreshIcon />
            )}
          </IconButton>
        </Tooltip>
        
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={onAddInstance}
        >
          Add Instance
        </Button>
      </Box>
    </Box>
  );
};

export default DashboardHeader;