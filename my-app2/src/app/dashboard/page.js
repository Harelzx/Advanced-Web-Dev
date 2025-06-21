'use client';

import { useState } from 'react';
import { useDashboardLogic } from '../hooks/useDashboardLogic';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import TeacherView from '../components/dashboard/TeacherView';
import ParentView from '../components/dashboard/ParentView';
import AddStudentModal from '../components/dashboard/AddStudentModal';
import RemoveStudentModal from '../components/dashboard/RemoveStudentModal';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatPartnersList from '../components/chat/ChatPartnersList';
import useNotifications from '../hooks/useNotifications';
import NotificationToast from '../components/notifications/NotificationToast';
import useWebSocket from '../hooks/useWebSocket';

/**
 * Main Dashboard Component
 * This component serves as the central hub for both teachers and parents.
 */
const Dashboard = () => {
  // --- Logic Layer ---
  // The hook provides all necessary data and functions.
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
  // State for managing the visibility of modals.
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  
  // --- Chat State Management ---
  const [showChat, setShowChat] = useState(false);
  const [showPartnersList, setShowPartnersList] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // --- Notifications ---
  const { notifications, removeNotification } = useNotifications();
  
  // --- WebSocket Connection ---
  const { connectionStatus } = useWebSocket();
  
  // --- Modal Handlers ---
  const openRemoveModal = (student) => {
    setStudentToRemove(student);
    setShowRemoveModal(true);
  };

  const closeRemoveModal = () => {
    setStudentToRemove(null);
    setShowRemoveModal(false);
  };

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

  // --- Render Loading State ---
  if (loading) {
    return (
      <main className="p-4 space-y-6" dir="rtl">
        <div className="panels p-6 border rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">טוען את לוח הבקרה...</p>
        </div>
      </main>
    );
  }

  // --- Render Error State ---
  if (error) {
    return (
      <main className="p-4 space-y-6" dir="rtl">
        <div className="panels p-6 border rounded-lg shadow-lg text-center">
          <div className="text-red-600 mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <p className="text-red-700 font-medium mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            נסה שוב
          </button>
        </div>
      </main>
    );
  }

  // --- Main Render ---
  return (
    <>
      <main className="p-4 space-y-6" dir="rtl">
        <DashboardHeader 
          userRole={userRole} 
          userName={userName}
          onOpenChat={handleOpenChat}
          onAddStudent={() => setShowAddModal(true)}
          onAddChild={() => setShowAddModal(true)}
          unreadCount={unreadCount}
        />
        
        <div className="panels p-6 border rounded-lg shadow-lg">
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
            <div className="panels p-4 rounded-lg shadow text-center">
              <p className="text-gray-700">טוען את לוח הבקרה...</p>
            </div>
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