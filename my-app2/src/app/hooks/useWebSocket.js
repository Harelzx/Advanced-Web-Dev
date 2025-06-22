'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Global variables for shared WebSocket connection
let globalWS = null;
let globalConnectionStatus = 'Disconnected';
let globalOnlineUsers = [];
let globalMessages = [];
let listeners = new Set();
let userInfoSent = false;

const useWebSocket = () => {
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const listenerRef = useRef(null);

  // Create listener
  const createListener = useCallback(() => {
    return {
      id: Math.random().toString(36).substr(2, 9),
      onMessage: (data) => setMessages(prev => [...prev, data]),
      onStatusChange: (status) => setConnectionStatus(status),
      onUsersUpdate: (users) => setOnlineUsers(users)
    };
  }, []);

  // Connect to WebSocket (only once globally)
  const connectWebSocket = useCallback(() => {
    if (globalWS && globalWS.readyState === WebSocket.OPEN) {
      // Already connected, just sync state
      setConnectionStatus(globalConnectionStatus);
      setOnlineUsers(globalOnlineUsers);
      setMessages(globalMessages);
      return;
    }

    if (globalWS && globalWS.readyState === WebSocket.CONNECTING) {
      // Already connecting, wait
      return;
    }

    try {
      // Use environment variable for WebSocket URL or default to localhost
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
      globalWS = new WebSocket(wsUrl);
      
      globalWS.onopen = () => {
        globalConnectionStatus = 'Connected';
        userInfoSent = false; // Reset when connection opens
        
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

      globalWS.onclose = () => {
        globalConnectionStatus = 'Disconnected';
        globalOnlineUsers = [];
        userInfoSent = false;
        
        // Notify all listeners
        listeners.forEach(listener => {
          listener.onStatusChange('Disconnected');
          listener.onUsersUpdate([]);
        });
      };

      globalWS.onerror = () => {
        globalConnectionStatus = 'Error';
        
        // Notify all listeners
        listeners.forEach(listener => {
          listener.onStatusChange('Error');
        });
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      globalConnectionStatus = 'Error';
      
      // Notify all listeners
      listeners.forEach(listener => {
        listener.onStatusChange('Error');
      });
    }
  }, []);

  useEffect(() => {
    // Create and register listener
    const listener = createListener();
    listenerRef.current = listener;
    listeners.add(listener);

    // Sync with global state
    setConnectionStatus(globalConnectionStatus);
    setOnlineUsers(globalOnlineUsers);
    setMessages(globalMessages);

    // Connect if needed
    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (listenerRef.current) {
        listeners.delete(listenerRef.current);
      }
      
      // Close connection only if no more listeners
      if (listeners.size === 0 && globalWS && globalWS.readyState !== WebSocket.CLOSED) {
        globalWS.close();
        globalWS = null;
        globalConnectionStatus = 'Disconnected';
        globalOnlineUsers = [];
        globalMessages = [];
        userInfoSent = false;
      }
    };
  }, [connectWebSocket, createListener]);

  // Send message function
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

  // Send user info function
  const sendUserInfo = useCallback((userId, role, name) => {
    if (globalWS && globalWS.readyState === WebSocket.OPEN && !userInfoSent) {
      const userInfo = {
        type: 'user_info',
        userId,
        role,
        name
      };
      
      try {
        globalWS.send(JSON.stringify(userInfo));
        userInfoSent = true;
      } catch (error) {
        console.error('Error sending user info:', error);
      }
    }
  }, []);



  return {
    messages,
    setMessages,
    connectionStatus,
    onlineUsers,
    sendMessage,
    sendUserInfo
  };
};

export default useWebSocket; 