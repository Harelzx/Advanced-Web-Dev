const { WebSocketServer } = require('ws');
const admin = require('firebase-admin');

// Firebase Admin configuration using existing project settings
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'web2025-592b4'
});

const db = admin.firestore();

// Create WebSocket Server on port 8080
const wss = new WebSocketServer({ port: 8080 });

console.log('WebSocket server started on port 8080');

// Function to save message to Firebase
async function saveToFirebase(messageData) {
  try {
    const { teacherId, parentId, text, sender } = messageData;
    const chatId = `${teacherId}_${parentId}`;
    
    await db.collection('chats')
      .doc(chatId)
      .collection('messages')
      .add({
        text,
        sender,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        teacherId,
        parentId
      });
    
    console.log('Message saved to Firebase');
  } catch (error) {
    console.error('Error saving to Firebase:', error);
  }
}

// WebSocket connection handler
wss.on('connection', function connection(ws) {
  console.log('New WebSocket connection established');
  
  // Handle incoming messages
  ws.on('message', function message(data) {
    try {
      const messageData = JSON.parse(data);
      console.log('Received message:', messageData);
      
      // Broadcast to all connected clients (real-time)
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });
      
      // Save to Firebase (history)
      saveToFirebase(messageData);
      
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
  
  // Handle connection close
  ws.on('close', function close() {
    console.log('WebSocket connection closed');
  });
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'system',
    text: 'Connected to chat server',
    timestamp: new Date().toISOString()
  }));
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down WebSocket server...');
  wss.close();
  process.exit(0);
}); 