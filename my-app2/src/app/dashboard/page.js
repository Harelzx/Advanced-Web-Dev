'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

const Dashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Check if user is logged in
    if (typeof window !== 'undefined') {
      const isLoggedIn = sessionStorage.getItem('user');
      const uid = sessionStorage.getItem('uid');
      
      if (!isLoggedIn || !uid) {
        router.replace('/login');
        return;
      }
      
      // Fetch user data
      const fetchUserData = async () => {
        try {
          const userDocRef = doc(db, 'users', uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserRole(userData.role);
            setUserName(userData.fullName || userData.email);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchUserData();
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-6">
          <div>
            <h1 className="text-white text-2xl font-bold mb-2">
              {userRole === 'teacher' ? 'Teacher Dashboard' : 'Parent Dashboard'}
            </h1>
            <p className="text-gray-300">Welcome back, {userName}!</p>
          </div>
        </div>
        
        {/* Content based on role */}
        {userRole === 'teacher' ? (
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h2 className="text-white text-xl mb-4">Teacher Demo Content</h2>
            <p className="text-gray-300">Manage your students and questions here.</p>
          </div>
        ) : userRole === 'parent' ? (
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h2 className="text-white text-xl mb-4">Parent Demo Content</h2>
            <p className="text-gray-300">Track your children's progress here.</p>
          </div>
        ) : (
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-center">
            <p className="text-white">Access denied. Unknown user role.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;