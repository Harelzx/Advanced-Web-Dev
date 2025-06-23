const WebSocket = require('ws');

const port = process.env.PORT || 8080;

// Create WebSocket server
const wss = new WebSocket.Server({ port });

// Store connected clients and online users
const connectedClients = new Map();
const onlineUsers = new Map();

// WebSocket connection handler
wss.on('connection', function connection(ws) {
  // Generate unique client ID
  const clientId = Math.random().toString(36).substr(2, 9);
  connectedClients.set(clientId, { ws, userInfo: null });
  
  // Handle incoming messages
  ws.on('message', function message(data) {
    try {
      const messageData = JSON.parse(data.toString());
      
      // Handle user info
      if (messageData.type === 'user_info') {
        const clientInfo = connectedClients.get(clientId);
        if (clientInfo) {
          clientInfo.userInfo = messageData;
          connectedClients.set(clientId, clientInfo);
        }
        
        // Update online users
        onlineUsers.set(messageData.userId, {
          name: messageData.name,
          role: messageData.role,
          lastSeen: new Date().toISOString()
        });
        
        // Broadcast updated online users list
        broadcastOnlineUsers();
        return;
      }
      
      // Handle user going offline
      if (messageData.type === 'user_offline') {
        onlineUsers.delete(messageData.userId);
        broadcastOnlineUsers();
        return;
      }
      
      // Handle chat messages
      if (messageData.type === 'chat') {
        // Broadcast message to all connected clients
        const messageToSend = JSON.stringify(messageData);
        wss.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(messageToSend);
          }
        });
      }
      
    } catch (error) {
      // Silent error handling
    }
  });
  
  // Handle connection close
  ws.on('close', function close() {
    const clientInfo = connectedClients.get(clientId);
    if (clientInfo && clientInfo.userInfo) {
      // Remove user from online list
      onlineUsers.delete(clientInfo.userInfo.userId);
      broadcastOnlineUsers();
    }
    
    connectedClients.delete(clientId);
  });
  
  // Send welcome message
  const welcomeMessage = JSON.stringify({
    type: 'system',
    text: 'Connected to chat server',
    timestamp: new Date().toISOString()
  });
  
  ws.send(welcomeMessage);
});

// Broadcast online users to all clients
function broadcastOnlineUsers() {
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
      client.send(onlineMessage);
    }
  });
}

// Periodic cleanup of inactive users (every 5 minutes)
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
}, 5 * 60 * 1000);

console.log(`WebSocket server started on port ${port}`);

