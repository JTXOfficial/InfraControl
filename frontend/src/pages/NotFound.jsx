import { Box, Typography, Button, Container, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: theme.palette.background.default
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            py: 4
          }}
        >
          <Typography 
            variant="h1" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              fontSize: { xs: '6rem', md: '8rem' }
            }}
          >
            404
          </Typography>
          <Typography variant="h4" component="h2" gutterBottom>
            Page Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4, maxWidth: '500px' }}>
            The page you are looking for doesn't exist or has been moved.
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => navigate('/')}
            sx={{ 
              py: 1.5, 
              px: 4,
              borderRadius: 2,
              fontWeight: 600
            }}
          >
            Go to Dashboard
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default NotFound; 