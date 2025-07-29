'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Global variables to maintain single WebSocket connection
let globalWS = null;
let globalConnectionStatus = 'Disconnected';
let globalOnlineUsers = [];
let globalMessages = [];
let globalUnreadCounts = {}; // Track unread messages per partner
let userInfoSent = false;
let listeners = new Set();

const useWebSocket = (userId, userRole, userName) => {
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});

  const wsUrl = 'wss://advanced-web-dev.onrender.com/';

  // Create listener for this component instance
  const createListener = useCallback(() => {
    const listener = {
      userId,
      userRole,
      onStatusChange: (status) => {
        setConnectionStatus(status);
      },
      onUsersUpdate: (users) => {
        setOnlineUsers(users);
      },
      onMessagesUpdate: (msgs) => {
        setMessages(msgs);
      },
      onUnreadCountsUpdate: (counts) => {
        setUnreadCounts(counts);
      }
    };

    listeners.add(listener);
    
    // Update with current global state
    listener.onStatusChange(globalConnectionStatus);
    listener.onUsersUpdate([...globalOnlineUsers]);
    listener.onMessagesUpdate([...globalMessages]);
    listener.onUnreadCountsUpdate({...globalUnreadCounts});

    return listener;
  }, [userId, userRole]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (globalWS && globalWS.readyState === WebSocket.OPEN) {
      return;
    }

    if (globalWS && globalWS.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      globalWS = new WebSocket(wsUrl);
      globalConnectionStatus = 'Connecting';
      
      // Notify all listeners
      listeners.forEach(listener => {
        listener.onStatusChange('Connecting');
      });

      globalWS.onopen = () => {
        globalConnectionStatus = 'Connected';
        userInfoSent = false;
        
        // Notify all listeners
        listeners.forEach(listener => {
          listener.onStatusChange('Connected');
        });
      };

      globalWS.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'online_users') {
            globalOnlineUsers = data.users || [];
            listeners.forEach(listener => {
              listener.onUsersUpdate([...globalOnlineUsers]);
            });
          } else if (data.type === 'chat') {
            // Check if message already exists to prevent duplicates
            const messageExists = globalMessages.some(msg => 
              msg.text === data.text && 
              msg.sender === data.sender &&
              Math.abs(new Date(msg.timestamp) - new Date(data.timestamp)) < 5000
            );
            
            if (!messageExists) {
              globalMessages = [...globalMessages, data];
              listeners.forEach(listener => {
                listener.onMessagesUpdate([...globalMessages]);
              });
              
              // Update unread counts for recipients only
              if (data.teacherId && data.parentId) {
                // For teacher receiving from parent - only increment if teacher is not the sender
                if (data.sender === 'parent') {
                  const teacherId = data.teacherId;
                  if (globalUnreadCounts[teacherId]) {
                    globalUnreadCounts[teacherId][data.parentId] = (globalUnreadCounts[teacherId][data.parentId] || 0) + 1;
                  } else {
                    globalUnreadCounts[teacherId] = { [data.parentId]: 1 };
                  }
                }
                // For parent receiving from teacher - only increment if parent is not the sender
                else if (data.sender === 'teacher') {
                  const parentId = data.parentId;
                  if (globalUnreadCounts[parentId]) {
                    globalUnreadCounts[parentId][data.teacherId] = (globalUnreadCounts[parentId][data.teacherId] || 0) + 1;
                  } else {
                    globalUnreadCounts[parentId] = { [data.teacherId]: 1 };
                  }
                }
                
                listeners.forEach(listener => {
                  listener.onUnreadCountsUpdate({...globalUnreadCounts});
                });
              }
            }
          }
        } catch (error) {
          // Silent error handling
        }
      };

      globalWS.onerror = () => {
        if (globalWS?.readyState === WebSocket.CLOSED || globalWS?.readyState === WebSocket.CLOSING) {
          return;
        }
        
        globalConnectionStatus = 'Error';
        
        listeners.forEach(listener => {
          listener.onStatusChange('Error');
        });
      };

      globalWS.onclose = () => {
        globalConnectionStatus = 'Disconnected';
        globalWS = null;
        
        listeners.forEach(listener => {
          listener.onStatusChange('Disconnected');
        });
        
        // Auto-reconnect if we have listeners
        if (listeners.size > 0) {
          setTimeout(() => {
            if (listeners.size > 0) {
              connect();
            }
          }, 3000);
        }
      };

    } catch (error) {
      globalConnectionStatus = 'Error';
      
      listeners.forEach(listener => {
        listener.onStatusChange('Error');
      });
    }
  }, [wsUrl]);

  // Send user info when connected
  useEffect(() => {
    if (globalWS && globalWS.readyState === WebSocket.OPEN && !userInfoSent && userId) {
      const userInfo = {
        type: 'user_info',
        userId,
        role: userRole,
        name: userName
      };
      
      globalWS.send(JSON.stringify(userInfo));
      userInfoSent = true;
    }
  }, [connectionStatus, userId, userRole, userName]);

  // Setup WebSocket connection
  useEffect(() => {
    const listener = createListener();

    // Connect if needed
    connect();

    return () => {
      // Remove this listener
      listeners.delete(listener);
      
      // Close connection only if no more listeners
      if (listeners.size === 0) {
        if (globalWS && globalWS.readyState !== WebSocket.CLOSED) {
          globalWS.close();
          globalWS = null;
          globalConnectionStatus = 'Disconnected';
          globalOnlineUsers = [];
          globalMessages = [];
          globalUnreadCounts = {};
          userInfoSent = false;
        }
      }
    };
  }, [connect, createListener]);

  // Send message function
  const sendMessage = useCallback((messageData) => {
    if (globalWS && globalWS.readyState === WebSocket.OPEN) {
      globalWS.send(JSON.stringify(messageData));
    }
  }, []);

  // Mark messages as read for a specific partner
  const markMessagesAsRead = useCallback((partnerId) => {
    if (userId && globalUnreadCounts[userId] && globalUnreadCounts[userId][partnerId]) {
      globalUnreadCounts[userId][partnerId] = 0;
      listeners.forEach(listener => {
        listener.onUnreadCountsUpdate({...globalUnreadCounts});
      });
    }
  }, [userId]);

  // Get unread count for current user
  const getUserUnreadCounts = useCallback(() => {
    return globalUnreadCounts[userId] || {};
  }, [userId]);

  // Get total unread count for current user
  const getTotalUnreadCount = useCallback(() => {
    const userCounts = globalUnreadCounts[userId] || {};
    return Object.values(userCounts).reduce((total, count) => total + count, 0);
  }, [userId]);

  return {
    connectionStatus,
    onlineUsers,
    messages,
    unreadCounts: getUserUnreadCounts(),
    totalUnreadCount: getTotalUnreadCount(),
    sendMessage,
    markMessagesAsRead
  };
};

export default useWebSocket; 