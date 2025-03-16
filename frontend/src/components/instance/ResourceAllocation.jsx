import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Storage as StorageIcon,
  Memory as MemoryIcon
} from '@mui/icons-material';

/**
 * Resource allocation component showing CPU, memory, and disk allocation
 * @param {Object} props - Component props
 * @param {Object} props.instance - Instance data
 * @returns {JSX.Element} ResourceAllocation component
 */
const ResourceAllocation = ({ instance }) => {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Resource Allocation
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <List disablePadding>
          <ListItem disablePadding sx={{ py: 1 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <MemoryIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="CPU" 
              secondary={`${instance.cpu || 'N/A'} ${instance.cpu ? 'vCPUs' : ''}`}
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              secondaryTypographyProps={{ variant: 'body1' }}
            />
          </ListItem>
          
          <ListItem disablePadding sx={{ py: 1 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <StorageIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Memory" 
              secondary={instance.memory || 'N/A'}
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              secondaryTypographyProps={{ variant: 'body1' }}
            />
          </ListItem>
          
          <ListItem disablePadding sx={{ py: 1 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <StorageIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Disk" 
              secondary={instance.disk || 'N/A'}
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              secondaryTypographyProps={{ variant: 'body1' }}
            />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};

export default ResourceAllocation; 