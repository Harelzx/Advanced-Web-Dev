'use client'
import { useRouter } from 'next/navigation';

// Displays the header for the dashboard with a welcome message and logout button.
export default function DashboardHeader({ 
  userRole, 
  userName, 
  onOpenChat,
  onAddStudent,
  onAddChild,
  unreadCount 
}) {
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      // Clear session storage
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('uid');
      
      // Redirect to login
      router.replace('/login');
    }
  };

  return (
    <div className="panels p-6 rounded-lg shadow-lg" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>
            {userRole === 'teacher' ? 'לוח בקרה למורה' : 'לוח בקרה להורה'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium">ברוך שובך, {userName}!</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Chat Button */}
          <button
            onClick={onOpenChat}
            className="relative px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200 flex items-center gap-2 shadow-sm"
          >
            <span>💬</span>
            <span>צ'אט עם {userRole === 'teacher' ? 'הורים' : 'מורים'}</span>
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          
          {/* Add Student/Child Button */}
          <button
            onClick={userRole === 'teacher' ? onAddStudent : onAddChild}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors duration-200 flex items-center gap-2 shadow-sm"
          >
            <span>➕</span>
            <span>הוסף {userRole === 'teacher' ? 'תלמיד/ה' : 'ילד/ה'}</span>
          </button>
          
          {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center gap-2 shadow-sm"
        >
          <span>התנתק</span>
          <span>🚪</span>
        </button>
        </div>
      </div>
    </div>
  );
} 