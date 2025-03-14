import { useState } from 'react';
import { Outlet, useNavigate, Link as RouterLink } from 'react-router-dom';
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
  Button,
  Badge,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Storage as StorageIcon,
  People as PeopleIcon,
  Event as EventIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // User menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = async () => {
    handleUserMenuClose();
    await logout();
    navigate('/login');
  };
  
  const handleProfileClick = () => {
    handleUserMenuClose();
    navigate('/settings');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`;
    } else if (user.username) {
      return user.username[0].toUpperCase();
    } else {
      return user.email[0].toUpperCase();
    }
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
            component={RouterLink}
            to="/dashboard" 
            sx={{ mb: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <DashboardIcon color="inherit" />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          
          <ListItem 
            button 
            component={RouterLink}
            to="/instances" 
            sx={{ mb: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <StorageIcon color="inherit" />
            </ListItemIcon>
            <ListItemText primary="Instances" />
          </ListItem>
          
          <ListItem 
            button 
            component={RouterLink}
            to="/users" 
            sx={{ mb: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <PeopleIcon color="inherit" />
            </ListItemIcon>
            <ListItemText primary="Users" />
          </ListItem>
          
          <ListItem 
            button 
            component={RouterLink}
            to="/events" 
            sx={{ mb: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <EventIcon color="inherit" />
            </ListItemIcon>
            <ListItemText primary="Events" />
          </ListItem>
          
          <ListItem 
            button 
            component={RouterLink}
            to="/settings" 
            sx={{ mb: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <SettingsIcon color="inherit" />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
        </List>
      </Box>
      
      <Box sx={{ mt: 'auto', p: 2 }}>
        <ListItem 
          button 
          onClick={handleLogout}
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
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: theme.palette.background.paper,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
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
            <Tooltip title="Notifications">
              <IconButton 
                color="inherit" 
                size="small" 
                sx={{ mr: 1 }} 
                component={RouterLink} 
                to="/notifications"
              >
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Refresh">
              <IconButton color="inherit" size="small" sx={{ mr: 1 }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              <Tooltip title="Account">
                <IconButton
                  onClick={handleUserMenuOpen}
                  size="small"
                  aria-controls={open ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                >
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: theme.palette.primary.main,
                      fontSize: '0.875rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {getUserInitials()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Box sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" component="div">
                  {user?.username || 'User'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email || 'user@example.com'}
                </Typography>
              </Box>
            </Box>
            
            <Menu
              id="account-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleUserMenuClose}
              MenuListProps={{
                'aria-labelledby': 'account-button',
              }}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleProfileClick}>
                <AccountCircleIcon fontSize="small" sx={{ mr: 2 }} /> Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon fontSize="small" sx={{ mr: 2 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Fixed position for the drawer */}
      <Box
        component="nav"
        sx={{ 
          width: { md: drawerWidth }, 
          flexShrink: { md: 0 },
          zIndex: theme.zIndex.drawer
        }}
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
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              height: '100%',
              top: '64px', // Height of the AppBar
              paddingTop: 0
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { md: `calc(100% - ${drawerWidth}px)` },
          marginTop: '64px', // Height of the AppBar
          height: 'calc(100vh - 64px)',
          overflow: 'auto'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout; 