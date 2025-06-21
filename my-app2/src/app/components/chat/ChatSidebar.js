'use client';

import { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import useWebSocket from '../../hooks/useWebSocket';

export default function ChatSidebar({ 
  isOpen, 
  onClose, 
  currentUserId, 
  currentUserRole, 
  chatPartnerId, 
  chatPartnerName 
}) {
  const [inputMessage, setInputMessage] = useState('');
  const { messages, connectionStatus, sendMessage, setMessages } = useWebSocket();

  // Load chat history from Firebase on component mount
  useEffect(() => {
    if (!currentUserId || !chatPartnerId) return;

    const chatId = currentUserRole === 'teacher' 
      ? `${currentUserId}_${chatPartnerId}`
      : `${chatPartnerId}_${currentUserId}`;

    // Listen to Firebase for message history
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const historyMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Set initial messages from Firebase history
      setMessages(historyMessages);
    });

    return () => unsubscribe();
  }, [currentUserId, chatPartnerId, currentUserRole, setMessages]);

  // Handle sending message
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const messageData = {
      text: inputMessage,
      sender: currentUserRole,
      teacherId: currentUserRole === 'teacher' ? currentUserId : chatPartnerId,
      parentId: currentUserRole === 'parent' ? currentUserId : chatPartnerId
    };

    sendMessage(messageData);
    setInputMessage('');
  };

  // Handle enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'Connected' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-xs text-gray-500">{connectionStatus}</span>
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
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-lg">התחל שיחה עם {chatPartnerName}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div
                  key={message.id || index}
                  className={`flex ${
                    message.sender === currentUserRole ? 'justify-start' : 'justify-end'
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