import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const useInstanceCreate = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    project: '',
    zone: '',
    cpuCount: 1,
    memorySize: 1,
    ipAddress: '',
    sshUsername: 'admin',
    sshPassword: '',
    sshPort: 22
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [connectionTested, setConnectionTested] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

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
    
    // Reset connection tested state if any SSH field changes
    if (['ipAddress', 'sshUsername', 'sshPassword', 'sshPort'].includes(name)) {
      setConnectionTested(false);
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

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handlePrevious = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleBack = () => {
    navigate('/instances');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return {
    activeStep,
    formData,
    errors,
    loading,
    connectionTested,
    testingConnection,
    snackbar,
    setFormData,
    setErrors,
    setLoading,
    setConnectionTested,
    setTestingConnection,
    setSnackbar,
    handleInputChange,
    validateStep,
    handleNext,
    handlePrevious,
    handleBack,
    handleCloseSnackbar
  };
};

export default useInstanceCreate;