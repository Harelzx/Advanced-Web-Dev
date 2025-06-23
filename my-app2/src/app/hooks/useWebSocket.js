'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Global variables to maintain single WebSocket connection
let globalWS = null;
let globalConnectionStatus = 'Disconnected';
let globalOnlineUsers = [];
let globalMessages = [];
let userInfoSent = false;
let listeners = new Set();

const useWebSocket = (userId, userRole, userName) => {
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]);

  const wsUrl = 'wss://websocket-chat-server-gwjc.onrender.com/';

  // Create listener for this component instance
  const createListener = useCallback(() => {
    const listener = {
      onStatusChange: (status) => {
        setConnectionStatus(status);
      },
      onUsersUpdate: (users) => {
        setOnlineUsers(users);
      },
      onMessagesUpdate: (msgs) => {
        setMessages(msgs);
      }
    };

    listeners.add(listener);
    
    // Update with current global state
    listener.onStatusChange(globalConnectionStatus);
    listener.onUsersUpdate([...globalOnlineUsers]);
    listener.onMessagesUpdate([...globalMessages]);

    return listener;
  }, []);

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
            globalMessages = [...globalMessages, data];
            listeners.forEach(listener => {
              listener.onMessagesUpdate([...globalMessages]);
            });
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

  return {
    connectionStatus,
    onlineUsers,
    messages,
    sendMessage
  };
};

export default useWebSocket; 