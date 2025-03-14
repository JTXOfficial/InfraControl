import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Divider,
  useTheme
} from '@mui/material';
import {
  Storage as StorageIcon,
  Memory as MemoryIcon,
  NetworkCheck as NetworkIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  
  // Mock data - will be replaced with API calls
  const [stats, setStats] = useState({
    instances: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    alerts: 0
  });

  const [instances, setInstances] = useState([]);
  
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setStats({
        instances: 4,
        cpuUsage: 45,
        memoryUsage: 62,
        alerts: 3
      });
      
      setInstances([
        { 
          id: '1', 
          name: 'web-server-01', 
          url: 'https://web01.example.com',
          type: 'web-server', 
          status: 'running',
          project: 'e-commerce',
          zone: 'us-west1-a',
          ip: '10.0.0.1231',
          cpu: 4,
          memory: '8.0 GB',
          disk: '50 GB'
        },
        { 
          id: '2', 
          name: 'web-server-123', 
          url: 'https://web01.example.com',
          type: 'web-server', 
          status: 'running',
          project: 'e-commerce',
          zone: 'us-west1-a',
          ip: '10.0.0.123',
          cpu: 4,
          memory: '8.0 GB',
          disk: '50 GB'
        },
        { 
          id: '3', 
          name: 'test-name', 
          url: 'http://localhost',
          type: 'app-server', 
          status: 'running',
          project: 'test-project',
          zone: 'us-east1-b',
          ip: '127.0.0.1',
          cpu: 1,
          memory: '1.0 GB',
          disk: '10 GB'
        },
        { 
          id: '4', 
          name: 'Unknown', 
          url: '',
          type: 'N/A', 
          status: 'unknown',
          project: 'Default',
          zone: 'Default',
          ip: '10.0.0.123123123',
          cpu: 'N/A',
          memory: 'N/A',
          disk: 'N/A'
        }
      ]);
      
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const StatCard = ({ title, value, icon, color }) => (
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

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'running':
        return 'success';
      case 'stopped':
        return 'error';
      case 'provisioning':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        
        <Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            sx={{ ml: 1 }}
          >
            Add Instance
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Instances" 
            value={stats.instances} 
            icon={<StorageIcon sx={{ color: theme.palette.primary.light }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="CPU Usage" 
            value={`${stats.cpuUsage}%`} 
            icon={<MemoryIcon sx={{ color: theme.palette.info.light }} />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Memory Usage" 
            value={`${stats.memoryUsage}%`} 
            icon={<NetworkIcon sx={{ color: theme.palette.success.light }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Active Alerts" 
            value={stats.alerts} 
            icon={<WarningIcon sx={{ color: theme.palette.warning.light }} />}
            color="warning"
          />
        </Grid>
      </Grid>
      
      <Card sx={{ mb: 4 }}>
        <CardHeader 
          title={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Instances</Typography>
              <IconButton size="small">
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Box>
          }
          sx={{ pb: 0 }}
        />
        <Divider sx={{ mt: 2 }} />
        <TableContainer component={Box}>
          <Table sx={{ minWidth: 650 }} size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Instance</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Zone</TableCell>
                <TableCell>IP</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>CPU</TableCell>
                <TableCell>Memory</TableCell>
                <TableCell>Disk</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : (
                instances.map((instance) => (
                  <TableRow key={instance.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {instance.name}
                        </Typography>
                        {instance.url && (
                          <Typography variant="caption" color="text.secondary" component="div">
                            {instance.url}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{instance.project}</TableCell>
                    <TableCell>{instance.zone}</TableCell>
                    <TableCell>{instance.ip}</TableCell>
                    <TableCell>{instance.type}</TableCell>
                    <TableCell>{instance.cpu}</TableCell>
                    <TableCell>{instance.memory}</TableCell>
                    <TableCell>{instance.disk}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" sx={{ mr: 1 }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Resource Usage" />
            <Divider />
            <CardContent sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {loading ? (
                <CircularProgress />
              ) : (
                <Typography>Chart will be implemented here</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Recent Alerts" />
            <Divider />
            <CardContent>
              {loading ? (
                <CircularProgress />
              ) : (
                stats.alerts > 0 ? (
                  <Typography>Alert list will be implemented here</Typography>
                ) : (
                  <Typography>No active alerts</Typography>
                )
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 