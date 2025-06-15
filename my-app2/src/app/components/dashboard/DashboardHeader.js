'use client'
import { useRouter } from 'next/navigation';

// Displays the header for the dashboard with a welcome message and logout button.
export default function DashboardHeader({ userRole, userName }) {
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
    <div className="panels p-6 border-white rounded-lg shadow-lg" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {userRole === 'teacher' ? 'לוח בקרה למורה' : 'לוח בקרה להורה'}
          </h1>
          <p className="text-gray-600">ברוך שובך, {userName}!</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center gap-2"
        >
          <span>התנתק</span>
          <span>🚪</span>
        </button>
      </div>
    </div>
  );
} 