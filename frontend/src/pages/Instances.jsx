import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Divider,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  Link,
  Chip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  OpenInNew as OpenInNewIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  RestartAlt as RestartAltIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pending as PendingIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import instanceService from '../services/instanceService';
import projectService from '../services/projectService';
import zoneService from '../services/zoneService';

const Instances = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [instances, setInstances] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('All Projects');
  const [selectedZone, setSelectedZone] = useState('All Zones');
  const [projects, setProjects] = useState([]);
  const [zones, setZones] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingZones, setLoadingZones] = useState(false);

  useEffect(() => {
    fetchInstances();
    fetchProjects();
    fetchZones();
  }, []);

  const fetchInstances = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (selectedProject !== 'All Projects') {
        filters.project = selectedProject;
      }
      if (selectedZone !== 'All Zones') {
        filters.zone = selectedZone;
      }
      
      const data = await instanceService.getAllInstances(filters);
      setInstances(data);
    } catch (error) {
      console.error('Error fetching instances:', error);
      // Show error notification or message to user
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const projectsData = await projectService.getAllProjects({ status: 'active' });
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchZones = async () => {
    try {
      setLoadingZones(true);
      const zonesData = await zoneService.getAllZones({ status: 'active' });
      setZones(zonesData);
    } catch (error) {
      console.error('Error fetching zones:', error);
    } finally {
      setLoadingZones(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleProjectChange = (event) => {
    setSelectedProject(event.target.value);
  };

  const handleZoneChange = (event) => {
    setSelectedZone(event.target.value);
  };

  const handleRefresh = () => {
    fetchInstances();
  };

  const handleAddInstance = () => {
    // Navigate to instance creation page
    navigate('/instances/create');
  };

  const handleEditInstance = (id) => {
    navigate(`/instances/${id}`);
  };

  const handleDeleteInstance = async (id) => {
    if (window.confirm('Are you sure you want to delete this instance?')) {
      try {
        const response = await fetch(`/api/instances/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          fetchInstances();
        } else {
          console.error('Failed to delete instance');
        }
      } catch (error) {
        console.error('Error deleting instance:', error);
      }
    }
  };
  
  const handleStartInstance = async (id) => {
    try {
      setLoading(true);
      await instanceService.startInstance(id);
      fetchInstances();
    } catch (error) {
      console.error('Error starting instance:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStopInstance = async (id) => {
    try {
      setLoading(true);
      await instanceService.stopInstance(id);
      fetchInstances();
    } catch (error) {
      console.error('Error stopping instance:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRestartInstance = async (id) => {
    try {
      setLoading(true);
      
      // Find the instance to restart
      const instanceToRestart = instances.find(instance => instance.id === id);
      if (!instanceToRestart) {
        throw new Error('Instance not found');
      }
      
      // Check if this is a KVM instance (provider is SELFHOSTED)
      const isKvm = instanceToRestart.provider === 'SELFHOSTED';
      
      // Update local state first to show immediate feedback
      const updatedInstances = instances.map(instance => {
        if (instance.id === id) {
          return { ...instance, status: 'restarting' };
        }
        return instance;
      });
      setInstances(updatedInstances);
      
      // Call the API to restart the instance
      await instanceService.restartInstance(id);
      
      // Set up polling to check status
      let pollingCount = 0;
      const maxPolls = isKvm ? 40 : 20; // More polling attempts for KVM VMs
      const pollInterval = isKvm ? 5000 : 3000; // Longer interval for KVM VMs
      const initialDelay = isKvm ? 15000 : 3000; // Longer initial delay for KVM VMs
      
      const checkRestartStatus = async () => {
        if (pollingCount >= maxPolls) {
          console.log(`Maximum polling attempts (${maxPolls}) reached for instance ${id}`);
          fetchInstances(); // Final fetch to get the latest state
          return;
        }
        
        try {
          pollingCount++;
          const instanceData = await instanceService.getInstanceById(id);
          
          // Update our local instances with the fetched instance data
          const updatedInstances = instances.map(instance => {
            if (instance.id === id) {
              return { ...instance, status: instanceData.status };
            }
            return instance;
          });
          setInstances(updatedInstances);
          
          console.log(`Poll ${pollingCount}/${maxPolls} for instance ${id}: status = ${instanceData.status}`);
          
          // If instance is still restarting, poll again
          if (instanceData.status === 'restarting') {
            setTimeout(checkRestartStatus, pollInterval);
          } else {
            console.log(`Instance ${id} restart complete, status: ${instanceData.status}`);
            fetchInstances(); // Refresh all instances to ensure data consistency
          }
        } catch (pollError) {
          console.error(`Error polling instance status during restart: ${pollError}`);
          // For intermittent errors, continue polling unless we've reached our limit
          if (pollingCount < maxPolls) {
            setTimeout(checkRestartStatus, pollInterval);
          } else {
            fetchInstances(); // Give up and just refresh all instances
          }
        }
      };
      
      // Start polling after a delay to allow the restart to begin
      console.log(`Waiting ${initialDelay}ms before starting status polls for instance ${id}`);
      setTimeout(checkRestartStatus, initialDelay);
      
    } catch (error) {
      console.error('Error restarting instance:', error);
      // Refresh the instances list to get current status
      fetchInstances();
    } finally {
      setLoading(false);
    }
  };

  // Filter instances based on search query and selected filters
  const filteredInstances = instances.filter(instance => {
    const matchesSearch = 
      searchQuery === '' || 
      instance.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instance.ip.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProject = 
      selectedProject === 'All Projects' || 
      instance.project === selectedProject;
    
    const matchesZone = 
      selectedZone === 'All Zones' || 
      instance.zone === selectedZone;
    
    return matchesSearch && matchesProject && matchesZone;
  });

  // Helper function to get status chip color and icon
  const getStatusChip = (status) => {
    let color = 'default';
    let icon = null;
    let label = status;
    
    switch(status.toLowerCase()) {
      case 'running':
        color = 'success';
        icon = <CheckCircleIcon fontSize="small" />;
        break;
      case 'stopped':
        color = 'error';
        icon = <StopIcon fontSize="small" />;
        break;
      case 'restarting':
        color = 'warning';
        icon = <RestartAltIcon fontSize="small" />;
        break;
      case 'starting':
        color = 'info';
        icon = <PlayArrowIcon fontSize="small" />;
        break;
      case 'stopping':
        color = 'warning';
        icon = <StopIcon fontSize="small" />;
        break;
      case 'provisioning':
        color = 'info';
        icon = <PendingIcon fontSize="small" />;
        break;
      case 'failed':
        color = 'error';
        icon = <ErrorIcon fontSize="small" />;
        break;
      default:
        color = 'default';
        icon = <PendingIcon fontSize="small" />;
    }
    
    return (
      <Chip 
        size="small" 
        color={color} 
        icon={icon} 
        label={label} 
        sx={{ textTransform: 'capitalize' }}
      />
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Instances
        </Typography>
        
        <Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAddInstance}
          >
            Add Instance
          </Button>
        </Box>
      </Box>
      
      <Card>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            placeholder="Search instances or IP..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ flexGrow: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="project-select-label">Project</InputLabel>
            <Select
              labelId="project-select-label"
              id="project-select"
              value={selectedProject}
              label="Project"
              onChange={handleProjectChange}
            >
              <MenuItem value="All Projects">All Projects</MenuItem>
              {loadingProjects ? (
                <MenuItem disabled>Loading projects...</MenuItem>
              ) : (
                projects.map(project => (
                  <MenuItem key={project.id} value={project.id.toString()}>{project.name}</MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="zone-select-label">Zone</InputLabel>
            <Select
              labelId="zone-select-label"
              id="zone-select"
              value={selectedZone}
              label="Zone"
              onChange={handleZoneChange}
            >
              <MenuItem value="All Zones">All Zones</MenuItem>
              {loadingZones ? (
                <MenuItem disabled>Loading zones...</MenuItem>
              ) : (
                zones.map(zone => (
                  <MenuItem key={zone.id} value={zone.regionCode}>{zone.name} ({zone.regionCode})</MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          
          <IconButton onClick={handleRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
        
        <Divider />
        
        <TableContainer>
          <Table sx={{ minWidth: 650 }} size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Instance</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Zone</TableCell>
                <TableCell>IP</TableCell>
                <TableCell>Stack</TableCell>
                <TableCell>CPU</TableCell>
                <TableCell>Memory</TableCell>
                <TableCell>Disk</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : filteredInstances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      No instances found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredInstances.map((instance) => (
                  <TableRow key={instance.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {instance.name}
                        </Typography>
                        {instance.url && (
                          <Typography variant="caption" color="text.secondary" component="div">
                            <Link href={instance.url} target="_blank" color="primary" underline="hover">
                              {instance.url}
                            </Link>
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{getStatusChip(instance.status)}</TableCell>
                    <TableCell>{instance.projectName || instance.project}</TableCell>
                    <TableCell>{instance.zone}</TableCell>
                    <TableCell>{instance.ip}</TableCell>
                    <TableCell>{instance.stack}</TableCell>
                    <TableCell>{instance.cpu}</TableCell>
                    <TableCell>{instance.memory}</TableCell>
                    <TableCell>{instance.disk}</TableCell>
                    <TableCell align="right">
                      {/* Instance control buttons based on status */}
                      {instance.status.toLowerCase() === 'stopped' && (
                        <IconButton 
                          size="small" 
                          color="success"
                          title="Start Instance"
                          onClick={() => handleStartInstance(instance.id)}
                          sx={{ mr: 1 }}
                          disabled={instance.status.toLowerCase() === 'starting'}
                        >
                          <PlayArrowIcon fontSize="small" />
                        </IconButton>
                      )}
                      
                      {instance.status.toLowerCase() === 'running' && (
                        <>
                          <IconButton 
                            size="small" 
                            color="warning"
                            title="Restart Instance"
                            onClick={() => handleRestartInstance(instance.id)}
                            sx={{ mr: 1 }}
                            disabled={instance.status.toLowerCase() === 'restarting' || instance.status.toLowerCase() === 'stopping'}
                          >
                            <RestartAltIcon fontSize="small" />
                          </IconButton>
                          
                          <IconButton 
                            size="small" 
                            color="error"
                            title="Stop Instance"
                            onClick={() => handleStopInstance(instance.id)}
                            sx={{ mr: 1 }}
                            disabled={instance.status.toLowerCase() === 'stopping' || instance.status.toLowerCase() === 'restarting'}
                          >
                            <StopIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                      
                      {/* Edit and Delete buttons */}
                      <IconButton 
                        size="small" 
                        sx={{ mr: 1 }}
                        title="Edit Instance"
                        onClick={() => handleEditInstance(instance.id)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        title="Delete Instance"
                        onClick={() => handleDeleteInstance(instance.id)}
                      >
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
    </Box>
  );
};

export default Instances; 