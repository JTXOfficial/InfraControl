import { Box, Typography, Card, CardContent, CardHeader, CircularProgress, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useState, useEffect } from 'react';

const ResourceUsageChart = ({ data, timeRange, loading, stats }) => {
  const theme = useTheme();
  const [chartData, setChartData] = useState([]);

  // Ensure chart data aligns with the current stats
  useEffect(() => {
    if (!data || data.length === 0) {
      setChartData([]);
      return;
    }

    // Check if the most recent data point matches the stats
    const lastDataPoint = data[data.length - 1];
    
    if (stats && lastDataPoint) {
      // If stats exist but don't match the latest data point, adjust the data
      if (Math.abs(lastDataPoint.cpu - stats.cpuUsage) > 5 || 
          Math.abs(lastDataPoint.memory - stats.memoryUsage) > 5) {
        
        console.log('Adjusting chart data to match current stats');
        
        // Create a copy of the data and adjust the last point to match current stats
        const updatedData = [...data];
        updatedData[updatedData.length - 1] = {
          ...lastDataPoint,
          cpu: stats.cpuUsage,
          memory: stats.memoryUsage,
          disk: stats.diskUsage || lastDataPoint.disk
        };
        
        setChartData(updatedData);
      } else {
        // Data is consistent, use as is
        setChartData(data);
      }
    } else {
      // No stats to compare with, use data as is
      setChartData(data);
    }
  }, [data, stats]);

  const getTimeRangeLabel = () => {
    switch(timeRange) {
      case '24h':
        return 'Last 24 Hours';
      case '7d':
        return 'Last 7 Days';
      case '30d':
        return 'Last 30 Days';
      case 'custom':
        return 'Custom Range';
      default:
        return 'Last 7 Days';
    }
  };

  // Calculate average usage
  const getAverageUsage = () => {
    if (!chartData || chartData.length === 0) return { cpu: 0, memory: 0, disk: 0 };
    
    const sum = chartData.reduce(
      (acc, item) => ({
        cpu: acc.cpu + (item.cpu || 0),
        memory: acc.memory + (item.memory || 0),
        disk: acc.disk + (item.disk || 0)
      }),
      { cpu: 0, memory: 0, disk: 0 }
    );
    
    const count = chartData.length;
    return {
      cpu: Math.round(sum.cpu / count),
      memory: Math.round(sum.memory / count),
      disk: Math.round(sum.disk / count)
    };
  };

  const averageUsage = getAverageUsage();
  
  // Get the most recent data point
  const getCurrentUsage = () => {
    if (!chartData || chartData.length === 0) {
      return stats ? {
        cpu: stats.cpuUsage || 0,
        memory: stats.memoryUsage || 0,
        disk: stats.diskUsage || 0
      } : { cpu: 0, memory: 0, disk: 0 };
    }
    return chartData[chartData.length - 1];
  };
  
  const currentUsage = getCurrentUsage();

  // Format timestamp for tooltip
  const formatTooltipDate = (label) => {
    return label;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ 
          bgcolor: 'background.paper', 
          p: 2, 
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          boxShadow: theme.shadows[2]
        }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {formatTooltipDate(label)}
          </Typography>
          {payload.map((entry, index) => (
            <Box key={`item-${index}`} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Box 
                sx={{ 
                  width: 12, 
                  height: 12, 
                  backgroundColor: entry.color,
                  mr: 1,
                  borderRadius: '50%'
                }} 
              />
              <Typography variant="body2" sx={{ mr: 1 }}>
                {entry.name}:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {entry.value}%
              </Typography>
            </Box>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader 
        title={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Resource Usage</Typography>
            <Typography variant="body2" color="text.secondary">
              {getTimeRangeLabel()}
            </Typography>
          </Box>
        } 
      />
      <Divider />
      <CardContent sx={{ height: 300 }}>
        {loading ? (
          <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : chartData.length === 0 ? (
          <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No resource usage data available
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis unit="%" domain={[0, 100]} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="cpu" 
                name="CPU Usage" 
                stackId="1" 
                stroke={theme.palette.info.main} 
                fill={theme.palette.info.light} 
              />
              <Area 
                type="monotone" 
                dataKey="memory" 
                name="Memory Usage" 
                stackId="2" 
                stroke={theme.palette.success.main} 
                fill={theme.palette.success.light} 
              />
              <Area 
                type="monotone" 
                dataKey="disk" 
                name="Disk Usage" 
                stackId="3" 
                stroke={theme.palette.warning.main} 
                fill={theme.palette.warning.light} 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
      <Box px={2} pb={2}>
        <Typography variant="body2" color="text.secondary">
          Current Usage: CPU {currentUsage.cpu}% | Memory {currentUsage.memory}% | Disk {currentUsage.disk}%
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Average Usage: CPU {averageUsage.cpu}% | Memory {averageUsage.memory}% | Disk {averageUsage.disk}%
        </Typography>
      </Box>
    </Card>
  );
};

export default ResourceUsageChart; 