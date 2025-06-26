'use client';

import { useState, useEffect, useRef } from 'react';
import { useDashboardLogic } from '../hooks/useDashboardLogic';
import Navbar from '../components/Navbar';
import TeacherView from '../components/dashboard/TeacherView';
import ParentView from '../components/dashboard/ParentView';
import AddStudentModal from '../components/dashboard/AddStudentModal';
import RemoveStudentModal from '../components/dashboard/RemoveStudentModal';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatPartnersList from '../components/chat/ChatPartnersList';
import useNotifications from '../hooks/useNotifications';
import NotificationToast from '../components/notifications/NotificationToast';
import useWebSocket from '../hooks/useWebSocket';
import LoadingWheel from '../components/LoadingWheel';
import DashboardError from '../components/dashboard/DashboardError';

/**
 * Main Dashboard Component
 * This component serves as the central hub for both teachers and parents.
 */
const Dashboard = () => {
  // --- Logic Layer ---
  const { 
    userRole, 
    userName, 
    studentsData, 
    currentUserId, 
    loading, 
    error, 
    refreshData 
  } = useDashboardLogic();
  
  // --- UI State Management ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  
  // --- Chat State Management ---
  const [showChat, setShowChat] = useState(false);
  const [showPartnersList, setShowPartnersList] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifiedMessagesRef = useRef(new Set());
  
  // --- Notifications ---
  const { notifications, removeNotification, showChatNotification } = useNotifications();
  
  // --- WebSocket Connection ---
  const { connectionStatus, sendMessage, messages: webSocketMessages } = useWebSocket(currentUserId, userRole, userName);

  // --- Chat Handlers ---
  const handleOpenChat = () => {
    setShowPartnersList(true);
  };

  const handleSelectPartner = (partnerId, partnerName, partnerRole) => {
    setSelectedPartner({
      id: partnerId,
      name: partnerName,
      role: partnerRole
    });
    setShowPartnersList(false);
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setSelectedPartner(null);
  };

  const handleClosePartnersList = () => {
    setShowPartnersList(false);
  };

  // --- Chat Notifications Logic ---
  useEffect(() => {
    if (webSocketMessages.length > 0) {
      const lastMessage = webSocketMessages[webSocketMessages.length - 1];
      
      const messageId = `${lastMessage.timestamp}-${lastMessage.text}-${lastMessage.sender}`;
      
      if (notifiedMessagesRef.current.has(messageId)) {
        return;
      }
      
      const isFromOtherUser = lastMessage.sender !== userRole;
      
      let isFromCurrentChatPartner = false;
      if (showChat && selectedPartner) {
        if (userRole === 'teacher' && lastMessage.sender === 'parent') {
          isFromCurrentChatPartner = lastMessage.parentId === selectedPartner.id;
        }
        else if (userRole === 'parent' && lastMessage.sender === 'teacher') {
          isFromCurrentChatPartner = lastMessage.teacherId === selectedPartner.id;
        }
      }
      
      if (isFromOtherUser) {
        notifiedMessagesRef.current.add(messageId);
        
        if (notifiedMessagesRef.current.size > 100) {
          const sortedArray = Array.from(notifiedMessagesRef.current);
          notifiedMessagesRef.current = new Set(sortedArray.slice(-100));
        }
        
        if (!isFromCurrentChatPartner) {
          const senderRole = lastMessage.sender;
          const senderName = senderRole === 'teacher' ? 'מורה' : 'הורה';
          showChatNotification(senderName, lastMessage.text, senderRole);
        }
      }
    }
  }, [webSocketMessages, showChat, selectedPartner, userRole, showChatNotification]);

  // --- Modal Handlers ---
  const openRemoveModal = (student) => {
    setStudentToRemove(student);
    setShowRemoveModal(true);
  };

  const closeRemoveModal = () => {
    setStudentToRemove(null);
    setShowRemoveModal(false);
  };

  // --- Render Loading State ---
  if (loading) {
    return <LoadingWheel title="טוען את לוח הבקרה..." message="אנא המתן בזמן שאנו מעבדים את הנתונים." />;
  }

  // --- Render Error State ---
  if (error) {
    return <DashboardError message={error} />;
  }

  // --- Main Render ---
  return (
    <>
      <Navbar 
        isDashboard={true}
        userRole={userRole} 
        userName={userName}
        onOpenChat={handleOpenChat}
        onAddStudent={() => setShowAddModal(true)}
        onAddChild={() => setShowAddModal(true)}
        unreadCount={unreadCount}
      />
      <main className="p-4 space-y-6 mt-16" dir="rtl">
      
      <div className="panels p-6 rounded-lg shadow-lg">
        {userRole === 'teacher' ? (
          <TeacherView 
            studentsData={studentsData} 
            onAddStudent={() => setShowAddModal(true)}
            onRemoveStudent={openRemoveModal}
              onOpenChat={handleOpenChat}
              currentUserId={currentUserId}
              connectionStatus={connectionStatus}
              onUnreadCountChange={setUnreadCount}
          />
        ) : userRole === 'parent' ? (
          <ParentView 
            studentsData={studentsData}
            onAddChild={() => setShowAddModal(true)}
            onRemoveChild={openRemoveModal}
              onOpenChat={handleOpenChat}
              currentUserId={currentUserId}
              connectionStatus={connectionStatus}
              onUnreadCountChange={setUnreadCount}
          />
        ) : (
          <LoadingWheel title="מזהה תפקיד משתמש..." message="אנא המתן רגע." />
        )}
      </div>
      
      {/* Modals for adding/removing students */}
      <AddStudentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        userRole={userRole}
        userId={currentUserId}
        onStudentAdded={refreshData}
      />
      <RemoveStudentModal
        isOpen={showRemoveModal}
        onClose={closeRemoveModal}
        student={studentToRemove}
        userRole={userRole}
        userId={currentUserId}
        onStudentRemoved={refreshData}
      />

        {/* Chat Partners List Modal */}
        {showPartnersList && (
          <ChatPartnersList
            currentUserId={currentUserId}
            currentUserRole={userRole}
            onSelectPartner={handleSelectPartner}
            onClose={handleClosePartnersList}
          />
        )}

        {/* Chat Sidebar */}
        {showChat && selectedPartner && (
          <ChatSidebar
            isOpen={showChat}
            onClose={handleCloseChat}
            currentUserId={currentUserId}
            currentUserRole={userRole}
            chatPartnerId={selectedPartner.id}
            chatPartnerName={selectedPartner.name}
          />
        )}
    </main>

      {/* Notifications */}
      <NotificationToast
        notifications={notifications}
        onRemove={removeNotification}
      />
    </>
  );
};

export default Dashboard;