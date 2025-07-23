'use client';

import DashboardView from './DashboardView';

// Parent-specific configuration for the shared DashboardView component
const parentConfig = {
  userRole: 'parent',
  userDisplayName: 'Parent User',
  stats: {
    totalTitle: 'מספר ילדים',
    averageTitle: 'ציון ממוצע'
  },
  communication: {
    description: 'שלח הודעות והתעדכן עם מורי הילדים',
    partnerRole: 'teacher',
    onlineUsersLabel: 'מורים מחוברים'
  },
  list: {
    title: 'רשימת ילדים',
    emptyMessage: 'עדיין לא נוספו ילדים לחשבון שלך',
    emptyDescription: 'כדי להתחיל לעקוב אחר התקדמות הילדים שלך, לחץ על הכפתור למטה להוספת ילד/ה',
    addButtonText: 'הוסף ילד/ה ראשון/ה'
  }
};

/**
 * Parent dashboard view component
 * Uses shared DashboardView with parent-specific configuration
 */
const ParentView = ({ 
  studentsData, 
  onAddChild, 
  onRemoveChild, 
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
      onAdd={onAddChild}
      onRemove={onRemoveChild}
      onOpenChat={onOpenChat}
      onUnreadCountChange={onUnreadCountChange}
      config={parentConfig}
    />
  );
};

export default ParentView;