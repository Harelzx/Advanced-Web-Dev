'use client';

import DashboardView from './DashboardView';

// Teacher-specific configuration for the shared DashboardView component
const teacherConfig = {
  userRole: 'teacher',
  userDisplayName: 'Teacher User',
  stats: {
    totalTitle: 'מספר תלמידים',
    averageTitle: 'ציון ממוצע כיתתי'
  },
  communication: {
    description: 'שלח הודעות והתעדכן עם הורי התלמידים',
    partnerRole: 'parent',
    onlineUsersLabel: 'הורים מחוברים'
  },
  list: {
    title: 'רשימת תלמידים',
    emptyMessage: 'עדיין לא נוספו תלמידים לכיתה שלך',
    emptyDescription: 'כדי להתחיל לעקוב אחר התקדמות התלמידים שלך, לחץ על הכפתור למטה להוספת תלמיד/ה',
    addButtonText: 'הוסף תלמיד/ה ראשון/ה'
  }
};

/**
 * Teacher dashboard view component
 * Uses shared DashboardView with teacher-specific configuration
 */
const TeacherView = ({ 
  studentsData, 
  onAddStudent, 
  onRemoveStudent, 
  onOpenChat,
  currentUserId,
  connectionStatus,
  onUnreadCountChange
}) => {
  return (
    <DashboardView
      studentsData={studentsData}
      currentUserId={currentUserId}
      connectionStatus={connectionStatus}
      onAdd={onAddStudent}
      onRemove={onRemoveStudent}
      onOpenChat={onOpenChat}
      onUnreadCountChange={onUnreadCountChange}
      config={teacherConfig}
    />
  );
};

export default TeacherView;