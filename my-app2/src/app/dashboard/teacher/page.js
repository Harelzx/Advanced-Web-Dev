'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const TeacherDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication and get user data
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace('/');
        return;
      }

      try {
        // Get user document from Firestore
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Check if user is actually a teacher
          if (userData.role !== 'teacher') {
            router.replace('/dashboard'); // Redirect to student dashboard
            return;
          }
          
          setUser({ id: currentUser.uid, ...userData });
        } else {
          console.error('User document not found');
          router.replace('/');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.replace('/');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-6">
          <h1 className="text-white text-3xl font-bold mb-2">
            Welcome, {user.fullName}!
          </h1>
          <p className="text-gray-300">Teacher Dashboard</p>
        </div>

        {/* Students Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-6">
          <h2 className="text-white text-2xl font-bold mb-4">Your Students</h2>
          
          {user.students && user.students.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {user.students.map((studentId, index) => (
                <div key={studentId} className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-white font-semibold">Student {index + 1}</h3>
                  <p className="text-gray-300 text-sm">ID: {studentId}</p>
                  <p className="text-gray-400 text-sm">Loading details...</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4 text-gray-400">👨‍🏫</div>
              <h3 className="text-white text-lg font-medium mb-2">No Students Added</h3>
              <p className="text-gray-400 mb-6">
                Add students to your class to start tracking their progress
              </p>
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Add Student
              </button>
            </div>
          )}
        </div>

        {/* Class Stats - Mock Data */}
        <div className="grid gap-6 md:grid-cols-4">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h3 className="text-white text-lg font-semibold mb-2">Total Students</h3>
            <p className="text-3xl font-bold text-blue-400">{user.students?.length || 0}</p>
            <p className="text-gray-400 text-sm">In your class</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h3 className="text-white text-lg font-semibold mb-2">Avg. Score</h3>
            <p className="text-3xl font-bold text-green-400">--%</p>
            <p className="text-gray-400 text-sm">Class average</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h3 className="text-white text-lg font-semibold mb-2">Active Today</h3>
            <p className="text-3xl font-bold text-yellow-400">0</p>
            <p className="text-gray-400 text-sm">Students online</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h3 className="text-white text-lg font-semibold mb-2">Assignments</h3>
            <p className="text-3xl font-bold text-purple-400">0</p>
            <p className="text-gray-400 text-sm">Pending review</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl mt-6">
          <h3 className="text-white text-xl font-bold mb-4">Recent Activity</h3>
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">📊</div>
            <p className="text-gray-400">No recent activity to display</p>
            <p className="text-gray-500 text-sm">Student activities will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;