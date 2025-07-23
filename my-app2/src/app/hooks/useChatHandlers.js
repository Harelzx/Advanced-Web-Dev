'use client';

import { useState, useCallback } from 'react';

/**
 * Custom hook for managing chat-related state and handlers
 * Centralizes chat UI logic and partner selection
 */
export function useChatHandlers() {
  const [showChat, setShowChat] = useState(false);
  const [showPartnersList, setShowPartnersList] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);

  // Open chat partner selection
  const handleOpenChat = useCallback(() => {
    setShowPartnersList(true);
  }, []);

  // Select a chat partner and open chat window
  const handleSelectPartner = useCallback((partnerId, partnerName, partnerRole) => {
    setSelectedPartner({
      id: partnerId,
      name: partnerName,
      role: partnerRole
    });
    setShowPartnersList(false);
    setShowChat(true);
  }, []);

  // Close chat window
  const handleCloseChat = useCallback(() => {
    setShowChat(false);
    setSelectedPartner(null);
  }, []);

  // Close partner selection list
  const handleClosePartnersList = useCallback(() => {
    setShowPartnersList(false);
  }, []);

  return {
    // State
    showChat,
    showPartnersList,
    selectedPartner,
    
    // Handlers
    handleOpenChat,
    handleSelectPartner,
    handleCloseChat,
    handleClosePartnersList,
    
    // Direct setters for advanced use cases
    setShowChat,
    setShowPartnersList,
    setSelectedPartner
  };
}