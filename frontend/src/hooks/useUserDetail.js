import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import { prepareUserUpdateData } from '../utils/userUtils';
import { predefinedRoles } from '../constants/userConstants';

const useUserDetail = (userId) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Permissions state
  const [userPermissions, setUserPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [permissionChanged, setPermissionChanged] = useState(false);
  
  // Activity state
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityPage, setActivityPage] = useState(1);
  const [activityHasMore, setActivityHasMore] = useState(true);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      console.log('Fetching user data for ID:', userId);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const userData = await userService.getUserById(userId);
      console.log('User data received:', userData);
      
      if (!userData) {
        console.error('User data is null or undefined');
        setError('User not found');
        setLoading(false);
        return;
      }
      
      setUser(userData);
      setError(null);
      
      setEditedUser({
        ...userData,
        first_name: userData.name?.split(' ')[0] || '',
        last_name: userData.name?.split(' ').slice(1).join(' ') || '',
        status: userData.status || 'active'
      });
      
    } catch (err) {
      console.error('Failed to fetch user details:', err);
      setError('Failed to load user details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivity = async () => {
    if (!user || activityLoading || !activityHasMore) return;
    
    setActivityLoading(true);
    try {
      const activityData = await userService.getUserActivity(userId, activityPage);
      
      if (activityPage === 1) {
        setRecentActivity(activityData.activities);
      } else {
        setRecentActivity(prev => [...prev, ...activityData.activities]);
      }
      
      setActivityHasMore(activityData.activities.length > 0 && activityData.pagination.hasNextPage);
    } catch (err) {
      console.error('Failed to fetch user activity:', err);
      setError('Failed to load user activity. Please try again.');
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    console.log('UserDetail component mounted with ID:', userId);
    fetchUserData();
    return () => {
      console.log('UserDetail component unmounting');
    };
  }, [userId]);

  useEffect(() => {
    if (user) {
      if (user.role && predefinedRoles[user.role.toLowerCase()]) {
        setSelectedRole(user.role.toLowerCase());
        setUserPermissions(predefinedRoles[user.role.toLowerCase()].permissions);
        setIsCustomRole(false);
      } else {
        setSelectedRole('custom');
        setUserPermissions(user.permissions || []);
        setIsCustomRole(true);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user && tabValue === 2) {
      fetchUserActivity();
    }
  }, [user, tabValue, activityPage]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleBack = () => {
    navigate('/users');
  };

  const handleRefresh = () => {
    fetchUserData();
  };

  const handleEditUser = () => {
    setEditMode(true);
    setEditedUser({
      ...user,
      first_name: user.name?.split(' ')[0] || '',
      last_name: user.name?.split(' ').slice(1).join(' ') || ''
    });
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedUser(null);
  };

  const handleSaveUser = async () => {
    try {
      setLoading(true);
      const updateData = prepareUserUpdateData(editedUser);
      const updatedUser = await userService.updateUser(userId, updateData);
      
      setUser(updatedUser);
      setEditMode(false);
      setEditedUser(null);
      setSuccessMessage('User updated successfully');
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to update user:', err);
      setError('Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = (e) => {
    setEditedUser(prev => ({
      ...prev,
      status: e.target.value
    }));
  };

  const handleDeleteUser = async () => {
    try {
      setLoading(true);
      await userService.deleteUser(userId);
      navigate('/users');
    } catch (err) {
      console.error(`Failed to delete user ${userId}:`, err);
      setError('Failed to delete user. Please try again.');
      setLoading(false);
    }
  };

  const handleRoleChange = (event) => {
    const role = event.target.value;
    setSelectedRole(role);
    
    if (role === 'custom') {
      setIsCustomRole(true);
    } else {
      setIsCustomRole(false);
      setUserPermissions(predefinedRoles[role].permissions);
      setPermissionChanged(true);
    }
  };

  const handlePermissionToggle = (permissionId) => {
    setUserPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
    
    if (!isCustomRole) {
      setSelectedRole('custom');
      setIsCustomRole(true);
    }
    
    setPermissionChanged(true);
  };

  const handleLoadMoreActivity = () => {
    setActivityPage(prev => prev + 1);
  };

  return {
    // State
    loading,
    user,
    error,
    successMessage,
    editMode,
    editedUser,
    tabValue,
    userPermissions,
    selectedRole,
    isCustomRole,
    permissionChanged,
    recentActivity,
    activityLoading,
    activityHasMore,
    
    // Handlers
    handleTabChange,
    handleBack,
    handleRefresh,
    handleEditUser,
    handleCancelEdit,
    handleSaveUser,
    handleInputChange,
    handleStatusChange,
    handleDeleteUser,
    handleRoleChange,
    handlePermissionToggle,
    handleLoadMoreActivity,
    
    // Setters
    setError,
    setSuccessMessage
  };
};

export default useUserDetail;