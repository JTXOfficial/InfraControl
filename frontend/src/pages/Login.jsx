import { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Container,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  useTheme
} from '@mui/material';
import {
  Visibility,
  VisibilityOff
} from '@mui/icons-material';

const Login = ({ onLogin }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate form
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any login
      onLogin();
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: theme.palette.background.default,
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            bgcolor: theme.palette.background.paper
          }}
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: theme.palette.primary.main, mb: 1 }}>
              InfraControl
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to your account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              variant="outlined"
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                py: 1.5, 
                mb: 2,
                borderRadius: 2,
                fontWeight: 600
              }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link href="#" variant="body2" sx={{ color: theme.palette.primary.main }}>
                Forgot password?
              </Link>
            </Box>
          </Box>
        </Paper>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
          &copy; {new Date().getFullYear()} InfraControl. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Login; 