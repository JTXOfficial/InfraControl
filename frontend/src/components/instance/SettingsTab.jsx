import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid,
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  useTheme
} from '@mui/material';
import instanceService from '../../services/instanceService';
import { useSnackbar } from 'notistack';

/**
 * Settings tab component for instance configuration
 * @param {Object} props - Component props
 * @param {Object} props.instance - Instance data
 * @param {Function} props.onRefresh - Refresh handler
 * @returns {JSX.Element} SettingsTab component
 */
const SettingsTab = ({ instance, onRefresh }) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({
    name: '',
    cpu: 1,
    memory: 1,
    region: '',
    vpc: 'vpc-default',
    subnet: 'subnet-default',
    securityGroup: 'sg-default',
    rootVolumeType: 'gp2',
    rootVolumeSize: 50
  });

  // Initialize form values when instance data changes
  useEffect(() => {
    if (instance) {
      setFormValues({
        name: instance.name,
        cpu: instance.cpu || 1,
        memory: instance.memory ? parseInt(instance.memory) : 1,
        region: instance.region || instance.zone,
        vpc: instance.config?.vpc || 'vpc-default',
        subnet: instance.config?.subnet || 'subnet-default',
        securityGroup: instance.config?.securityGroup || 'sg-default',
        rootVolumeType: instance.config?.rootVolumeType || 'gp2',
        rootVolumeSize: instance.disk ? parseInt(instance.disk) : 50
      });
    }
  }, [instance]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
    setIsEditing(true);
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reset form values to original instance values
    setFormValues({
      name: instance.name,
      cpu: instance.cpu || 1,
      memory: instance.memory ? parseInt(instance.memory) : 1,
      region: instance.region || instance.zone,
      vpc: instance.config?.vpc || 'vpc-default',
      subnet: instance.config?.subnet || 'subnet-default',
      securityGroup: instance.config?.securityGroup || 'sg-default',
      rootVolumeType: instance.config?.rootVolumeType || 'gp2',
      rootVolumeSize: instance.disk ? parseInt(instance.disk) : 50
    });
    setIsEditing(false);
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      
      // Prepare the update data
      const updateData = {
        name: formValues.name,
        status: instance.status, // Include the current status to prevent null value
        config: {
          // Include all relevant fields to ensure complete update
          cpu: formValues.cpu,
          memory: `${formValues.memory} GB`,
          rootVolumeSize: formValues.rootVolumeSize,
          rootVolumeType: formValues.rootVolumeType,
          vpc: formValues.vpc,
          subnet: formValues.subnet,
          securityGroup: formValues.securityGroup,
          // Preserve existing fields that aren't being edited
          project: instance.project,
          projectName: instance.projectName,
          stack: instance.stack,
          // Add any other fields from the original config
          ...(instance.config || {})
        }
      };
      
      console.log('Sending update data:', updateData);
      
      // Call the API to update the instance
      await instanceService.updateInstance(instance.id, updateData);
      
      // Reset editing state
      setIsEditing(false);
      
      // Show success message
      enqueueSnackbar('Instance updated successfully', { variant: 'success' });
      
      // Refresh instance details
      onRefresh();
      
    } catch (error) {
      console.error(`Error updating instance ${instance.id}:`, error);
      
      // Extract error message
      let errorMessage = 'Failed to update instance';
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show error message
      enqueueSnackbar(`Error: ${errorMessage}`, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Instance Settings
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                      <InputLabel>Instance Name</InputLabel>
                      <Select
                        value={formValues.name}
                        label="Instance Name"
                      >
                        <MenuItem value={formValues.name}>{formValues.name}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                      <TextField
                        label="CPU (vCPUs)"
                        type="number"
                        name="cpu"
                        value={formValues.cpu}
                        onChange={handleInputChange}
                        inputProps={{ min: 1, max: 32 }}
                        size="small"
                        fullWidth
                        helperText="Enter number of vCPUs (1-32)"
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                      <TextField
                        label="Memory (GB)"
                        type="number"
                        name="memory"
                        value={formValues.memory}
                        onChange={handleInputChange}
                        inputProps={{ min: 1, max: 128 }}
                        size="small"
                        fullWidth
                        helperText="Enter memory in GB (1-128)"
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel>Region</InputLabel>
                      <Select
                        value={formValues.region}
                        name="region"
                        onChange={handleSelectChange}
                        label="Region"
                      >
                        <MenuItem value="us-east-1">US East (N. Virginia)</MenuItem>
                        <MenuItem value="us-east-2">US East (Ohio)</MenuItem>
                        <MenuItem value="us-west-1">US West (N. California)</MenuItem>
                        <MenuItem value="us-west-2">US West (Oregon)</MenuItem>
                        <MenuItem value="eu-west-1">EU (Ireland)</MenuItem>
                        <MenuItem value="eu-central-1">EU (Frankfurt)</MenuItem>
                        <MenuItem value="ap-northeast-1">Asia Pacific (Tokyo)</MenuItem>
                        <MenuItem value="ap-southeast-1">Asia Pacific (Singapore)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {instance.tags && instance.tags.map(tag => (
                    <Chip 
                      key={tag} 
                      label={tag} 
                      size="small"
                      onDelete={() => {}}
                      sx={{ 
                        bgcolor: `${theme.palette.primary.main}20`,
                        color: theme.palette.primary.main
                      }}
                    />
                  ))}
                  <Chip 
                    label="Add Tag" 
                    size="small"
                    color="primary"
                    variant="outlined"
                    onClick={() => {}}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Network Settings
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                      <InputLabel>VPC</InputLabel>
                      <Select
                        value={formValues.vpc}
                        name="vpc"
                        onChange={handleSelectChange}
                        label="VPC"
                      >
                        <MenuItem value="vpc-default">Default VPC</MenuItem>
                        <MenuItem value="vpc-custom">Custom VPC</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                      <InputLabel>Subnet</InputLabel>
                      <Select
                        value={formValues.subnet}
                        name="subnet"
                        onChange={handleSelectChange}
                        label="Subnet"
                      >
                        <MenuItem value="subnet-default">Default Subnet</MenuItem>
                        <MenuItem value="subnet-public">Public Subnet</MenuItem>
                        <MenuItem value="subnet-private">Private Subnet</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel>Security Group</InputLabel>
                      <Select
                        value={formValues.securityGroup}
                        name="securityGroup"
                        onChange={handleSelectChange}
                        label="Security Group"
                      >
                        <MenuItem value="sg-default">Default Security Group</MenuItem>
                        <MenuItem value="sg-web">Web Server Security Group</MenuItem>
                        <MenuItem value="sg-db">Database Security Group</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Storage Settings
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                      <InputLabel>Root Volume Type</InputLabel>
                      <Select
                        value={formValues.rootVolumeType}
                        name="rootVolumeType"
                        onChange={handleSelectChange}
                        label="Root Volume Type"
                      >
                        <MenuItem value="gp2">General Purpose SSD (gp2)</MenuItem>
                        <MenuItem value="gp3">General Purpose SSD (gp3)</MenuItem>
                        <MenuItem value="io1">Provisioned IOPS SSD (io1)</MenuItem>
                        <MenuItem value="io2">Provisioned IOPS SSD (io2)</MenuItem>
                        <MenuItem value="st1">Throughput Optimized HDD (st1)</MenuItem>
                        <MenuItem value="sc1">Cold HDD (sc1)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth variant="outlined" size="small">
                      <TextField
                        label="Root Volume Size (GB)"
                        type="number"
                        name="rootVolumeSize"
                        value={formValues.rootVolumeSize}
                        onChange={handleInputChange}
                        inputProps={{ min: 8, max: 16000 }}
                        size="small"
                        fullWidth
                        helperText="Enter volume size in GB (8-16000)"
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button 
                variant="outlined" 
                sx={{ mr: 2 }}
                onClick={handleCancel}
                disabled={!isEditing}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleSaveChanges}
                disabled={!isEditing || loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SettingsTab; 