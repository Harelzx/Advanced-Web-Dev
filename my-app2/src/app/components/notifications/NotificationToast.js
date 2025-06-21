'use client';

import { useEffect } from 'react';

export default function NotificationToast({ notifications, onRemove }) {
  return (
    <div className="fixed top-4 left-4 z-50 space-y-2" dir="rtl">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

function NotificationItem({ notification, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(notification.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification.id, onRemove]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm animate-slide-in-left">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
            <h4 className="font-medium text-gray-800 text-sm">
              {notification.title}
            </h4>
          </div>
          {notification.body && (
            <p className="text-gray-600 text-sm">
              {notification.body}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {new Date(notification.timestamp).toLocaleTimeString('he-IL')}
          </p>
        </div>
        <button
          onClick={() => onRemove(notification.id)}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          ✕
        </button>
      </div>
    </div>
  );
} 