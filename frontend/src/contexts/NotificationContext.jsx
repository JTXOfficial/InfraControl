import { createContext, useContext, useEffect, useState } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Creates a task completion notification
  const createTaskCompletionNotification = (message) => {
    const newNotification = {
      id: `task-${Date.now()}`,
      type: 'task',
      title: 'Task Completed',
      message,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Optional: Display browser notification if supported
    if (window.Notification && Notification.permission === 'granted') {
      new Notification('Task Completed', { body: message });
    }
    
    return true;
  };

  // Mark a notification as read
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
    
    // Update unread count
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({
        ...notification,
        read: true
      }))
    );
    setUnreadCount(0);
  };

  // Delete a notification
  const deleteNotification = (id) => {
    const notification = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    // Update unread count if needed
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Delete all notifications
  const deleteAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Filter functions
  const getUnreadNotifications = () => notifications.filter(n => !n.read);
  const getErrorNotifications = () => notifications.filter(n => n.type === 'error');
  const getWarningNotifications = () => notifications.filter(n => n.type === 'warning');
  const getInfoNotifications = () => notifications.filter(n => n.type === 'info');
  const getSuccessNotifications = () => notifications.filter(n => n.type === 'success');
  const getTaskNotifications = () => notifications.filter(n => n.type === 'task');

  // Request notification permission on mount
  useEffect(() => {
    if (window.Notification && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  // Context value
  const value = {
    notifications,
    unreadCount,
    loading,
    createTaskCompletionNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    getUnreadNotifications,
    getErrorNotifications,
    getWarningNotifications,
    getInfoNotifications,
    getSuccessNotifications,
    getTaskNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext; 