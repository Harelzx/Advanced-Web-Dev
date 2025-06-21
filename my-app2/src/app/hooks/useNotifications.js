'use client';

import { useState, useEffect } from 'react';

export default function useNotifications() {
  const [permission, setPermission] = useState('default');
  const [notifications, setNotifications] = useState([]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(result => {
          setPermission(result);
        });
      }
    }
  }, []);

  // Show notification
  const showNotification = (title, options = {}) => {
    if (permission === 'granted' && 'Notification' in window) {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } else {
      // Fallback: show in-app notification
      const inAppNotification = {
        id: Date.now(),
        title,
        body: options.body,
        timestamp: new Date().toISOString()
      };
      
      setNotifications(prev => [...prev, inAppNotification]);
      
      // Auto remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== inAppNotification.id));
      }, 5000);
    }
  };

  // Show chat message notification
  const showChatNotification = (senderName, message, senderRole) => {
    const roleText = senderRole === 'teacher' ? 'מורה' : 'הורה';
    
    showNotification(`הודעה חדשה מ${roleText} ${senderName}`, {
      body: message,
      tag: 'chat-message',
      requireInteraction: false,
      silent: false
    });
  };

  // Remove notification
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  return {
    permission,
    notifications,
    showNotification,
    showChatNotification,
    removeNotification,
    clearNotifications
  };
} 