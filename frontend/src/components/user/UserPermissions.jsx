import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  InputLabel, 
  Select, 
  MenuItem,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Switch
} from '@mui/material';
import { permissionGroups, predefinedRoles } from '../../constants/userConstants';
import { isPermissionEnabled } from '../../utils/userUtils';

const UserPermissions = ({
  selectedRole,
  isCustomRole,
  userPermissions,
  permissionChanged,
  onRoleChange,
  onPermissionToggle,
  onSavePermissions
}) => {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Role Assignment
        </Typography>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <InputLabel id="role-select-label" sx={{ mb: 1 }}>User Role</InputLabel>
              <Select
                labelId="role-select-label"
                id="role-select"
                value={selectedRole}
                onChange={onRoleChange}
                fullWidth
              >
                {Object.entries(predefinedRoles).map(([key, role]) => (
                  <MenuItem key={key} value={key}>
                    {role.name}
                  </MenuItem>
                ))}
                <MenuItem value="custom">Custom Role</MenuItem>
              </Select>
              
              {!isCustomRole && selectedRole && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {predefinedRoles[selectedRole].description}
                </Typography>
              )}
            </Grid>
          </Grid>
          
          {permissionChanged && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={onSavePermissions}
              >
                Save Changes
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
      
      <Box>
        <Typography variant="h6" gutterBottom>
          Permissions
        </Typography>
        
        {permissionGroups.map((group) => (
          <Paper key={group.name} variant="outlined" sx={{ mb: 3 }}>
            <Box sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="subtitle1" fontWeight="medium">
                {group.name}
              </Typography>
            </Box>
            <Divider />
            <List disablePadding>
              {group.permissions.map((permission) => (
                <ListItem 
                  key={permission.id}
                  divider
                  secondaryAction={
                    <Switch
                      edge="end"
                      checked={isPermissionEnabled(userPermissions, permission.id)}
                      onChange={() => onPermissionToggle(permission.id)}
                      disabled={!isCustomRole && selectedRole !== 'custom'}
                    />
                  }
                >
                  <ListItemText 
                    primary={permission.name}
                    secondary={permission.description}
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default UserPermissions;