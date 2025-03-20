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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  useTheme,
  Grid
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import zoneService from '../services/zoneService';

const Zones = () => {
  const theme = useTheme();
  const [zones, setZones] = useState([]);
  const [filteredZones, setFilteredZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('All');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [currentZone, setCurrentZone] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    provider: 'AWS',
    regionCode: '',
    description: '',
    status: 'active',
    ipAddress: '',
    sshUser: 'admin',
    sshPort: 22,
    sshPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [submitting, setSubmitting] = useState(false);

  const providers = ['All', 'AWS', 'GCP', 'Azure', 'Self Host'];

  useEffect(() => {
    fetchZones();
  }, []);

  useEffect(() => {
    let filtered = zones;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(zone => 
        zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        zone.regionCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        zone.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by provider
    if (selectedProvider !== 'All') {
      filtered = filtered.filter(zone => zone.provider === selectedProvider);
    }
    
    setFilteredZones(filtered);
  }, [searchQuery, selectedProvider, zones]);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const data = await zoneService.getAllZones();
      setZones(data);
      setFilteredZones(data);
    } catch (error) {
      console.error('Error fetching zones:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load zones',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleProviderChange = (event) => {
    setSelectedProvider(event.target.value);
  };

  const handleRefresh = () => {
    fetchZones();
  };

  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setFormData({
      name: '',
      provider: 'AWS',
      regionCode: '',
      description: '',
      status: 'active',
      ipAddress: '',
      sshUser: 'admin',
      sshPort: 22,
      sshPassword: ''
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (zone) => {
    setDialogMode('edit');
    setCurrentZone(zone);
    setFormData({
      name: zone.name,
      provider: zone.provider,
      regionCode: zone.regionCode,
      description: zone.description,
      status: zone.status,
      ipAddress: zone.ipAddress || '',
      sshUser: zone.sshUser || 'admin',
      sshPort: zone.sshPort || 22,
      sshPassword: zone.sshPassword || ''
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentZone(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Zone name is required';
    }
    
    if (!formData.regionCode.trim()) {
      errors.regionCode = 'Region code is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Continue with saving the zone
      const endpoint = dialogMode === 'create' ? '/api/zones' : `/api/zones/${currentZone.id}`;
      const method = dialogMode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save zone');
      }
      
      // Refresh zones list
      fetchZones();
      
      // Close dialog and show success message
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: `Zone ${dialogMode === 'create' ? 'created' : 'updated'} successfully!`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving zone:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteZone = async (id) => {
    if (!window.confirm('Are you sure you want to delete this zone?')) return;
    
    try {
      setLoading(true);
      await zoneService.deleteZone(id);
      setZones(prev => prev.filter(z => z.id !== id));
      setSnackbar({
        open: true,
        message: 'Zone deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting zone:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete zone',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  const getProviderColor = (provider) => {
    switch (provider) {
      case 'AWS':
        return theme.palette.primary.main;
      case 'GCP':
        return theme.palette.success.main;
      case 'Azure':
        return theme.palette.info.main;
      default:
        return theme.palette.text.primary;
    }
  };

  return (
    <Box>
      <Card>
        <CardHeader 
          title="Zones" 
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
            >
              Add Zone
            </Button>
          }
        />
        <Divider />
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                placeholder="Search zones..."
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={handleSearchChange}
                sx={{ width: 300 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
              />
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="provider-select-label">Provider</InputLabel>
                <Select
                  labelId="provider-select-label"
                  id="provider-select"
                  value={selectedProvider}
                  label="Provider"
                  onChange={handleProviderChange}
                >
                  {providers.map(provider => (
                    <MenuItem key={provider} value={provider}>{provider}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Box>
          
          <TableContainer>
            <Table sx={{ minWidth: 650 }} size="medium">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Provider</TableCell>
                  <TableCell>Region Code</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : filteredZones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        No zones found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredZones.map((zone) => (
                    <TableRow key={zone.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {zone.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={zone.provider} 
                          size="small"
                          sx={{ 
                            bgcolor: `${getProviderColor(zone.provider)}20`,
                            color: getProviderColor(zone.provider),
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell>{zone.regionCode}</TableCell>
                      <TableCell>{zone.description}</TableCell>
                      <TableCell>
                        <Chip 
                          label={zone.status} 
                          size="small"
                          sx={{ 
                            bgcolor: zone.status === 'active' ? 
                              `${theme.palette.success.main}20` : 
                              `${theme.palette.error.main}20`,
                            color: zone.status === 'active' ? 
                              theme.palette.success.main : 
                              theme.palette.error.main,
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          size="small" 
                          sx={{ mr: 1 }}
                          onClick={() => handleOpenEditDialog(zone)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteZone(zone.id)}
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
        </CardContent>
      </Card>
      
      {/* Create/Edit Zone Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Create New Zone' : 'Edit Zone'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Zone Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Provider</InputLabel>
              <Select
                name="provider"
                value={formData.provider}
                onChange={handleInputChange}
                label="Provider"
              >
                <MenuItem value="AWS">AWS</MenuItem>
                <MenuItem value="GCP">GCP</MenuItem>
                <MenuItem value="Azure">Azure</MenuItem>
                <MenuItem value="Self Host">Self Host</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label={formData.provider === 'Self Host' ? "Location Identifier" : "Region Code"}
              name="regionCode"
              value={formData.regionCode}
              onChange={handleInputChange}
              error={!!formErrors.regionCode}
              helperText={formErrors.regionCode || (
                formData.provider === 'Self Host' ? 'A unique identifier for this self-hosted location (e.g., home-lab, office-rack)' :
                formData.provider === 'AWS' ? 'e.g., us-east-1' : 
                formData.provider === 'GCP' ? 'e.g., us-central1' : 
                'e.g., eastus'
              )}
              sx={{ mb: 2 }}
              placeholder={
                formData.provider === 'Self Host' ? 'e.g., home-lab, office-rack' :
                formData.provider === 'AWS' ? 'e.g., us-east-1' : 
                formData.provider === 'GCP' ? 'e.g., us-central1' : 
                'e.g., eastus'
              }
            />
            
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                {formData.provider === 'SelfHosted' ? 'Testing Connection...' : 'Saving...'}
              </>
            ) : (
              dialogMode === 'create' ? 'Create Zone' : 'Update Zone'
            )}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Zones; 