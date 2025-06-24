'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
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
  const [isStudentsListExpanded, setIsStudentsListExpanded] = useState(true);
  const { onlineUsers, totalUnreadCount } = useWebSocket(currentUserId, 'teacher', 'Teacher User');

  // Calculate total students
  const totalStudents = studentsData.length;

  // Calculate class average
  const classAverage = studentsData.length > 0 
    ? studentsData.reduce((sum, student) => sum + student.averageGrade, 0) / studentsData.length
    : 0;

  // Update parent component with unread count from WebSocket
  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(totalUnreadCount);
    }
  }, [totalUnreadCount, onUnreadCountChange]);

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
              שרת צ&apos;אט {connectionStatus === 'Connected' ? 'Online' : 'Offline'}
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-center border border-purple-200 dark:border-purple-800">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {onlineUsers.filter(user => user.role === 'parent').length}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-500">הורים מחוברים</div>
          </div>
          
          <div className={`p-3 rounded-lg text-center border ${
            totalUnreadCount > 0 
              ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
              : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
          }`}>
            <div className={`text-2xl font-bold ${
              totalUnreadCount > 0 
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {totalUnreadCount > 0 ? totalUnreadCount : '0'}
            </div>
            <div className={`text-xs ${
              totalUnreadCount > 0 
                ? 'text-indigo-600 dark:text-indigo-500'
                : 'text-gray-600 dark:text-gray-500'
            }`}>
              {totalUnreadCount > 0 ? 'הודעות חדשות' : 'אין הודעות חדשות'}
            </div>
          </div>
        </div>
        
        <Button 
          onClick={onOpenChat}
          className="relative bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 w-full justify-center"
        >
          💬 פתח צ&apos;אט
          {totalUnreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
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
            className="list-toggle-button flex items-center gap-2 px-3 py-1 text-sm hover:bg-gray-100 rounded-lg transition-colors"
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