'use client'
import { useState } from 'react';
import { useDashboardLogic } from '../hooks/useDashboardLogic';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import TeacherView from '../components/dashboard/TeacherView';
import ParentView from '../components/dashboard/ParentView';
import AddStudentModal from '../components/dashboard/AddStudentModal';
import RemoveStudentModal from '../components/dashboard/RemoveStudentModal';

/**
 * The main component for the Dashboard page.
 * This component is responsible for the UI and layout of the dashboard.
 * It uses the useDashboardLogic hook to handle all business logic and data fetching,
 * keeping this component lean and focused on presentation.
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
    return (
      <main className="p-4 space-y-6">
        <div className="bg-white p-6 border rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  // --- Render Error State ---
  if (error) {
    return (
      <main className="p-4 space-y-6">
        <div className="bg-white p-6 border rounded-lg shadow-lg text-center">
          <div className="text-red-600 mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <p className="text-red-700 font-medium mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  // --- Main Render ---
  return (
    <main className="p-4 space-y-6">
      <DashboardHeader userRole={userRole} userName={userName} />
      
      <div className="bg-white p-6 border rounded-lg shadow-lg">
        {userRole === 'teacher' ? (
          <TeacherView 
            studentsData={studentsData} 
            onAddStudent={() => setShowAddModal(true)}
            onRemoveStudent={openRemoveModal}
          />
        ) : userRole === 'parent' ? (
          <ParentView 
            studentsData={studentsData}
            onAddChild={() => setShowAddModal(true)}
            onRemoveChild={openRemoveModal}
          />
        ) : (
          <div className="bg-gray-100 p-4 rounded-lg shadow text-center">
            <p className="text-gray-700">Loading dashboard...</p>
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
    </main>
  );
};

export default Dashboard;