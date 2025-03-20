import {
  Person as PersonIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  History as HistoryIcon
} from '@mui/icons-material';

export const permissionGroups = [
  {
    name: 'Instance Management',
    permissions: [
      { id: 'instance:view', name: 'View Instances', description: 'View instance details and status' },
      { id: 'instance:create', name: 'Create Instances', description: 'Create new instances' },
      { id: 'instance:edit', name: 'Edit Instances', description: 'Modify instance configuration' },
      { id: 'instance:delete', name: 'Delete Instances', description: 'Delete instances' },
      { id: 'instance:restart', name: 'Restart Instances', description: 'Restart instances' }
    ]
  },
  {
    name: 'User Management',
    permissions: [
      { id: 'user:view', name: 'View Users', description: 'View user details' },
      { id: 'user:create', name: 'Create Users', description: 'Create new users' },
      { id: 'user:edit', name: 'Edit Users', description: 'Modify user details and permissions' },
      { id: 'user:delete', name: 'Delete Users', description: 'Delete users' }
    ]
  },
  {
    name: 'Settings',
    permissions: [
      { id: 'settings:view', name: 'View Settings', description: 'View system settings' },
      { id: 'settings:edit', name: 'Edit Settings', description: 'Modify system settings' }
    ]
  },
  {
    name: 'Events & Logs',
    permissions: [
      { id: 'events:view', name: 'View Events', description: 'View event logs' },
      { id: 'events:export', name: 'Export Events', description: 'Export event logs' }
    ]
  }
];

export const predefinedRoles = {
  admin: {
    name: 'Administrator',
    description: 'Full access to all features',
    permissions: [
      'instance:view', 'instance:create', 'instance:edit', 'instance:delete', 'instance:restart',
      'user:view', 'user:create', 'user:edit', 'user:delete',
      'settings:view', 'settings:edit',
      'events:view', 'events:export'
    ]
  },
  manager: {
    name: 'Manager',
    description: 'Can manage instances and view users',
    permissions: [
      'instance:view', 'instance:create', 'instance:edit', 'instance:restart',
      'user:view',
      'settings:view',
      'events:view', 'events:export'
    ]
  },
  operator: {
    name: 'Operator',
    description: 'Can view and restart instances',
    permissions: [
      'instance:view', 'instance:restart',
      'events:view'
    ]
  },
  viewer: {
    name: 'Viewer',
    description: 'Read-only access',
    permissions: [
      'instance:view',
      'events:view'
    ]
  }
};

export const activityIcons = {
  login: PersonIcon,
  logout: LogoutIcon,
  create: AddIcon,
  update: EditIcon,
  delete: DeleteIcon,
  permission: SecurityIcon,
  settings: SettingsIcon,
  default: HistoryIcon
};

export const getActivityColor = (theme, type) => {
  switch (type) {
    case 'login':
      return theme.palette.success.main;
    case 'logout':
      return theme.palette.info.main;
    case 'create':
      return theme.palette.success.main;
    case 'update':
      return theme.palette.warning.main;
    case 'delete':
      return theme.palette.error.main;
    case 'permission':
      return theme.palette.secondary.main;
    case 'settings':
      return theme.palette.primary.main;
    default:
      return theme.palette.grey[500];
  }
};