import React from 'react';
import {
  Grid,
  Typography,
  Divider,
  Paper,
  useTheme
} from '@mui/material';

const ReviewStep = ({ formData, projects, zones }) => {
  const theme = useTheme();
  
  // Get selected project and zone names
  const selectedProject = projects.find(p => p.id.toString() === formData.project);
  const selectedZone = zones.find(z => z.regionCode === formData.zone);
  const projectName = selectedProject ? selectedProject.name : formData.project;
  const zoneName = selectedZone ? `${selectedZone.name} (${selectedZone.regionCode})` : formData.zone;
  const isSelfHosted = selectedZone && selectedZone.provider === 'Self Host';

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
            
            {isSelfHosted && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
                    Self-Hosted Connection Details
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    IP Address
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formData.ipAddress}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    SSH Port
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formData.sshPort}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    SSH Username
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formData.sshUsername}
                  </Typography>
                </Grid>
              </>
            )}
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" color="text.secondary">
            Please review the instance configuration before launching. Once launched, the instance will be created with these settings.
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ReviewStep;