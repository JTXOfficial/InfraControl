import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

import useInstanceCreate from '../hooks/useInstanceCreate';
import useProjects from '../hooks/useProjects';
import useZones from '../hooks/useZones';
import BasicInformationStep from '../components/instance/create/BasicInformationStep';
import ReviewStep from '../components/instance/create/ReviewStep';
import StepperNavigation from '../components/instance/create/StepperNavigation';
import StatusSnackbar from '../components/instance/create/StatusSnackbar';

const steps = ['Basic Information', 'Review'];

const InstanceCreate = () => {
  const {
    activeStep,
    formData,
    errors,
    loading,
    connectionTested,
    testingConnection,
    snackbar,
    setFormData,
    handleInputChange,
    handleNext,
    handlePrevious,
    handleBack,
    handleCloseSnackbar,
    validateStep,
    setSnackbar,
    setConnectionTested,
    setTestingConnection
  } = useInstanceCreate();

  const { projects, loadingProjects } = useProjects();
  const { zones, loadingZones } = useZones();

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

  const testConnection = async () => {
    try {
      setTestingConnection(true);
      setConnectionTested(false);
      
      const connectionData = {
        ipAddress: formData.ipAddress,
        username: formData.sshUsername,
        password: formData.sshPassword,
        port: parseInt(formData.sshPort, 10)
      };
      
      setSnackbar({
        open: true,
        message: 'Testing SSH connection...',
        severity: 'info'
      });
      
      const response = await fetch('/api/instances/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(connectionData),
      });
      
      const responseData = await response.json();
      
      if (responseData.success) {
        setConnectionTested(true);
        setSnackbar({
          open: true,
          message: 'Connection successful!',
          severity: 'success'
        });
      } else {
        throw new Error(responseData.message || 'Connection test failed');
      }
    } catch (error) {
      console.error('Connection test error:', error);
      
      let errorMessage = error.message;
      if (errorMessage.includes('Authentication failed')) {
        if (!formData.sshPassword) {
          errorMessage = 'Authentication failed. You are attempting to use SSH agent authentication. Please ensure SSH agent is properly configured or provide a password.';
        } else {
          errorMessage = 'Authentication failed. Please check your username and password.';
        }
      }
      
      setSnackbar({
        open: true,
        message: `Connection failed: ${errorMessage}`,
        severity: 'error'
      });
      
      setConnectionTested(false);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const selectedProject = projects.find(p => p.id.toString() === formData.project);
      const selectedZone = zones.find(z => z.regionCode === formData.zone);
      
      if (!selectedProject || !selectedZone) {
        throw new Error('Project or zone not found');
      }

      const provider = selectedZone.provider;
      const instanceData = {
        name: formData.name,
        project: selectedProject.id,
        zone: selectedZone.regionCode,
        provider,
        type: 'vm',
        cpu: parseInt(formData.cpuCount, 10),
        memory: parseInt(formData.memorySize, 10)
      };

      if (provider === 'Self Host') {
        Object.assign(instanceData, {
          ip_address: formData.ipAddress,
          config: {
            project: selectedProject.id,
            projectName: selectedProject.name,
            sshUser: formData.sshUsername,
            sshPort: parseInt(formData.sshPort, 10),
            isSelfHosted: true
          }
        });

        if (formData.sshPassword) {
          instanceData.config.sshPassword = formData.sshPassword;
        }
      } else {
        instanceData.disk = 50; // Default value for cloud providers
      }

      const response = await fetch('/api/instances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(instanceData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create instance');
      }

      setSnackbar({
        open: true,
        message: 'Instance created successfully!',
        severity: 'success'
      });

      setTimeout(() => {
        handleBack();
      }, 2000);
    } catch (error) {
      console.error('Error creating instance:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <BasicInformationStep
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
            projects={projects}
            zones={zones}
            loadingProjects={loadingProjects}
            loadingZones={loadingZones}
            testConnection={testConnection}
            testingConnection={testingConnection}
            connectionTested={connectionTested}
          />
        );
      case 1:
        return (
          <ReviewStep
            formData={formData}
            projects={projects}
            zones={zones}
          />
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

          <StepperNavigation
            activeStep={activeStep}
            stepsLength={steps.length}
            loading={loading}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>

      <StatusSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </Box>
  );
};

export default InstanceCreate;