import React from 'react';
import {
  Box,
  Button
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

const StepperNavigation = ({
  activeStep,
  stepsLength,
  loading,
  onPrevious,
  onNext,
  onSubmit
}) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
      {activeStep > 0 && (
        <Button 
          variant="outlined" 
          onClick={onPrevious} 
          sx={{ mr: 1 }}
          disabled={loading}
        >
          Previous
        </Button>
      )}
      
      {activeStep < stepsLength - 1 ? (
        <Button 
          variant="contained" 
          onClick={onNext}
          disabled={loading}
        >
          Next
        </Button>
      ) : (
        <Button 
          variant="contained" 
          color="primary" 
          onClick={onSubmit}
          startIcon={<CloudUploadIcon />}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Launch Instance'}
        </Button>
      )}
    </Box>
  );
};

export default StepperNavigation;