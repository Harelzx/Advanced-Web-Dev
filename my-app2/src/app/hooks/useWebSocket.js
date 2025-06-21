'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Global WebSocket instance to prevent multiple connections in Strict Mode
let globalWS = null;
let globalConnectionStatus = 'Disconnected';
let globalOnlineUsers = [];
let globalMessages = [];
let listeners = new Set();
let connectionAttempts = 0;
let isConnecting = false;
let cleanupTimeout = null;

const useWebSocket = () => {
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const userInfoSent = useRef(false);
  const listenerRef = useRef(null);
  const isActive = useRef(true);

  // Create listener function
  const createListener = useCallback(() => {
    return {
      id: Math.random().toString(36).substr(2, 9),
      onMessage: (data) => {
        if (isActive.current) {
          setMessages(prev => [...prev, data]);
        }
      },
      onStatusChange: (status) => {
        if (isActive.current) {
          setConnectionStatus(status);
        }
      },
      onUsersUpdate: (users) => {
        if (isActive.current) {
          setOnlineUsers(users);
        }
      }
    };
  }, []);

  const connectWebSocket = useCallback(() => {
    // Clear any pending cleanup
    if (cleanupTimeout) {
      clearTimeout(cleanupTimeout);
      cleanupTimeout = null;
    }

    // If global WebSocket exists and is connected, just sync state
    if (globalWS && globalWS.readyState === WebSocket.OPEN) {
      if (isActive.current) {
        setConnectionStatus(globalConnectionStatus);
        setOnlineUsers(globalOnlineUsers);
        setMessages(globalMessages);
      }
      return;
    }

    // If connection is in progress, wait
    if (isConnecting || (globalWS && globalWS.readyState === WebSocket.CONNECTING)) {
      return;
    }

    // Close existing connection if any
    if (globalWS && globalWS.readyState !== WebSocket.CLOSED) {
      globalWS.close(1000, 'Reconnecting');
    }

    isConnecting = true;
    
    try {
      globalWS = new WebSocket('ws://localhost:8080');

      globalWS.onopen = () => {
        globalConnectionStatus = 'Connected';
        reconnectAttempts.current = 0;
        userInfoSent.current = false;
        isConnecting = false;
        
        // Notify all listeners
        listeners.forEach(listener => {
          listener.onStatusChange('Connected');
        });
      };

      globalWS.onmessage = (event) => {
        try {
          const messageData = JSON.parse(event.data);
          
          if (messageData.type === 'online_users') {
            globalOnlineUsers = messageData.users;
            
            // Notify all listeners
            listeners.forEach(listener => {
              listener.onUsersUpdate(messageData.users);
            });
          } else if (messageData.type === 'chat' && messageData.text) {
            globalMessages.push(messageData);
            
            // Notify all listeners
            listeners.forEach(listener => {
              listener.onMessage(messageData);
            });
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      globalWS.onclose = (event) => {
        globalConnectionStatus = 'Disconnected';
        globalOnlineUsers = [];
        userInfoSent.current = false;
        isConnecting = false;
        
        // Notify all listeners
        listeners.forEach(listener => {
          listener.onStatusChange('Disconnected');
          listener.onUsersUpdate([]);
        });
        
        // Only attempt to reconnect for unexpected closures and if we have active listeners
        if (!event.wasClean && event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts && listeners.size > 0) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
          reconnectAttempts.current++;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (listeners.size > 0) { // Double check we still have listeners
              connectWebSocket();
            }
          }, delay);
        }
      };

      globalWS.onerror = (error) => {
        console.error('WebSocket error occurred');
        globalConnectionStatus = 'Error';
        isConnecting = false;
        
        // Notify all listeners
        listeners.forEach(listener => {
          listener.onStatusChange('Error');
        });
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      globalConnectionStatus = 'Error';
      isConnecting = false;
      
      // Notify all listeners
      listeners.forEach(listener => {
        listener.onStatusChange('Error');
      });
    }
  }, []);

  useEffect(() => {
    // Mark as active
    isActive.current = true;

    // Create and register listener
    const listener = createListener();
    listenerRef.current = listener;
    listeners.add(listener);

    // Sync with global state
    if (isActive.current) {
      setConnectionStatus(globalConnectionStatus);
      setOnlineUsers(globalOnlineUsers);
      setMessages(globalMessages);
    }

    // Connect if needed
    connectWebSocket();

    // Cleanup on unmount
    return () => {
      // Mark as inactive immediately
      isActive.current = false;
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      // Remove listener
      if (listenerRef.current) {
        listeners.delete(listenerRef.current);
      }
      
      // Schedule cleanup with delay to handle React Strict Mode
      if (listeners.size === 0) {
        cleanupTimeout = setTimeout(() => {
          if (listeners.size === 0 && globalWS && globalWS.readyState !== WebSocket.CLOSED) {
            globalWS.close(1000, 'All components unmounted');
            globalWS = null;
            globalConnectionStatus = 'Disconnected';
            globalOnlineUsers = [];
            globalMessages = [];
            isConnecting = false;
          }
        }, 100); // Small delay to handle React Strict Mode double unmount/mount
      }
    };
  }, [connectWebSocket, createListener]);

  const sendMessage = useCallback((messageData) => {
    if (globalWS && globalWS.readyState === WebSocket.OPEN) {
      const fullMessage = {
        ...messageData,
        type: 'chat'
      };
      
      try {
        globalWS.send(JSON.stringify(fullMessage));
      } catch (error) {
        console.error('Error sending message:', error);
      }
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);

  const sendUserInfo = useCallback((userId, role, name) => {
    if (globalWS && globalWS.readyState === WebSocket.OPEN && !userInfoSent.current) {
      const userInfo = {
        type: 'user_info',
        userId,
        role,
        name
      };
      
      try {
        globalWS.send(JSON.stringify(userInfo));
        userInfoSent.current = true;
      } catch (error) {
        console.error('Error sending user info:', error);
      }
    } else if (!userInfoSent.current) {
      console.error('Cannot send user info - WebSocket not connected');
    }
  }, []);

  const sendUserOffline = useCallback((userId) => {
    if (globalWS && globalWS.readyState === WebSocket.OPEN) {
      const offlineInfo = {
        type: 'user_offline',
        userId
      };
      
      try {
        globalWS.send(JSON.stringify(offlineInfo));
      } catch (error) {
        console.error('Error sending user offline:', error);
      }
    }
  }, []);

  return {
    messages,
    setMessages,
    connectionStatus,
    onlineUsers,
    sendMessage,
    sendUserInfo,
    sendUserOffline
  };
};

export default useWebSocket; 