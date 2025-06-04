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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-800 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <main className="p-4 space-y-6">
      {/* Header Card */}
      <div className="bg-white p-6 border rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {userRole === 'teacher' ? 'Teacher Dashboard' : 'Parent Dashboard'}
        </h1>
        <p className="text-gray-600">Welcome back, {userName}!</p>
      </div>

      {/* Content Card */}
      <div className="bg-white p-6 border rounded-lg shadow-lg">
        {userRole === 'teacher' ? (
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Teacher Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Students Overview */}
              <div className="bg-gray-100 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700">Students</h3>
                <p className="text-gray-600">Total Students: <span className="font-bold text-green-600">12</span></p>
                <div className="mt-2">
                  <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                    Manage Students
                  </button>
                </div>
              </div>
              
              {/* Questions Management */}
              <div className="bg-gray-100 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700">Questions</h3>
                <p className="text-gray-600">Available Questions: <span className="font-bold text-blue-600">45</span></p>
                <div className="mt-2">
                  <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Manage Questions
                  </button>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="bg-gray-100 p-4 rounded-lg shadow md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-700">Recent Student Activity</h3>
                <ul className="text-gray-600 space-y-2 mt-2">
                  <li>• Sarah completed Math Quiz - <span className="font-bold text-green-600">95%</span></li>
                  <li>• John finished Science Module - <span className="font-bold text-blue-600">87%</span></li>
                  <li>• Emma started Reading Assignment - <span className="font-bold text-yellow-600">In Progress</span></li>
                </ul>
              </div>
            </div>
          </div>
        ) : userRole === 'parent' ? (
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Children's Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Child 1 */}
              <div className="bg-gray-100 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700">Alex Johnson</h3>
                <p className="text-gray-600">Recent Quiz: <span className="font-bold text-green-600">92%</span></p>
                <p className="text-gray-600">Last Activity: <span className="font-medium">2 days ago</span></p>
                <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: "92%" }}></div>
                </div>
              </div>
              
              {/* Child 2 */}
              <div className="bg-gray-100 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700">Maya Johnson</h3>
                <p className="text-gray-600">Recent Quiz: <span className="font-bold text-blue-600">85%</span></p>
                <p className="text-gray-600">Last Activity: <span className="font-medium">1 day ago</span></p>
                <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                  <div className="bg-blue-400 h-3 rounded-full" style={{ width: "85%" }}></div>
                </div>
              </div>
              
              {/* Overall Progress */}
              <div className="bg-gray-100 p-4 rounded-lg shadow md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-700">Overall Family Progress</h3>
                <p className="text-gray-600">Average Performance: <span className="font-bold text-green-600">88.5%</span></p>
                <div className="mt-2">
                  <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                    View Detailed Reports
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-100 p-4 rounded-lg shadow text-center">
            <p className="text-gray-700">Access denied. Unknown user role.</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default Dashboard;