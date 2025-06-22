'use client';

import { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where, getDocs, updateDoc } from 'firebase/firestore';
import useWebSocket from '../../hooks/useWebSocket';
import useNotifications from '../../hooks/useNotifications';

export default function ChatSidebar({ 
  isOpen, 
  onClose, 
  currentUserId, 
  currentUserRole, 
  chatPartnerId, 
  chatPartnerName 
}) {
  const [inputMessage, setInputMessage] = useState('');
  const [firebaseMessages, setFirebaseMessages] = useState([]);
  const { messages: webSocketMessages, connectionStatus, onlineUsers, sendMessage } = useWebSocket();
  const { showChatNotification } = useNotifications();



  // Check if chat partner is online
  const isPartnerOnline = onlineUsers.some(user => user.userId === chatPartnerId);

  // Load chat history from Firebase on component mount
  useEffect(() => {
    if (!currentUserId || !chatPartnerId) return;

    // Save chat under current user's document
    const messagesRef = collection(db, 'users', currentUserId, 'chats', chatPartnerId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const historyMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setFirebaseMessages(historyMessages);
    });

    return () => unsubscribe();
  }, [currentUserId, chatPartnerId, currentUserRole]);

  // Show notification for new WebSocket messages (only when chat is closed)
  useEffect(() => {
    if (webSocketMessages.length > 0 && !isOpen) {
      const lastMessage = webSocketMessages[webSocketMessages.length - 1];
      
      // Only show notification for messages from others
      if (lastMessage.sender !== currentUserRole) {
        const senderRole = lastMessage.sender;
        showChatNotification(chatPartnerName, lastMessage.text, senderRole);
      }
    }
  }, [webSocketMessages, isOpen, currentUserRole, chatPartnerName, showChatNotification]);

  // Combine Firebase history with real-time WebSocket messages
  // Remove duplicates by checking text, sender and similar timestamp
  const allMessages = [
    ...firebaseMessages,
    ...webSocketMessages.filter(wsMsg => 
      !firebaseMessages.some(fbMsg => 
        fbMsg.text === wsMsg.text && 
        fbMsg.sender === wsMsg.sender &&
        Math.abs(new Date(fbMsg.timestamp?.toDate?.() || fbMsg.timestamp) - new Date(wsMsg.timestamp)) < 3000
      )
    )
  ].sort((a, b) => {
    const timeA = new Date(a.timestamp?.toDate?.() || a.timestamp);
    const timeB = new Date(b.timestamp?.toDate?.() || b.timestamp);
    return timeA - timeB;
  });

  // Save message to Firebase under both users
  const saveMessageToFirebase = async (messageData) => {
    try {
      // Add read status to message
      const messageWithReadStatus = {
        ...messageData,
        read: false,
        timestamp: serverTimestamp()
      };

      // Save under current user
      const currentUserMessagesRef = collection(db, 'users', currentUserId, 'chats', chatPartnerId, 'messages');
      await addDoc(currentUserMessagesRef, messageWithReadStatus);

      // Also save under chat partner for their history
      const partnerMessagesRef = collection(db, 'users', chatPartnerId, 'chats', currentUserId, 'messages');
      await addDoc(partnerMessagesRef, messageWithReadStatus);

    } catch (error) {
      console.log('Could not save message');
    }
  };

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (!currentUserId || !chatPartnerId || !isOpen) return;

    const markMessagesAsRead = async () => {
      try {
        const messagesRef = collection(db, 'users', currentUserId, 'chats', chatPartnerId, 'messages');
        const unreadQuery = query(messagesRef, where('read', '==', false));
        const unreadSnapshot = await getDocs(unreadQuery);
        
        // Simple loop to mark messages as read
        for (const docSnapshot of unreadSnapshot.docs) {
          const messageData = docSnapshot.data();
          if (messageData.sender !== currentUserRole) {
            await updateDoc(docSnapshot.ref, { read: true });
          }
        }
      } catch (error) {
        console.log('Could not mark messages as read');
      }
    };

    markMessagesAsRead();
  }, [currentUserId, chatPartnerId, currentUserRole, isOpen]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const messageData = {
      text: inputMessage,
      sender: currentUserRole,
      teacherId: currentUserRole === 'teacher' ? currentUserId : chatPartnerId,
      parentId: currentUserRole === 'parent' ? currentUserId : chatPartnerId,
      timestamp: new Date().toISOString()
    };

    // Send via WebSocket for real-time communication
    sendMessage(messageData);
    
    // Save to Firebase for persistence
    await saveMessageToFirebase(messageData);
    
    setInputMessage('');
  };

  // Handle enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    let date;
    if (timestamp?.toDate) {
      // Firebase Timestamp
      date = timestamp.toDate();
    } else {
      // ISO string or Date object
      date = new Date(timestamp);
    }
    
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMinutes < 1) {
      return 'עכשיו';
    } else if (diffInMinutes < 60) {
      return `לפני ${diffInMinutes} דקות`;
    } else if (diffInHours < 24) {
      // For today's messages, show time
      return date.toLocaleTimeString('he-IL', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInDays === 1) {
      // For yesterday's messages, show time
      return date.toLocaleTimeString('he-IL', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInDays < 7) {
      // For this week's messages, show time
      return date.toLocaleTimeString('he-IL', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      // For older messages, show date and time
      return date.toLocaleString('he-IL', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Format date separator
  const formatDateSeparator = (timestamp) => {
    if (!timestamp) return '';
    
    let date;
    if (timestamp?.toDate) {
      date = timestamp.toDate();
    } else {
      date = new Date(timestamp);
    }
    
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'היום';
    } else if (diffInDays === 1) {
      return 'אתמול';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString('he-IL', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('he-IL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  // Check if we need a date separator
  const needsDateSeparator = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    
    const currentDate = currentMessage.timestamp?.toDate ? 
      currentMessage.timestamp.toDate() : new Date(currentMessage.timestamp);
    const previousDate = previousMessage.timestamp?.toDate ? 
      previousMessage.timestamp.toDate() : new Date(previousMessage.timestamp);
    
    return currentDate.toDateString() !== previousDate.toDateString();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-transparent z-40 pointer-events-none" />
      )}

      {/* Chat Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-96 panels shadow-xl z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {chatPartnerName?.charAt(0) || '?'}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{chatPartnerName}</h3>
              <div className="flex items-center space-x-2 space-x-reverse">
                {/* Partner online status - only show if connected to server */}
                {connectionStatus === 'Connected' && (
                  <>
                    <div className={`w-2 h-2 rounded-full ${
                      isPartnerOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-xs text-gray-500">
                      {isPartnerOnline ? 'מחובר' : 'לא מחובר'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            ✕
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 h-[calc(100vh-140px)]" dir="rtl">
          {allMessages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-lg">התחל שיחה עם {chatPartnerName}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allMessages.map((message, index) => (
                <div key={message.id || `${message.timestamp}-${index}`}>
                  {/* Date separator */}
                  {needsDateSeparator(message, allMessages[index - 1]) && (
                    <div className="flex justify-center my-4">
                      <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                        {formatDateSeparator(message.timestamp)}
                      </span>
                    </div>
                  )}
                  
                  {/* Message */}
                  <div
                    className={`flex flex-col ${
                      message.sender === currentUserRole ? 'items-start' : 'items-end'
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                        message.sender === currentUserRole
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {message.text}
                    </div>
                    <span className={`text-xs text-gray-500 mt-1 px-1 ${
                      message.sender === currentUserRole ? 'text-right' : 'text-left'
                    }`}>
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex space-x-2 space-x-reverse">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="הקלד הודעה..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              dir="rtl"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || connectionStatus !== 'Connected'}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
            >
              שלח
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 