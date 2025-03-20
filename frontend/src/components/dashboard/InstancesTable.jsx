import { 
  Box,
  Card,
  CardHeader,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const InstancesTable = ({
  loading,
  refreshing,
  instances,
  searchQuery,
  selectedProject,
  selectedZone,
  projects,
  zones,
  onSearchChange,
  onSearchSubmit,
  onProjectChange,
  onZoneChange,
  onEditInstance,
  onDeleteInstance,
  getStatusColor
}) => {
  return (
    <Card sx={{ mb: 4 }}>
      <CardHeader 
        title={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Instances</Typography>
            {refreshing && <CircularProgress size={20} sx={{ ml: 2 }} />}
          </Box>
        }
        sx={{ pb: 0 }}
      />
      
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          placeholder="Search instances..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={onSearchChange}
          onKeyDown={onSearchSubmit}
          sx={{ flexGrow: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="project-select-label">Project</InputLabel>
          <Select
            labelId="project-select-label"
            id="project-select"
            value={selectedProject}
            label="Project"
            onChange={onProjectChange}
          >
            <MenuItem value="All Projects">All Projects</MenuItem>
            {projects.map(project => (
              <MenuItem key={project.id || project.name} value={project.name || project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="zone-select-label">Zone</InputLabel>
          <Select
            labelId="zone-select-label"
            id="zone-select"
            value={selectedZone}
            label="Zone"
            onChange={onZoneChange}
          >
            <MenuItem value="All Zones">All Zones</MenuItem>
            {zones.map(zone => (
              <MenuItem key={zone.id || zone.name} value={zone.name || zone.id}>
                {zone.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <Divider sx={{ mt: 2 }} />
      <TableContainer component={Box}>
        <Table sx={{ minWidth: 650 }} size="medium">
          <TableHead>
            <TableRow>
              <TableCell>Instance</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Zone</TableCell>
              <TableCell>IP</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>CPU</TableCell>
              <TableCell>Memory</TableCell>
              <TableCell>Disk</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : instances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No instances found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              instances.map((instance) => (
                <TableRow key={instance.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {instance.name}
                      </Typography>
                      {instance.url && (
                        <Typography variant="caption" color="text.secondary" component="div">
                          {instance.url}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{instance.project || '-'}</TableCell>
                  <TableCell>{instance.zone || instance.region || '-'}</TableCell>
                  <TableCell>{instance.ip || instance.ip_address || '-'}</TableCell>
                  <TableCell>{instance.type || instance.instance_type || '-'}</TableCell>
                  <TableCell>{instance.cpu || '-'}</TableCell>
                  <TableCell>{instance.memory || '-'}</TableCell>
                  <TableCell>{instance.disk || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={instance.status || 'Unknown'} 
                      size="small" 
                      color={getStatusColor(instance.status)}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      size="small" 
                      sx={{ mr: 1 }}
                      onClick={() => onEditInstance(instance.id)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => onDeleteInstance(instance.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default InstancesTable;