'use client';

import { useState } from 'react';
import { useDashboardLogic } from '../hooks/useDashboardLogic';
import Navbar from '../components/Navbar';
import TeacherView from '../components/dashboard/TeacherView';
import ParentView from '../components/dashboard/ParentView';
import AddStudentModal from '../components/dashboard/AddStudentModal';
import RemoveStudentModal from '../components/dashboard/RemoveStudentModal';
import EditProfileModal from '../components/dashboard/EditProfileModal';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatPartnersList from '../components/chat/ChatPartnersList';
import useNotifications from '../hooks/useNotifications';
import NotificationToast from '../components/notifications/NotificationToast';
import useWebSocket from '../hooks/useWebSocket';
import { useChatNotifications } from '../hooks/useChatNotifications';
import { useChatHandlers } from '../hooks/useChatHandlers';
import LoadingWheel from '../components/LoadingWheel';
import DashboardError from '../components/dashboard/DashboardError';
import ErrorBoundary from '../components/dashboard/ErrorBoundary';

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
    currentUserData,
    loading, 
    error, 
    refreshData,
    updateUserName
  } = useDashboardLogic();
  
  // --- UI State Management ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  
  // --- Chat State Management ---
  const {
    showChat,
    showPartnersList,
    selectedPartner,
    handleOpenChat,
    handleSelectPartner,
    handleCloseChat,
    handleClosePartnersList
  } = useChatHandlers();
  const [unreadCount, setUnreadCount] = useState(0);
  
  // --- Notifications ---
  const { notifications, removeNotification, showChatNotification } = useNotifications();
  
  // --- WebSocket Connection ---
  const { connectionStatus, messages: webSocketMessages } = useWebSocket(currentUserId, userRole, userName);
  
  // --- Chat Notifications ---
  useChatNotifications({
    webSocketMessages,
    showChat,
    selectedPartner,
    userRole,
    showChatNotification
  });

  
  // --- Modal Handlers ---
  const openRemoveModal = (student) => {
    setStudentToRemove(student);
    setShowRemoveModal(true);
  };

  const closeRemoveModal = () => {
    setStudentToRemove(null);
    setShowRemoveModal(false);
  };

  const handleEditProfile = () => {
    setShowEditProfileModal(true);
  };

  const closeEditProfileModal = () => {
    setShowEditProfileModal(false);
  };

  const handleProfileUpdated = (updatedUserData) => {
    // Update the userName in the navbar immediately
    updateUserName(updatedUserData.fullName);
    // Refresh dashboard data to update currentUserData in the hook
    refreshData();
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
    <ErrorBoundary>
      <div className="min-h-screen panels">
        <Navbar 
          isDashboard={true}
          userRole={userRole} 
          userName={userName}
          onOpenChat={handleOpenChat}
          onAddStudent={() => setShowAddModal(true)}
          onAddChild={() => setShowAddModal(true)}
          onEditProfile={handleEditProfile}
          unreadCount={unreadCount}
        />
        <main className="p-4 space-y-6 pt-20" dir="rtl">
      
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
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={closeEditProfileModal}
        currentUser={currentUserData}
        onProfileUpdated={handleProfileUpdated}
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
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;