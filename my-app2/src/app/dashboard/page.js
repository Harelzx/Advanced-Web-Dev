'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../firebase/config';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import TeacherView from '../components/dashboard/TeacherView';
import ParentView from '../components/dashboard/ParentView';

const Dashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [studentsData, setStudentsData] = useState([]);
  const [currentUserId, setCurrentUserId] = useState('');

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
              await fetchStudentsData(userData.role, uid, userData.children || []);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
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
      
      if (role === 'teacher') {
        // For teachers, get all students (simplified for now)
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', '==', 'student'));
        const usersSnapshot = await getDocs(q);
        
        for (const userDoc of usersSnapshot.docs) {
          const studentData = await getStudentResults(userDoc.id, userDoc.data());
          students.push(studentData);
        }
      } else if (role === 'parent') {
        // For parents, get only their children
        // For demo, we'll use the current user's own results if they're a student
        // In real implementation, this would use the children array
        const studentData = await getStudentResults(currentUid, { fullName: userName });
        students.push(studentData);
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
      
      return {
        id: studentId,
        name: studentInfo.fullName || studentInfo.email || 'Unknown Student',
        grades,
        wrongQuestions,
        averageGrade: Object.values(grades).length > 0 
          ? Object.values(grades).reduce((a, b) => a + b, 0) / Object.values(grades).length 
          : 0
      };
    } catch (error) {
      console.error('Error fetching student results:', error);
      return {
        id: studentId,
        name: studentInfo.fullName || 'Unknown Student',
        grades: {},
        wrongQuestions: {},
        averageGrade: 0
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-800 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <main className="p-4 space-y-6">
      {/* Header */}
      <DashboardHeader userRole={userRole} userName={userName} />

      {/* Content Card */}
      <div className="bg-white p-6 border rounded-lg shadow-lg">
        {userRole === 'teacher' ? (
          <TeacherView studentsData={studentsData} />
        ) : userRole === 'parent' ? (
          <ParentView studentsData={studentsData} />
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