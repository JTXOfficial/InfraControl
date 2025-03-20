import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Box,
  Button,
  Chip
} from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';

const SSHConnectionFields = ({
  formData,
  handleInputChange,
  errors,
  testConnection,
  testingConnection,
  connectionTested
}) => {
  return (
    <>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="IP Address"
          name="ipAddress"
          value={formData.ipAddress}
          onChange={handleInputChange}
          error={!!errors.ipAddress}
          helperText={errors.ipAddress}
          required
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="SSH Port"
          name="sshPort"
          type="number"
          value={formData.sshPort}
          onChange={handleInputChange}
          error={!!errors.sshPort}
          helperText={errors.sshPort}
          required
          inputProps={{ min: 1, max: 65535 }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="SSH Username"
          name="sshUsername"
          value={formData.sshUsername}
          onChange={handleInputChange}
          error={!!errors.sshUsername}
          helperText={errors.sshUsername}
          required
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="SSH Password"
          name="sshPassword"
          type="password"
          value={formData.sshPassword}
          onChange={handleInputChange}
          error={!!errors.sshPassword}
          helperText={errors.sshPassword}
        />
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={testConnection}
            disabled={testingConnection || !formData.ipAddress || !formData.sshUsername}
            sx={{ mr: 2 }}
          >
            {testingConnection ? 'Testing...' : 'Test Connection'}
          </Button>
          {connectionTested && (
            <Chip 
              icon={<CheckIcon />} 
              label="Connection Successful" 
              color="success" 
              variant="outlined" 
            />
          )}
          {!formData.sshPassword && formData.ipAddress && formData.sshUsername && (
            <Chip
              label="Empty password - will try SSH agent auth"
              color="warning"
              variant="outlined"
              sx={{ ml: 1 }}
            />
          )}
        </Box>
        {errors.connection && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {errors.connection}
          </Typography>
        )}
      </Grid>
    </>
  );
};

export default SSHConnectionFields;