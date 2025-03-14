import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
  Avatar,
  Tooltip,
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Storage as StorageIcon,
  People as PeopleIcon,
  Event as EventIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
          InfraControl
        </Typography>
      </Box>
      <Box sx={{ px: 2, pb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Infrastructure Management
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />
      
      <Box sx={{ p: 2 }}>
        <List sx={{ p: 0 }}>
          <ListItem 
            button 
            component="a" 
            href="/dashboard" 
            selected={true}
            sx={{ mb: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <DashboardIcon color="inherit" />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          
          <ListItem 
            button 
            component="a" 
            href="/instances" 
            sx={{ mb: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <StorageIcon color="inherit" />
            </ListItemIcon>
            <ListItemText primary="Instances" />
          </ListItem>
          
          <ListItem 
            button 
            component="a" 
            href="/users" 
            sx={{ mb: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <PeopleIcon color="inherit" />
            </ListItemIcon>
            <ListItemText primary="Users" />
          </ListItem>
          
          <ListItem 
            button 
            component="a" 
            href="/events" 
            sx={{ mb: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <EventIcon color="inherit" />
            </ListItemIcon>
            <ListItemText primary="Events" />
          </ListItem>
        </List>
      </Box>
      
      <Box sx={{ mt: 'auto', p: 2 }}>
        <ListItem 
          button 
          component="a" 
          href="/logout" 
          sx={{ 
            borderRadius: 2,
            color: theme.palette.text.secondary
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Sign Out" />
        </ListItem>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex', height: '100%', bgcolor: theme.palette.background.default }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: theme.palette.background.paper,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ display: { xs: 'none', sm: 'block' } }}>
              InfraControl
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Refresh">
              <IconButton color="inherit" size="small" sx={{ mr: 1 }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: theme.palette.primary.main,
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}
              >
                A
              </Avatar>
              <Box sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" component="div">
                  Admin User
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  admin@example.com
                </Typography>
              </Box>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid rgba(255, 255, 255, 0.08)'
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid rgba(255, 255, 255, 0.08)'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          marginTop: '64px',
          height: 'calc(100% - 64px)',
          overflow: 'auto'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout; 