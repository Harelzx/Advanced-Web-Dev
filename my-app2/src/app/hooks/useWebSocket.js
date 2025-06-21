'use client';

import { useState, useEffect, useRef } from 'react';

export default function useWebSocket(url = 'ws://localhost:8080') {
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const ws = useRef(null);

  useEffect(() => {
    // Create WebSocket connection
    ws.current = new WebSocket(url);

    // Connection opened
    ws.current.onopen = () => {
      setConnectionStatus('Connected');
      console.log('WebSocket connection established');
    };

    // Listen for messages
    ws.current.onmessage = (event) => {
      try {
        const messageData = JSON.parse(event.data);
        console.log('Received message:', messageData);
        
        // Add new message to state (real-time)
        setMessages(prev => [...prev, messageData]);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    // Connection closed
    ws.current.onclose = () => {
      setConnectionStatus('Disconnected');
      console.log('WebSocket connection closed');
    };

    // Connection error
    ws.current.onerror = (error) => {
      setConnectionStatus('Error');
      console.error('WebSocket error:', error);
    };

    // Cleanup on unmount
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url]);

  // Function to send message
  const sendMessage = (messageData) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message = {
        ...messageData,
        timestamp: new Date().toISOString()
      };
      
      ws.current.send(JSON.stringify(message));
      console.log('Message sent:', message);
    } else {
      console.error('WebSocket is not connected');
    }
  };

  return {
    messages,
    connectionStatus,
    sendMessage,
    setMessages // For loading history from Firebase
  };
} 