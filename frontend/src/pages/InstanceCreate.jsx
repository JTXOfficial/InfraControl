import { useState } from 'react';
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
  useTheme
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CloudUpload as CloudUploadIcon,
  Storage as StorageIcon,
  Memory as MemoryIcon,
  NetworkCheck as NetworkIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

const steps = ['Basic Information', 'Resources', 'Network', 'Storage', 'Review'];

const InstanceCreate = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    project: 'Default',
    zone: 'us-west1-a',
    instanceType: 't2.micro',
    imageId: 'ami-ubuntu-20.04',
    vpc: 'vpc-default',
    subnet: 'subnet-default',
    securityGroup: 'sg-default',
    rootVolumeSize: '50',
    rootVolumeType: 'gp2',
    additionalVolumes: []
  });
  const [errors, setErrors] = useState({});

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

  const handleSubmit = () => {
    // Here you would submit the form data to your API
    console.log('Form submitted:', formData);
    
    // Navigate back to instances list after successful creation
    navigate('/instances');
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
                <Select
                  name="project"
                  value={formData.project}
                  label="Project"
                  onChange={handleInputChange}
                >
                  <MenuItem value="Default">Default</MenuItem>
                  <MenuItem value="e-commerce">e-commerce</MenuItem>
                  <MenuItem value="test-project">test-project</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Zone</InputLabel>
                <Select
                  name="zone"
                  value={formData.zone}
                  label="Zone"
                  onChange={handleInputChange}
                >
                  <MenuItem value="us-west1-a">us-west1-a</MenuItem>
                  <MenuItem value="us-east1-b">us-east1-b</MenuItem>
                  <MenuItem value="eu-west1-c">eu-west1-c</MenuItem>
                </Select>
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
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Instance Type</InputLabel>
                <Select
                  name="instanceType"
                  value={formData.instanceType}
                  label="Instance Type"
                  onChange={handleInputChange}
                >
                  <MenuItem value="t2.micro">t2.micro (1 vCPU, 1 GiB RAM)</MenuItem>
                  <MenuItem value="t2.small">t2.small (1 vCPU, 2 GiB RAM)</MenuItem>
                  <MenuItem value="t2.medium">t2.medium (2 vCPU, 4 GiB RAM)</MenuItem>
                  <MenuItem value="t2.large">t2.large (2 vCPU, 8 GiB RAM)</MenuItem>
                  <MenuItem value="t2.xlarge">t2.xlarge (4 vCPU, 16 GiB RAM)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: theme.palette.background.default }}>
                <Typography variant="subtitle2" gutterBottom>
                  Resource Allocation
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <MemoryIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="body2">
                    CPU: 1 vCPU
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <StorageIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="body2">
                    Memory: 1 GiB
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <NetworkIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="body2">
                    Network: Up to 5 Gbps
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        );
      case 2:
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
              <FormControl fullWidth>
                <InputLabel>Root Volume Size (GB)</InputLabel>
                <Select
                  name="rootVolumeSize"
                  value={formData.rootVolumeSize}
                  label="Root Volume Size (GB)"
                  onChange={handleInputChange}
                >
                  <MenuItem value="8">8 GB</MenuItem>
                  <MenuItem value="16">16 GB</MenuItem>
                  <MenuItem value="32">32 GB</MenuItem>
                  <MenuItem value="50">50 GB</MenuItem>
                  <MenuItem value="100">100 GB</MenuItem>
                  <MenuItem value="200">200 GB</MenuItem>
                  <MenuItem value="500">500 GB</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
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
              </FormControl>
            </Grid>
          </Grid>
        );
      case 4:
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
                      {formData.project}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Zone
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formData.zone}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Machine Image
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formData.imageId === 'ami-ubuntu-20.04' ? 'Ubuntu 20.04 LTS' : 
                       formData.imageId === 'ami-ubuntu-22.04' ? 'Ubuntu 22.04 LTS' :
                       formData.imageId === 'ami-amazon-linux-2' ? 'Amazon Linux 2' :
                       'Windows Server 2019'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Instance Type
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formData.instanceType}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Network
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formData.vpc}, {formData.subnet}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Security Group
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formData.securityGroup}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Root Volume
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formData.rootVolumeSize} GB, {formData.rootVolumeType}
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
              >
                Previous
              </Button>
            )}
            
            {activeStep < steps.length - 1 ? (
              <Button 
                variant="contained" 
                onClick={handleNext}
              >
                Next
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSubmit}
                startIcon={<CloudUploadIcon />}
              >
                Launch Instance
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InstanceCreate; 