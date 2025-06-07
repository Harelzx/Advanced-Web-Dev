'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../firebase/config';
import { doc, getDoc, collection, getDocs, query, where, updateDoc, arrayRemove } from 'firebase/firestore';
import { getPracticeQuestions } from '../firebase/trainingService';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import TeacherView from '../components/dashboard/TeacherView';
import ParentView from '../components/dashboard/ParentView';
import AddStudentModal from '../components/dashboard/AddStudentModal';
import RemoveStudentModal from '../components/dashboard/RemoveStudentModal';
import ProtectedRoute from '../components/ProtectedRoute';

const Dashboard = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [studentsData, setStudentsData] = useState([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in
    if (typeof window !== 'undefined') {
      const isLoggedIn = sessionStorage.getItem('user');
      const uid = sessionStorage.getItem('uid');
      
      if (!isLoggedIn || !uid) {
        router.replace('/login');
        return;
      }
      
      setCurrentUserId(uid);
      
      // Fetch user data and students data
      const fetchAllData = async () => {
        try {
          const userDocRef = doc(db, 'users', uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserRole(userData.role);
            setUserName(userData.fullName || userData.email);
            
            // Fetch students data based on role
            if (userData.role === 'teacher' || userData.role === 'parent') {
              const children = userData.children || [];
              await fetchStudentsData(userData.role, uid, children);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setError('Failed to load dashboard data. Please try refreshing the page.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchAllData();
    }
  }, [router]);

  const fetchStudentsData = async (role, currentUid, childrenIds = []) => {
    try {
      let students = [];
      
      // Ensure childrenIds is an array and filter out invalid IDs
      const validChildrenIds = Array.isArray(childrenIds) 
        ? childrenIds.filter(id => id && typeof id === 'string' && id.trim().length > 0)
        : [];
      
      if (role === 'teacher') {
        // For teachers, get all students assigned to them
        if (validChildrenIds.length > 0) {
          for (const studentId of validChildrenIds) {
            try {
              const studentDocRef = doc(db, 'users', studentId);
              const studentDocSnap = await getDoc(studentDocRef);
              if (studentDocSnap.exists()) {
                const studentData = await getStudentResults(studentId, studentDocSnap.data());
                students.push(studentData);
              }
            } catch (error) {
              console.error(`Error fetching student ${studentId}:`, error);
            }
          }
        }
      } else if (role === 'parent') {
        // For parents, get their children
        if (validChildrenIds.length > 0) {
          for (const childId of validChildrenIds) {
            try {
              const childDocRef = doc(db, 'users', childId);
              const childDocSnap = await getDoc(childDocRef);
              if (childDocSnap.exists()) {
                const studentData = await getStudentResults(childId, childDocSnap.data());
                students.push(studentData);
              }
            } catch (error) {
              console.error(`Error fetching child ${childId}:`, error);
            }
          }
        }
      }
      
      setStudentsData(students);
    } catch (error) {
      console.error('Error fetching students data:', error);
    }
  };

  const getStudentResults = async (studentId, studentInfo) => {
    try {
      // Get results from exercises collection
      const exercisesRef = collection(db, `users/${studentId}/exercises`);
      const exercisesSnapshot = await getDocs(exercisesRef);
      
      // Get grades from results collection  
      const resultsRef = collection(db, `users/${studentId}/results`);
      const resultsSnapshot = await getDocs(resultsRef);
      
      // --- New Dynamic Performance Logic based on subjectBreakdown ---
      const practicePerformanceData = {};
      let totalTime = 0;
      let sessionCount = 0;

      const sessionsQuery = query(collection(db, 'daily_practice'), where("studentId", "==", studentId));
      const sessionsSnap = await getDocs(sessionsQuery);

      sessionsSnap.forEach(doc => {
          const sessionData = doc.data();
          if (sessionData.timeSpent) {
              totalTime += sessionData.timeSpent;
              sessionCount++;
          }
          if (sessionData.subjectBreakdown) {
            Object.entries(sessionData.subjectBreakdown).forEach(([subject, data]) => {
                if (!practicePerformanceData[subject]) {
                    practicePerformanceData[subject] = { correct: 0, total: 0 };
                }
                practicePerformanceData[subject].correct += data.correct;
                practicePerformanceData[subject].total += data.questions;
            });
          }
      });
      const averageTimeSpent = sessionCount > 0 ? totalTime / sessionCount : 0;
      
      const practicePerformance = Object.entries(practicePerformanceData).reduce((acc, [subject, data]) => {
          if (data.total > 0) {
            acc[subject] = (data.correct / data.total) * 100;
          } else {
            acc[subject] = 0;
          }
          return acc;
      }, {});
      // --- End of New Logic ---

      // Get training progress
      const progressRef = doc(db, 'training_progress', studentId);
      const progressSnap = await getDoc(progressRef);
      let trainingProgress = { completedSessions: 0, status: 'not_started' };
      if (progressSnap.exists()) {
        trainingProgress = progressSnap.data();
      }

      const grades = {};
      const wrongQuestions = {};
      
      // Process results (grades)
      resultsSnapshot.forEach((doc) => {
        const subject = doc.id;
        const data = doc.data();
        grades[subject] = data.grade || 0;
      });
      
      // Process exercises (wrong questions)
      exercisesSnapshot.forEach((doc) => {
        const subject = doc.id;
        const data = doc.data();
        if (data.wrongQuestions) {
          wrongQuestions[subject] = data.wrongQuestions;
        }
      });
      
      // Combine initial grades with practice performance. Practice data takes precedence.
      const combinedPerformance = { ...grades, ...practicePerformance };
      
      return {
        id: studentId,
        name: studentInfo.fullName || studentInfo.email || 'Unknown Student',
        grades,
        wrongQuestions,
        averageGrade: Object.values(grades).length > 0 
          ? Object.values(grades).reduce((a, b) => a + b, 0) / Object.values(grades).length 
          : 0,
        trainingProgress,
        averageTimeSpent,
        practicePerformance: combinedPerformance,
      };
    } catch (error) {
      console.error('Error fetching student results:', error);
      return {
        id: studentId,
        name: studentInfo.fullName || 'Unknown Student',
        grades: {},
        wrongQuestions: {},
        averageGrade: 0,
        trainingProgress: { completedSessions: 0, status: 'not_started' },
        averageTimeSpent: 0,
        practicePerformance: {},
      };
    }
  };

  const openRemoveModal = (student) => {
    setStudentToRemove(student);
    setShowRemoveModal(true);
  };

  const closeRemoveModal = () => {
    setStudentToRemove(null);
    setShowRemoveModal(false);
  };

  const handleStudentRemoved = async () => {
    // Refresh students data after removing
    try {
      const userDocRef = doc(db, 'users', currentUserId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const children = userData.children || [];
        await fetchStudentsData(userData.role, currentUserId, children);
      }
    } catch (error) {
      console.error('Error refreshing student data:', error);
    }
  };

  const handleStudentAdded = async () => {
    // Refresh students data after adding
    try {
      const userDocRef = doc(db, 'users', currentUserId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const children = userData.children || [];
        await fetchStudentsData(userData.role, currentUserId, children);
      }
    } catch (error) {
      console.error('Error refreshing student data:', error);
    }
  };

  if (loading) {
    return (
      <main className="p-4 space-y-6">
        <div className="bg-white p-6 border rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-4 space-y-6">
        <div className="bg-white p-6 border rounded-lg shadow-lg text-center">
          <div className="text-red-600 mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <p className="text-red-700 font-medium mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['teacher', 'parent']}>
      <main className="p-4 space-y-6">
        {/* Header */}
        <DashboardHeader userRole={userRole} userName={userName} />

        {/* Content Card */}
        <div className="bg-white p-6 border rounded-lg shadow-lg">
          {userRole === 'teacher' ? (
            <TeacherView 
              studentsData={studentsData} 
              onAddStudent={() => setShowAddModal(true)}
              onRemoveStudent={openRemoveModal}
            />
          ) : userRole === 'parent' ? (
            <ParentView 
              studentsData={studentsData}
              onAddChild={() => setShowAddModal(true)}
              onRemoveChild={openRemoveModal}
            />
          ) : (
            <div className="bg-gray-100 p-4 rounded-lg shadow text-center">
              <p className="text-gray-700">Loading dashboard...</p>
            </div>
          )}
        </div>

        {/* Add Student/Child Modal */}
        <AddStudentModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          userRole={userRole}
          userId={currentUserId}
          onStudentAdded={handleStudentAdded}
        />

        {/* Remove Student/Child Modal */}
        <RemoveStudentModal
          isOpen={showRemoveModal}
          onClose={closeRemoveModal}
          student={studentToRemove}
          userRole={userRole}
          userId={currentUserId}
          onStudentRemoved={handleStudentRemoved}
        />
      </main>
    </ProtectedRoute>
  );
};

export default Dashboard;