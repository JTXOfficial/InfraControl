import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon, Refresh as RefreshIcon } from '@mui/icons-material';

const UserNotFound = ({ id, onBack }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '70vh',
      textAlign: 'center'
    }}>
      <Typography variant="h4" color="error" gutterBottom>
        User Not Found
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        We couldn't find a user with ID: {id}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          color="primary"
          onClick={onBack}
          startIcon={<ArrowBackIcon />}
        >
          Back to Users
        </Button>
        <Button 
          variant="outlined" 
          component={Link} 
          to="/users"
          startIcon={<RefreshIcon />}
        >
          Refresh
        </Button>
      </Box>
    </Box>
  );
};

export default UserNotFound;