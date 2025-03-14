import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';

// Auth Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Events from './pages/Events';
import Instances from './pages/Instances';
import Users from './pages/Users';
import InstanceDetail from './pages/InstanceDetail';
import UserDetail from './pages/UserDetail';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';

// Loading component
const LoadingScreen = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress size={40} />
    <Typography variant="body1" sx={{ mt: 2 }}>Loading...</Typography>
  </Box>
);

// Error component
const ErrorScreen = ({ message }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Typography variant="h5" color="error" gutterBottom>Error</Typography>
    <Typography variant="body1">{message || 'An unexpected error occurred'}</Typography>
  </Box>
);

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, error } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (error) {
    return <ErrorScreen message={error} />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// App routes
const AppRoutes = () => {
  const { isAuthenticated, loading, error } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (error && !isAuthenticated) {
    return <ErrorScreen message={error} />;
  }
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
      } />

      {/* Protected routes */}
      <Route element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/instances" element={<Instances />} />
        <Route path="/instances/:id" element={<InstanceDetail />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id" element={<UserDetail />} />
        <Route path="/events" element={<Events />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App; 