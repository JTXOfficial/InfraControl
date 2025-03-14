import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Mock authentication function - will be replaced with actual auth later
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
      } />

      {/* Protected routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
          } 
        />
      </Route>

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App; 