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
  Link
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Instances = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [instances, setInstances] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('All Projects');
  const [selectedZone, setSelectedZone] = useState('All Zones');
  
  const projects = ['Default', 'e-commerce', 'test-project'];
  const zones = ['Default', 'us-west1-a', 'us-east1-b'];

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      const mockInstances = [
        { 
          id: '1', 
          name: 'Unknown', 
          url: '',
          type: 'N/A', 
          status: 'unknown',
          project: 'Default',
          zone: 'Default',
          ip: '10.0.0.123123123',
          stack: 'N/A',
          cpu: 'N/A',
          memory: 'N/A',
          disk: 'N/A'
        },
        { 
          id: '2', 
          name: 'web-server-01', 
          url: 'https://web01.example.com',
          type: 'web-server', 
          status: 'running',
          project: 'e-commerce',
          zone: 'us-west1-a',
          ip: '10.0.0.1231',
          stack: 'LAMP',
          cpu: 4,
          memory: '8.0 GB',
          disk: '50 GB'
        },
        { 
          id: '3', 
          name: 'web-server-123', 
          url: 'https://web01.example.com',
          type: 'web-server', 
          status: 'running',
          project: 'e-commerce',
          zone: 'us-west1-a',
          ip: '10.0.0.123',
          stack: 'LAMP',
          cpu: 4,
          memory: '8.0 GB',
          disk: '50 GB'
        },
        { 
          id: '4', 
          name: 'test-name', 
          url: 'http://localhost',
          type: 'app-server', 
          status: 'running',
          project: 'test-project',
          zone: 'us-east1-b',
          ip: '127.0.0.1',
          stack: 'LAMP',
          cpu: 1,
          memory: '1.0 GB',
          disk: '10 GB'
        }
      ];
      
      setInstances(mockInstances);
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

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
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleAddInstance = () => {
    // Navigate to instance creation page or open modal
    console.log('Add instance clicked');
  };

  const handleEditInstance = (id) => {
    navigate(`/instances/${id}`);
  };

  const handleDeleteInstance = (id) => {
    console.log(`Delete instance ${id}`);
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
              {projects.map(project => (
                <MenuItem key={project} value={project}>{project}</MenuItem>
              ))}
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
              {zones.map(zone => (
                <MenuItem key={zone} value={zone}>{zone}</MenuItem>
              ))}
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
                <TableCell>Project</TableCell>
                <TableCell>Zone</TableCell>
                <TableCell>IP</TableCell>
                <TableCell>Stack</TableCell>
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
                    <TableCell>{instance.project}</TableCell>
                    <TableCell>{instance.zone}</TableCell>
                    <TableCell>{instance.ip}</TableCell>
                    <TableCell>{instance.stack}</TableCell>
                    <TableCell>{instance.type}</TableCell>
                    <TableCell>{instance.cpu}</TableCell>
                    <TableCell>{instance.memory}</TableCell>
                    <TableCell>{instance.disk}</TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        sx={{ mr: 1 }}
                        onClick={() => handleEditInstance(instance.id)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
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