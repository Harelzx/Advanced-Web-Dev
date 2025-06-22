const { WebSocketServer, WebSocket } = require('ws');

// Get port from environment variable (for Render) or default to 8080
const PORT = process.env.PORT || 8080;

// Create WebSocket Server with text mode
const wss = new WebSocketServer({ 
  port: PORT,
  perMessageDeflate: false
});

console.log(`WebSocket server started on port ${PORT}`);

// Store connected clients with their info
const connectedClients = new Map();
const onlineUsers = new Map(); // userId -> { name, role, lastSeen }

// Debounce online users broadcast to prevent spam
let broadcastTimeout = null;

// Function to broadcast online users list (debounced)
function broadcastOnlineUsers() {
  // Clear existing timeout
  if (broadcastTimeout) {
    clearTimeout(broadcastTimeout);
  }
  
  // Set new timeout to batch broadcasts
  broadcastTimeout = setTimeout(() => {
    const onlineUsersList = Array.from(onlineUsers.entries()).map(([userId, info]) => ({
      userId,
      ...info
    }));

    const onlineMessage = JSON.stringify({
      type: 'online_users',
      users: onlineUsersList,
      timestamp: new Date().toISOString()
    });


    
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(onlineMessage, { binary: false });
        } catch (error) {
          console.error('Error broadcasting online users:', error);
        }
      }
    });
    
    broadcastTimeout = null;
  }, 100); // Wait 100ms before broadcasting to batch multiple updates
}

// WebSocket connection handler
wss.on('connection', function connection(ws) {
  
  // Set binary type to handle text properly
  ws.binaryType = 'nodebuffer';
  
  // Generate unique client ID
  const clientId = Math.random().toString(36).substr(2, 9);
  connectedClients.set(clientId, { ws, userInfo: null });
  
  // Handle incoming messages
  ws.on('message', function message(data) {
    try {
      // Ensure data is converted to string
      let messageString;
      if (Buffer.isBuffer(data)) {
        messageString = data.toString('utf8');
      } else if (typeof data === 'string') {
        messageString = data;
      } else {
        messageString = String(data);
      }
      
      const messageData = JSON.parse(messageString);
      
      // Store user info if it's a connection message
      if (messageData.type === 'user_info') {
        const clientInfo = connectedClients.get(clientId);
        if (clientInfo) {
          clientInfo.userInfo = messageData;
          connectedClients.set(clientId, clientInfo);
        }
        
        // Check if user is already online to prevent duplicate broadcasts
        const existingUser = onlineUsers.get(messageData.userId);
        const now = new Date().toISOString();
        
        // Only update and broadcast if user is new or hasn't been seen recently
        if (!existingUser || new Date(now) - new Date(existingUser.lastSeen) > 5000) {
          // Update online users
          onlineUsers.set(messageData.userId, {
            name: messageData.name,
            role: messageData.role,
            lastSeen: now
          });
          

          
          // Broadcast updated online users list (debounced)
          broadcastOnlineUsers();
        }
        return;
      }
      
      // Handle user going offline (chat closed)
      if (messageData.type === 'user_offline') {
        // Remove user from online list
        onlineUsers.delete(messageData.userId);

        
        // Broadcast updated online users list (debounced)
        broadcastOnlineUsers();
        return;
      }
      
      // Handle chat messages
      if (messageData.type === 'chat') {
        // Create the message to broadcast as a string
        const messageToSend = JSON.stringify(messageData);
        
        // Broadcast message to all connected clients (including sender)
        let broadcastCount = 0;
        wss.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            try {
              client.send(messageToSend, { binary: false });
              broadcastCount++;
            } catch (sendError) {
              console.error('Error sending to client:', sendError);
            }
          }
                  });
      }
      
    } catch (error) {
      console.error('Error processing message:', error);
      console.error('Raw data:', data);
    }
  });
  
  // Handle connection close
  ws.on('close', function close() {
    const clientInfo = connectedClients.get(clientId);
    if (clientInfo && clientInfo.userInfo) {
      // Remove user from online list
      onlineUsers.delete(clientInfo.userInfo.userId);

      
      // Broadcast updated online users list (debounced)
      broadcastOnlineUsers();
    }
    
    connectedClients.delete(clientId);
  });
  
  // Send welcome message as text
  const welcomeMessage = JSON.stringify({
    type: 'system',
    text: 'Connected to chat server',
    timestamp: new Date().toISOString()
  });
  
  try {
    ws.send(welcomeMessage, { binary: false });
  } catch (error) {
    console.error('Error sending welcome message:', error);
  }
});

// Periodic cleanup of inactive users (every 30 seconds)
setInterval(() => {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  
  let removedUsers = 0;
  for (const [userId, userInfo] of onlineUsers.entries()) {
    if (new Date(userInfo.lastSeen) < fiveMinutesAgo) {
      onlineUsers.delete(userId);
      removedUsers++;
    }
  }
  
  if (removedUsers > 0) {
    broadcastOnlineUsers();
  }
}, 30000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down WebSocket server...');
  wss.close();
  process.exit(0);
}); 