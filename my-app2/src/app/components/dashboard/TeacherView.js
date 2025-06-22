'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import UserCard from './UserCard';
import StatsCard from './StatsCard';
import Button from '../Button';
import useWebSocket from '../../hooks/useWebSocket';

// Displays the teacher's view of the dashboard.
const TeacherView = ({ 
  studentsData, 
  onAddStudent, 
  onRemoveStudent, 
  onOpenChat,
  currentUserId,
  connectionStatus,
  onUnreadCountChange
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isStudentsListExpanded, setIsStudentsListExpanded] = useState(true);
    const { onlineUsers } = useWebSocket();

  // Calculate total students
  const totalStudents = studentsData.length;

  // Calculate class average
  const classAverage = studentsData.length > 0 
    ? studentsData.reduce((sum, student) => sum + student.averageGrade, 0) / studentsData.length
    : 0;

  // Load unread messages count using real-time listeners like ChatPartnersList
  useEffect(() => {
    if (!currentUserId) return;

    const loadPartnersAndUnreadCount = async () => {
      try {

        
        // Get teacher's students (same logic as ChatPartnersList)
        const studentsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'student'),
          where('teacherId', '==', currentUserId)
        );
        const studentsSnapshot = await getDocs(studentsQuery);
        
        // Get unique parent IDs
        const parentIds = new Set();
        studentsSnapshot.docs.forEach(doc => {
          const studentData = doc.data();
          if (studentData.parentId) {
            parentIds.add(studentData.parentId);
          }
        });



        if (parentIds.size === 0) {
          setUnreadCount(0);
          return;
        }

        // Set up real-time listeners for each parent
        const unsubscribes = Array.from(parentIds).map(parentId => {
          const messagesRef = collection(db, 'users', currentUserId, 'chats', parentId, 'messages');
          const unreadQuery = query(messagesRef, where('read', '==', false));
          
          return onSnapshot(unreadQuery, (snapshot) => {
            // Filter out messages sent by current user
            const unreadFromPartner = snapshot.docs.filter(doc => {
              const messageData = doc.data();
              return messageData.sender !== 'teacher';
            });
            
            const currentPartnerUnread = unreadFromPartner.length;

            
            // Update counts per partner
            setUnreadCounts(prev => ({
              ...prev,
              [parentId]: currentPartnerUnread
            }));
          });
        });

        return () => {
          unsubscribes.forEach(unsub => unsub());
        };
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };

    const cleanup = loadPartnersAndUnreadCount();
    
    return () => {
      if (cleanup && typeof cleanup.then === 'function') {
        cleanup.then(cleanupFn => cleanupFn && cleanupFn());
      }
    };
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
          title="מספר תלמידים" 
          value={totalStudents}
        />
        <StatsCard
          title="ציון ממוצע כיתתי" 
          value={`${Math.round(classAverage)}%`}
        />
      </div>

      {/* Communication Section */}
      <div className="panels p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-color)' }}>מרכז התקשורת</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">שלח הודעות והתעדכן עם הורי התלמידים</p>
        
        {/* Chat Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg text-center border border-emerald-200 dark:border-emerald-800">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {connectionStatus === 'Connected' ? '✓' : '✗'}
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-500">
              {connectionStatus === 'Connected' ? 'צ\'אט פעיל' : 'צ\'אט לא פעיל'}
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-center border border-purple-200 dark:border-purple-800">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {onlineUsers.filter(user => user.role === 'parent').length}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-500">הורים מחוברים</div>
          </div>
          
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg text-center border border-indigo-200 dark:border-indigo-800">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{unreadCount}</div>
            <div className="text-xs text-indigo-600 dark:text-indigo-500">הודעות חדשות</div>
          </div>
        </div>
        
        {/* Connection Status */}
        <div className="flex items-center space-x-2 space-x-reverse mb-4">
          <div className={`w-2 h-2 rounded-full ${
            connectionStatus === 'Connected' ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="text-xs text-gray-500">
            {connectionStatus === 'Connected' ? 'שרת צ\'אט זמין' : 'שרת צ\'אט לא זמין'}
          </span>
        </div>
        
        <Button 
          onClick={onOpenChat}
          className="relative bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 w-full justify-center"
        >
          💬 פתח צ'אט
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </div>
        
        {/* Students List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-color)' }}>רשימת תלמידים</h3>
              <button
            onClick={() => setIsStudentsListExpanded(!isStudentsListExpanded)}
            className="list-toggle-button flex items-center gap-2 px-3 py-1 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
            <span>{isStudentsListExpanded ? 'סגור רשימה' : 'הצג רשימה'}</span>
            <span className="transform transition-transform duration-200" style={{
              transform: isStudentsListExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>
                  ▼
                </span>
              </button>
            </div>
        {isStudentsListExpanded && (
          studentsData.length === 0 ? (
            <div className="panels p-6 rounded-lg shadow text-center">
              <p className="text-gray-600 mb-4">עדיין לא נוספו תלמידים לכיתה שלך</p>
              <p className="text-sm text-gray-500 mb-4">
                כדי להתחיל לעקוב אחר התקדמות התלמידים שלך, לחץ על הכפתור למטה להוספת תלמיד/ה
              </p>
              <Button onClick={onAddStudent} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg">
                הוסף תלמיד/ה ראשון/ה
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
                    {studentsData.map((student) => (
                      <UserCard 
                        key={student.id} 
                  student={student}
                  userRole="teacher"
                  onRemove={() => onRemoveStudent(student)}
                      />
                    ))}
                  </div>
          )
        )}
      </div>
    </div>
  );
};

export default TeacherView; 