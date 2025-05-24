'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const ParentDashboard = () => {
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
          
          // Check if user is actually a parent
          if (userData.role !== 'parent') {
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
          <p className="text-gray-300">Parent Dashboard</p>
        </div>

        {/* Children Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-6">
          <h2 className="text-white text-2xl font-bold mb-4">Your Children</h2>
          
          {user.children && user.children.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {user.children.map((childId, index) => (
                <div key={childId} className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-white font-semibold">Child {index + 1}</h3>
                  <p className="text-gray-300 text-sm">ID: {childId}</p>
                  <p className="text-gray-400 text-sm">Loading details...</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
              <div className="text-4xl mb-4 text-gray-400">👨‍👩‍👧‍👦</div>
              </div>
              <h3 className="text-white text-lg font-medium mb-2">No Children Added</h3>
              <p className="text-gray-400 mb-6">
                Add your children to start tracking their progress
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Add Child
              </button>
            </div>
          )}
        </div>

        {/* Quick Stats - Mock Data */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h3 className="text-white text-lg font-semibold mb-2">Total Study Time</h3>
            <p className="text-3xl font-bold text-blue-400">0 hrs</p>
            <p className="text-gray-400 text-sm">This week</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h3 className="text-white text-lg font-semibold mb-2">Completed Quizzes</h3>
            <p className="text-3xl font-bold text-green-400">0</p>
            <p className="text-gray-400 text-sm">This month</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h3 className="text-white text-lg font-semibold mb-2">Average Score</h3>
            <p className="text-3xl font-bold text-yellow-400">--%</p>
            <p className="text-gray-400 text-sm">Overall</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;