import React from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Typography
} from '@mui/material';
import SSHConnectionFields from './SSHConnectionFields';

const BasicInformationStep = ({
  formData,
  handleInputChange,
  errors,
  projects,
  zones,
  loadingProjects,
  loadingZones,
  testConnection,
  testingConnection,
  connectionTested
}) => {
  const selectedZone = zones.find(z => z.regionCode === formData.zone);
  const isSelfHosted = selectedZone && selectedZone.provider === 'Self Host';

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

      {isSelfHosted && (
        <>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              SSH Connection Details
            </Typography>
          </Grid>
          <SSHConnectionFields
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
            testConnection={testConnection}
            testingConnection={testingConnection}
            connectionTested={connectionTested}
          />
        </>
      )}
    </Grid>
  );
};

export default BasicInformationStep;