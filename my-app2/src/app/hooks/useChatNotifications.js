'use client';

import { useEffect, useRef } from 'react';

/**
 * Custom hook for managing chat notifications
 * Handles duplicate prevention, active chat filtering, and notification display
 */
export function useChatNotifications({
  webSocketMessages,
  showChat,
  selectedPartner,
  userRole,
  showChatNotification
}) {
  // Track notified messages to prevent duplicates
  const notifiedMessagesRef = useRef(new Set());

  useEffect(() => {
    if (webSocketMessages.length > 0) {
      // Get the most recent message from WebSocket
      const lastMessage = webSocketMessages[webSocketMessages.length - 1];
      
      // Create unique message ID to prevent duplicate notifications
      const messageId = `${lastMessage.timestamp}-${lastMessage.text}-${lastMessage.sender}`;
      
      // Skip if we've already shown notification for this message
      if (notifiedMessagesRef.current.has(messageId)) {
        return;
      }
      
      // Only show notifications for messages from other users (not self)
      const isFromOtherUser = lastMessage.sender !== userRole;
      
      // Check if message is from currently active chat partner
      // If so, we don't show notification since user is already in conversation
      let isFromCurrentChatPartner = false;
      if (showChat && selectedPartner) {
        // For teachers: check if message is from the parent they're chatting with
        if (userRole === 'teacher' && lastMessage.sender === 'parent') {
          isFromCurrentChatPartner = lastMessage.parentId === selectedPartner.id;
        }
        // For parents: check if message is from the teacher they're chatting with
        else if (userRole === 'parent' && lastMessage.sender === 'teacher') {
          isFromCurrentChatPartner = lastMessage.teacherId === selectedPartner.id;
        }
      }
      
      if (isFromOtherUser) {
        // Track this message as notified to prevent duplicates
        notifiedMessagesRef.current.add(messageId);
        
        // Prevent memory bloat by keeping only last 100 notified messages
        if (notifiedMessagesRef.current.size > 100) {
          const sortedArray = Array.from(notifiedMessagesRef.current);
          notifiedMessagesRef.current = new Set(sortedArray.slice(-100));
        }
        
        // Show notification only if user is not actively chatting with sender
        if (!isFromCurrentChatPartner) {
          const senderRole = lastMessage.sender;
          const senderName = senderRole === 'teacher' ? 'מורה' : 'הורה';
          showChatNotification(senderName, lastMessage.text, senderRole);
        }
      }
    }
  }, [webSocketMessages, showChat, selectedPartner, userRole, showChatNotification]);

  // Return cleanup function if needed
  return {
    clearNotificationHistory: () => {
      notifiedMessagesRef.current.clear();
    }
  };
}