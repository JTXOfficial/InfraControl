import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  Paper,
  IconButton,
  useTheme,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CloudUpload as CloudUploadIcon,
  Storage as StorageIcon,
  Memory as MemoryIcon,
  NetworkCheck as NetworkIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import instanceService from '../services/instanceService';
import projectService from '../services/projectService';
import zoneService from '../services/zoneService';

const steps = ['Basic Information', 'Resources', 'Network', 'Storage', 'Review'];

const InstanceCreate = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    project: '',
    zone: '',
    cpuCount: 1,
    memorySize: 1,
    imageId: 'ami-ubuntu-20.04',
    vpc: 'vpc-default',
    subnet: 'subnet-default',
    securityGroup: 'sg-default',
    rootVolumeSize: '50',
    rootVolumeType: 'gp2',
    additionalVolumes: []
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [zones, setZones] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingZones, setLoadingZones] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch projects and zones on component mount
  useEffect(() => {
    fetchProjects();
    fetchZones();
  }, []);

  // Set default project and zone once data is loaded
  useEffect(() => {
    if (projects.length > 0 && !formData.project) {
      setFormData(prev => ({
        ...prev,
        project: projects[0].id.toString()
      }));
    }
  }, [projects]);

  useEffect(() => {
    if (zones.length > 0 && !formData.zone) {
      setFormData(prev => ({
        ...prev,
        zone: zones[0].regionCode
      }));
    }
  }, [zones]);

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const projectsData = await projectService.getAllProjects({ status: 'active' });
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load projects',
        severity: 'error'
      });
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
      setSnackbar({
        open: true,
        message: 'Failed to load zones',
        severity: 'error'
      });
    } finally {
      setLoadingZones(false);
    }
  };

  const handleBack = () => {
    navigate('/instances');
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handlePrevious = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateStep = (step) => {
    let isValid = true;
    const newErrors = {};

    if (step === 0) {
      if (!formData.name.trim()) {
        newErrors.name = 'Instance name is required';
        isValid = false;
      } else if (formData.name.length < 3) {
        newErrors.name = 'Instance name must be at least 3 characters';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Find the selected project
      const selectedProject = projects.find(p => p.id.toString() === formData.project);
      if (!selectedProject) {
        throw new Error('Project not found');
      }
      
      // Show initial provisioning message
      setSnackbar({
        open: true,
        message: 'Starting instance provisioning...',
        severity: 'info'
      });
      
      // Find the selected zone
      const selectedZone = zones.find(z => z.regionCode === formData.zone);
      if (!selectedZone) {
        throw new Error('Zone not found');
      }
      
      // Determine provider based on zone
      const provider = selectedZone.provider;
      
      // Handle self-hosted machines differently
      if (provider === 'SelfHosted') {
        // Validate that the zone has an IP address
        if (!selectedZone.ipAddress) {
          setSnackbar({
            open: true,
            message: 'The selected self-hosted zone does not have an IP address configured. Please edit the zone to add connection details.',
            severity: 'error'
          });
          setLoading(false);
          return;
        }
        
        // Create instance data object for self-hosted machine
        const instanceData = {
          name: formData.name,
          project: selectedProject.id,
          zone: selectedZone.regionCode,
          provider: 'SelfHosted',
          type: 'vm',
          cpu: parseInt(formData.cpuCount, 10),
          memory: parseInt(formData.memorySize, 10),
          disk: parseInt(formData.rootVolumeSize, 10),
          image: formData.imageId,
          ip_address: selectedZone.ipAddress,
          config: {
            project: selectedProject.id,
            projectName: selectedProject.name,
            sshUser: selectedZone.sshUser || 'admin',
            sshPort: selectedZone.sshPort || 22,
            isSelfHosted: true,
            vpc: formData.vpc,
            subnet: formData.subnet,
            security_group: formData.securityGroup,
            volume_type: formData.rootVolumeType
          }
        };
        
        // Update snackbar to show we're validating the self-hosted machine
        setSnackbar({
          open: true,
          message: `Validating connection to self-hosted machine at ${selectedZone.ipAddress}...`,
          severity: 'info'
        });
        
        // Call API to create instance
        const response = await fetch('/api/instances', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(instanceData),
        });
        
        const responseData = await response.json();
        
        if (!response.ok) {
          throw new Error(responseData.message || 'Failed to add self-hosted machine');
        }
        
        // Show success message
        setSnackbar({
          open: true,
          message: 'Self-hosted machine added successfully!',
          severity: 'success',
        });
        
        // Navigate back to instances list after a delay
        setTimeout(() => {
          navigate('/instances');
        }, 2000);
        
        return;
      }
      
      // For cloud providers, continue with normal flow
      if (!selectedZone) {
        throw new Error('Zone not found');
      }
      
      // Update snackbar to show we're validating credentials
      setSnackbar({
        open: true,
        message: `Validating ${provider} credentials...`,
        severity: 'info'
      });
      
      // Create instance data object
      const instanceData = {
        name: formData.name,
        project: selectedProject.id,
        zone: selectedZone.regionCode,
        provider: provider,
        type: 'vm', // Default type
        cpu: parseInt(formData.cpuCount, 10),
        memory: parseInt(formData.memorySize, 10),
        disk: parseInt(formData.rootVolumeSize, 10),
        image: formData.imageId,
        vpc: formData.vpc,
        subnet: formData.subnet,
        security_group: formData.securityGroup,
        volume_type: formData.rootVolumeType
      };
      
      // Call API to create instance
      const response = await fetch('/api/instances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(instanceData),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        // Check if this is a credential validation error
        if (responseData.errorType === 'credential_validation') {
          throw new Error(`Cloud provider error: ${responseData.message}`);
        }
        throw new Error(responseData.message || 'Failed to create instance');
      }
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Instance created successfully!',
        severity: 'success',
      });
      
      // Navigate back to instances list after a delay
      setTimeout(() => {
        navigate('/instances');
      }, 2000);
    } catch (error) {
      console.error('Error creating instance:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Instance Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Project</InputLabel>
                {loadingProjects ? (
                  <CircularProgress size={24} sx={{ mt: 2, ml: 2 }} />
                ) : (
                  <Select
                    name="project"
                    value={formData.project}
                    label="Project"
                    onChange={handleInputChange}
                  >
                    {projects.map(project => (
                      <MenuItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Zone</InputLabel>
                {loadingZones ? (
                  <CircularProgress size={24} sx={{ mt: 2, ml: 2 }} />
                ) : (
                  <Select
                    name="zone"
                    value={formData.zone}
                    label="Zone"
                    onChange={handleInputChange}
                  >
                    {zones.map(zone => (
                      <MenuItem key={zone.id} value={zone.regionCode}>
                        {zone.name} ({zone.regionCode}) - {zone.provider}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Machine Image</InputLabel>
                <Select
                  name="imageId"
                  value={formData.imageId}
                  label="Machine Image"
                  onChange={handleInputChange}
                >
                  <MenuItem value="ami-ubuntu-20.04">Ubuntu 20.04 LTS</MenuItem>
                  <MenuItem value="ami-ubuntu-22.04">Ubuntu 22.04 LTS</MenuItem>
                  <MenuItem value="ami-amazon-linux-2">Amazon Linux 2</MenuItem>
                  <MenuItem value="ami-windows-2019">Windows Server 2019</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      case 1:
        // Determine provider based on selected zone
        const formSelectedZone = zones.find(z => z.regionCode === formData.zone);
        const formProvider = formSelectedZone ? formSelectedZone.provider : '';
        
        // Determine network performance based on CPU and memory
        let networkPerformance;
        if (formData.cpuCount <= 1 && formData.memorySize <= 2) {
          networkPerformance = 'Low to Moderate';
        } else if (formData.cpuCount <= 2 && formData.memorySize <= 8) {
          networkPerformance = 'Moderate';
        } else {
          networkPerformance = 'High';
        }
        
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Resources
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Configure the compute resources for your instance.
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="CPU (vCPUs)"
                name="cpuCount"
                type="number"
                value={formData.cpuCount}
                onChange={handleInputChange}
                inputProps={{ min: 1, max: 64 }}
                helperText="Number of virtual CPUs"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Memory (GB)"
                name="memorySize"
                type="number"
                value={formData.memorySize}
                onChange={handleInputChange}
                inputProps={{ min: 1, max: 256 }}
                helperText="Amount of RAM in gigabytes"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: theme.palette.background.default, mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Resource Allocation Summary
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <MemoryIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="body2">
                    {formData.cpuCount} vCPU, {formData.memorySize} GB Memory
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <NetworkIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="body2">
                    Network Performance: {networkPerformance}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            
            {formProvider === 'SelfHosted' && (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mt: 1 }}>
                  This is a self-hosted zone. The instance will be created using the connection details configured for this zone.
                </Alert>
              </Grid>
            )}
          </Grid>
        );
      case 2:
        // Determine network performance based on CPU and memory
        let networkPerfLevel;
        if (formData.cpuCount <= 1 && formData.memorySize <= 2) {
          networkPerfLevel = 'Low to Moderate';
        } else if (formData.cpuCount <= 2 && formData.memorySize <= 8) {
          networkPerfLevel = 'Moderate';
        } else {
          networkPerfLevel = 'High';
        }
        
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>VPC</InputLabel>
                <Select
                  name="vpc"
                  value={formData.vpc}
                  label="VPC"
                  onChange={handleInputChange}
                >
                  <MenuItem value="vpc-default">Default VPC</MenuItem>
                  <MenuItem value="vpc-custom">Custom VPC</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Subnet</InputLabel>
                <Select
                  name="subnet"
                  value={formData.subnet}
                  label="Subnet"
                  onChange={handleInputChange}
                >
                  <MenuItem value="subnet-default">Default Subnet</MenuItem>
                  <MenuItem value="subnet-public">Public Subnet</MenuItem>
                  <MenuItem value="subnet-private">Private Subnet</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Security Group</InputLabel>
                <Select
                  name="securityGroup"
                  value={formData.securityGroup}
                  label="Security Group"
                  onChange={handleInputChange}
                >
                  <MenuItem value="sg-default">Default Security Group</MenuItem>
                  <MenuItem value="sg-web">Web Server Security Group</MenuItem>
                  <MenuItem value="sg-db">Database Security Group</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: theme.palette.background.default }}>
                <Typography variant="subtitle2" gutterBottom>
                  Security Group Rules
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SecurityIcon sx={{ mr: 1, color: theme.palette.success.main }} />
                  <Typography variant="body2">
                    Inbound: Allow SSH (22) from My IP
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SecurityIcon sx={{ mr: 1, color: theme.palette.success.main }} />
                  <Typography variant="body2">
                    Outbound: Allow All Traffic
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Root Volume
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Root Volume Size (GB)"
                name="rootVolumeSize"
                type="number"
                value={formData.rootVolumeSize}
                onChange={handleInputChange}
                inputProps={{ min: 8, max: 16000 }}
                helperText="Min: 8 GB, Max: 16000 GB"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Root Volume Type</InputLabel>
                <Select
                  name="rootVolumeType"
                  value={formData.rootVolumeType}
                  label="Root Volume Type"
                  onChange={handleInputChange}
                >
                  <MenuItem value="gp2">General Purpose SSD (gp2)</MenuItem>
                  <MenuItem value="gp3">General Purpose SSD (gp3)</MenuItem>
                  <MenuItem value="io1">Provisioned IOPS SSD (io1)</MenuItem>
                  <MenuItem value="st1">Throughput Optimized HDD (st1)</MenuItem>
                  <MenuItem value="sc1">Cold HDD (sc1)</MenuItem>
                </Select>
                <FormHelperText>
                  {formData.rootVolumeType === 'gp2' && 'Balanced price and performance'}
                  {formData.rootVolumeType === 'gp3' && 'Latest generation SSD with customizable performance'}
                  {formData.rootVolumeType === 'io1' && 'Highest performance SSD for mission-critical workloads'}
                  {formData.rootVolumeType === 'st1' && 'Low-cost HDD for frequently accessed, throughput-intensive workloads'}
                  {formData.rootVolumeType === 'sc1' && 'Lowest cost HDD for less frequently accessed workloads'}
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: theme.palette.background.default }}>
                <Typography variant="subtitle2" gutterBottom>
                  Storage Performance
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <StorageIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="body2">
                    {formData.rootVolumeType === 'gp2' && 'Baseline: 3 IOPS/GB (min 100 IOPS, max 16,000 IOPS)'}
                    {formData.rootVolumeType === 'gp3' && 'Baseline: 3,000 IOPS, 125 MB/s throughput'}
                    {formData.rootVolumeType === 'io1' && 'Up to 64,000 IOPS, 1,000 MB/s throughput'}
                    {formData.rootVolumeType === 'st1' && 'Up to 500 MB/s throughput, 500 IOPS'}
                    {formData.rootVolumeType === 'sc1' && 'Up to 250 MB/s throughput, 250 IOPS'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <StorageIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="body2">
                    Total Size: {formData.rootVolumeSize} GB
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        );
      case 4:
        // Determine network performance based on CPU and memory
        let reviewNetworkPerformance;
        if (formData.cpuCount <= 1 && formData.memorySize <= 2) {
          reviewNetworkPerformance = 'Low to Moderate';
        } else if (formData.cpuCount <= 2 && formData.memorySize <= 8) {
          reviewNetworkPerformance = 'Moderate';
        } else {
          reviewNetworkPerformance = 'High';
        }
        
        // Get OS stack based on image ID
        let osName;
        switch(formData.imageId) {
          case 'ami-ubuntu-20.04':
            osName = 'Ubuntu 20.04 LTS';
            break;
          case 'ami-ubuntu-22.04':
            osName = 'Ubuntu 22.04 LTS';
            break;
          case 'ami-amazon-linux-2':
            osName = 'Amazon Linux 2';
            break;
          case 'ami-windows-2019':
            osName = 'Windows Server 2019';
            break;
          default:
            osName = 'Linux';
        }
        
        // Get selected project and zone names
        const selectedProject = projects.find(p => p.id.toString() === formData.project);
        const reviewSelectedZone = zones.find(z => z.regionCode === formData.zone);
        const projectName = selectedProject ? selectedProject.name : formData.project;
        const zoneName = reviewSelectedZone ? `${reviewSelectedZone.name} (${reviewSelectedZone.regionCode})` : formData.zone;
        
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 3, bgcolor: theme.palette.background.default }}>
                <Typography variant="h6" gutterBottom>
                  Instance Summary
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Instance Name
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formData.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Project
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {projectName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Zone
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {zoneName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Machine Image
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {osName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      CPU
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formData.cpuCount} vCPU
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Memory
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formData.memorySize} GB
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Network Performance
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {reviewNetworkPerformance}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Network
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formData.vpc === 'vpc-default' ? 'Default VPC' : 'Custom VPC'}, 
                      {formData.subnet === 'subnet-default' ? ' Default Subnet' : 
                       formData.subnet === 'subnet-public' ? ' Public Subnet' : ' Private Subnet'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Security Group
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formData.securityGroup === 'sg-default' ? 'Default Security Group' : 
                       formData.securityGroup === 'sg-web' ? 'Web Server Security Group' : 
                       'Database Security Group'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Root Volume
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formData.rootVolumeSize} GB, 
                      {formData.rootVolumeType === 'gp2' ? ' General Purpose SSD (gp2)' : 
                       formData.rootVolumeType === 'gp3' ? ' General Purpose SSD (gp3)' : 
                       formData.rootVolumeType === 'io1' ? ' Provisioned IOPS SSD (io1)' : 
                       formData.rootVolumeType === 'st1' ? ' Throughput Optimized HDD (st1)' : 
                       ' Cold HDD (sc1)'}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body2" color="text.secondary">
                  Please review the instance configuration before launching. Once launched, the instance will be created with these settings.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Create New Instance
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            {activeStep > 0 && (
              <Button 
                variant="outlined" 
                onClick={handlePrevious} 
                sx={{ mr: 1 }}
                disabled={loading}
              >
                Previous
              </Button>
            )}
            
            {activeStep < steps.length - 1 ? (
              <Button 
                variant="contained" 
                onClick={handleNext}
                disabled={loading}
              >
                Next
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSubmit}
                startIcon={<CloudUploadIcon />}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Launch Instance'}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InstanceCreate; 