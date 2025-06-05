'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../firebase/config';
import { doc, getDoc, collection, getDocs, query, where, updateDoc, arrayRemove } from 'firebase/firestore';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import TeacherView from '../components/dashboard/TeacherView';
import ParentView from '../components/dashboard/ParentView';
import AddStudentModal from '../components/dashboard/AddStudentModal';
import RemoveStudentModal from '../components/dashboard/RemoveStudentModal';

const Dashboard = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [studentsData, setStudentsData] = useState([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);

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
              console.log('Children data:', children); // Debug log
              await fetchStudentsData(userData.role, uid, children);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
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

  return (
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
  );
};

export default Dashboard;