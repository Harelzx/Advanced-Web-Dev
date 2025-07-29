'use client';

import { useState, useEffect, useMemo } from 'react';
import UserCard from './UserCard';
import StatsCard from './StatsCard';
import Button from '../Button';
import useWebSocket from '../../hooks/useWebSocket';

/**
 * Shared dashboard view component for both teachers and parents
 * Eliminates code duplication between TeacherView and ParentView
 */
const DashboardView = ({ 
  // Data props
  studentsData, 
  currentUserId,
  connectionStatus,
  // Callback props
  onAdd,
  onRemove, 
  onOpenChat,
  onUnreadCountChange,
  // Configuration props to customize for teacher vs parent
  config
}) => {
  const { onlineUsers, totalUnreadCount } = useWebSocket(
    currentUserId, 
    config.userRole, 
    config.userDisplayName
  );

  // Calculate totals and averages - memoized to prevent recalculation on every render
  const { totalCount, average } = useMemo(() => {
    const total = studentsData.length;
    const avg = total > 0 
      ? studentsData.reduce((sum, student) => sum + student.averageGrade, 0) / total
      : 0;
    return { totalCount: total, average: avg };
  }, [studentsData]);

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
          title={config.stats.totalTitle} 
          value={totalCount}
        />
        <StatsCard 
          title={config.stats.averageTitle} 
          value={`${Math.round(average)}%`}
        />
      </div>

      {/* Communication Section */}
      <div className="panels p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">מרכז התקשורת</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{config.communication.description}</p>
        
        {/* Chat Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {/* Connection Status */}
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
          
          {/* Online Users Count */}
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-center border border-purple-200 dark:border-purple-800">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {onlineUsers.filter(user => user.role === config.communication.partnerRole).length}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-500">
              {config.communication.onlineUsersLabel}
            </div>
          </div>
          
          {/* Unread Messages */}
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
        
        {/* Chat Button */}
        <Button
          onClick={onOpenChat}
          className="relative bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 w-full justify-center"
        >
          💬 פתח צ&apos;אט
          {totalUnreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
            </span>
          )}
        </Button>
      </div>
      
      {/* Students/Children List */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{config.list.title}</h3>
        </div>
        
        {
          studentsData.length === 0 ? (
            // Empty state
            <div className="panels p-6 rounded-lg shadow text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">{config.list.emptyMessage}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                {config.list.emptyDescription}
              </p>
              <Button 
                onClick={onAdd} 
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg mx-auto"
              >
                {config.list.addButtonText}
              </Button>
            </div>
          ) : (
            // Student/Children cards
            <div className="grid grid-cols-1 gap-3">
              {studentsData.map((student) => (
                <UserCard 
                  key={student.id}
                  student={student}
                  userRole={config.userRole}
                  onRemove={() => onRemove(student)}
                />
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
};

export default DashboardView;