'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import UserCard from './UserCard';
import StatsCard from './StatsCard';
import Button from '../Button';
import useWebSocket from '../../hooks/useWebSocket';

// Displays the parent's view of the dashboard.
const ParentView = ({ 
  studentsData, 
  onAddChild, 
  onRemoveChild, 
  onOpenChat,
  currentUserId,
  connectionStatus,
  onUnreadCountChange
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isChildrenListExpanded, setIsChildrenListExpanded] = useState(true);
    const { onlineUsers } = useWebSocket();

  // Calculate total children
  const totalChildren = studentsData.length;

  // Calculate children average
  const childrenAverage = studentsData.length > 0 
    ? studentsData.reduce((sum, child) => sum + child.averageGrade, 0) / studentsData.length
    : 0;

  // Load unread messages count - DISABLED FOR WEBSOCKET-ONLY MODE
  useEffect(() => {
    console.log('🔥 ParentView unread count Firebase listener disabled - using WebSocket only');
    // DISABLED: Firebase real-time listener for unread counts
    // Will be handled by WebSocket notifications instead
    
    // if (!currentUserId) return;

    // const loadPartnersAndUnreadCount = async () => {
    //   try {
    //     // Get parent's children (same logic as ChatPartnersList)
    //     const childrenQuery = query(
    //       collection(db, 'users'),
    //       where('role', '==', 'student'),
    //       where('parentId', '==', currentUserId)
    //     );
    //     const childrenSnapshot = await getDocs(childrenQuery);
        
    //     // Get unique teacher IDs
    //     const teacherIds = new Set();
    //     childrenSnapshot.docs.forEach(doc => {
    //       const childData = doc.data();
    //       if (childData.teacherId) {
    //         teacherIds.add(childData.teacherId);
    //       }
    //     });

    //     if (teacherIds.size === 0) {
    //       setUnreadCount(0);
    //       return;
    //     }

    //     // Set up real-time listeners for each teacher
    //     const unsubscribes = Array.from(teacherIds).map(teacherId => {
    //       const messagesRef = collection(db, 'users', currentUserId, 'chats', teacherId, 'messages');
    //       const unreadQuery = query(messagesRef, where('read', '==', false));
          
    //       return onSnapshot(unreadQuery, (snapshot) => {
    //         // Filter out messages sent by current user
    //         const unreadFromPartner = snapshot.docs.filter(doc => {
    //           const messageData = doc.data();
    //           return messageData.sender !== 'parent';
    //         });
            
    //         const currentPartnerUnread = unreadFromPartner.length;
            
    //         // Update counts per partner
    //         setUnreadCounts(prev => ({
    //           ...prev,
    //           [teacherId]: currentPartnerUnread
    //         }));
    //       });
    //     });

    //     return () => {
    //       unsubscribes.forEach(unsub => unsub());
    //     };
    //   } catch (error) {
    //     console.error('Error loading unread count:', error);
    //   }
    // };

    // const cleanup = loadPartnersAndUnreadCount();
    
    // return () => {
    //   if (cleanup && typeof cleanup.then === 'function') {
    //     cleanup.then(cleanupFn => cleanupFn && cleanupFn());
    //   }
    // };
  }, [currentUserId]);

  // Calculate total unread count whenever individual counts change
  useEffect(() => {
    const total = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
    setUnreadCount(total);
    if (onUnreadCountChange) {
      onUnreadCountChange(total);
    }
  }, [unreadCounts, onUnreadCountChange]);
  
  return (
    <div className="space-y-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsCard 
          title="מספר ילדים" 
          value={totalChildren}
        />
        <StatsCard 
          title="ציון ממוצע" 
          value={`${Math.round(childrenAverage)}%`}
        />
      </div>

      {/* Communication Section */}
      <div className="panels p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">מרכז התקשורת</h3>
        <p className="text-gray-600 mb-4">שלח הודעות והתעדכן עם מורי הילדים</p>
        
        {/* Chat Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div className={`p-3 rounded-lg text-center border ${
            connectionStatus === 'Connected' 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className={`text-2xl font-bold ${
              connectionStatus === 'Connected' 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {connectionStatus === 'Connected' ? '🟢' : '🔴'}
            </div>
            <div className={`text-xs ${
              connectionStatus === 'Connected' 
                ? 'text-green-600 dark:text-green-500' 
                : 'text-red-600 dark:text-red-500'
            }`}>
              שרת צ'אט {connectionStatus === 'Connected' ? 'Online' : 'Offline'}
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-center border border-purple-200 dark:border-purple-800">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {onlineUsers.filter(user => user.role === 'teacher').length}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-500">מורים מחוברים</div>
          </div>
          
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg text-center border border-indigo-200 dark:border-indigo-800">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{unreadCount}</div>
            <div className="text-xs text-indigo-600 dark:text-indigo-500">הודעות חדשות</div>
          </div>
        </div>
        
        <Button
          onClick={onOpenChat}
          className="relative bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 w-full justify-center"
        >
          💬 פתח צ'אט
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </div>
      
      {/* Children List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">רשימת ילדים</h3>
                <button
            onClick={() => setIsChildrenListExpanded(!isChildrenListExpanded)}
            className="list-toggle-button flex items-center gap-2 px-3 py-1 text-sm hover:bg-gray-100 rounded-lg transition-colors"
                >
            <span>{isChildrenListExpanded ? 'סגור רשימה' : 'הצג רשימה'}</span>
            <span className="transform transition-transform duration-200" style={{
              transform: isChildrenListExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>
                    ▼
                  </span>
                </button>
        </div>
        {isChildrenListExpanded && (
          studentsData.length === 0 ? (
            <div className="panels p-6 rounded-lg shadow text-center">
              <p className="text-gray-600 mb-4">עדיין לא נוספו ילדים לחשבון שלך</p>
              <p className="text-sm text-gray-500 mb-4">
                כדי להתחיל לעקוב אחר התקדמות הילדים שלך, לחץ על הכפתור למטה להוספת ילד/ה
              </p>
              <Button onClick={onAddChild} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg">
                הוסף ילד/ה ראשון/ה
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {studentsData.map((child) => (
                    <UserCard 
                      key={child.id}
                  student={child}
                  userRole="parent"
                  onRemove={() => onRemoveChild(child)}
                    />
                  ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ParentView;