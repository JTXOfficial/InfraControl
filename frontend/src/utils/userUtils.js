export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (err) {
    console.error('Error formatting date:', err);
    return 'Invalid date';
  }
};

export const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

export const isPermissionEnabled = (userPermissions, permissionId) => {
  return userPermissions.includes(permissionId);
};

export const formatActivityDate = (timestamp) => {
  const activityDate = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86400000);

  if (activityDate.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (activityDate.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return activityDate.toLocaleDateString(undefined, { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
};

export const prepareUserUpdateData = (editedUser) => {
  return {
    first_name: editedUser.first_name,
    last_name: editedUser.last_name,
    email: editedUser.email,
    role: editedUser.role,
    department: editedUser.department,
    position: editedUser.position,
    phone: editedUser.phone,
    location: editedUser.location,
    is_active: editedUser.status === 'active'
  };
};