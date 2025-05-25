'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../firebase/config';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import AddStudentModal from '../../components/Dashboard/AddStudentModal';

// Import shared components
import { DashboardHeader } from '../../components/Dashboard/DashboardHeader';
import { ItemSelector } from '../../components/Dashboard/ItemSelector';
import { PersonInfoCard } from '../../components/Dashboard/PersonInfoCard';
import { QuickStats } from '../../components/Dashboard/QuickStats';
import { PlaceholderCharts } from '../../components/Dashboard/PlaceholderCharts';
import { RecentActivity } from '../../components/Dashboard/RecentActivity';
import { SuccessMessage } from '../../components/Dashboard/SuccessMessage';
import { generateProgressData } from '../../utils/progressGenerator';
import { SubjectPerformance } from '../../components/Dashboard/SubjectPerformance';

const TeacherDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [teacherData, setTeacherData] = useState(null);
  const [studentsData, setStudentsData] = useState([]);
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkTeacherAccess = async () => {
      try {
        // Check session storage
        const isLoggedIn = sessionStorage.getItem('user');
        if (!isLoggedIn) {
          router.replace('/login');
          return;
        }

        // Get current user
        const currentUser = auth.currentUser;
        if (!currentUser) {
          router.replace('/login');
          return;
        }

        // Set up real-time listener for teacher data
        const teacherDocRef = doc(db, "users", currentUser.uid);
        const unsubscribe = onSnapshot(teacherDocRef, async (docSnap) => {
          if (!docSnap.exists()) {
            setError('Teacher data not found');
            setLoading(false);
            return;
          }

          const teacherInfo = docSnap.data();
          
          // Check if user is actually a teacher
          if (teacherInfo.role !== 'teacher') {
            router.replace('/login');
            return;
          }

          setTeacherData(teacherInfo);

          // Fetch students data if students array exists
          if (teacherInfo.students && teacherInfo.students.length > 0) {
            await fetchStudentsData(teacherInfo.students);
          } else {
            setStudentsData([]);
          }
          
          setLoading(false);
        });

        return () => unsubscribe();

      } catch (error) {
        console.error("Error fetching teacher data:", error);
        setError('Error loading dashboard data');
        setLoading(false);
      }
    };

    const fetchStudentsData = async (students) => {
      try {
        const studentsInfo = [];
        for (const student of students) {
          try {
            const studentDocRef = doc(db, "users", student.id);
            const studentDocSnap = await getDoc(studentDocRef);
            
            if (studentDocSnap.exists()) {
              studentsInfo.push({
                id: student.id,
                name: student.name,
                email: student.email,
                ...studentDocSnap.data()
              });
            } else {
              // If student document doesn't exist, use data from teacher's array
              studentsInfo.push(student);
            }
          } catch (err) {
            console.error(`Error fetching student ${student.id}:`, err);
            // Fallback to using data from teacher's students array
            studentsInfo.push(student);
          }
        }
        setStudentsData(studentsInfo);
      } catch (error) {
        console.error("Error fetching students data:", error);
        setError('Error loading students data');
      }
    };

    checkTeacherAccess();
  }, [router]);

  const handleAddStudent = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleStudentChange = (event) => {
    setSelectedStudentIndex(parseInt(event.target.value));
  };

  const handleAddSuccess = (result) => {
    setSuccessMessage(`✅ Successfully added ${result.student.name} to your class!`);
    // Hide success message after 5 seconds
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading teacher dashboard...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-500 text-white p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // No students state
  if (!studentsData || studentsData.length === 0) {
    return (
      <EmptyState
        userType="teacher"
        userData={teacherData}
        onAddItem={handleAddStudent}
        successMessage={successMessage}
        isModalOpen={isModalOpen}
        onCloseModal={handleModalClose}
        onSuccess={handleAddSuccess}
        userId={auth.currentUser?.uid}
      />
    );
  }

  const selectedStudent = studentsData[selectedStudentIndex];
  const studentProgress = generateProgressData();

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <SuccessMessage message={successMessage} isVisible={!!successMessage} />

        <DashboardHeader 
          userType="teacher"
          userData={teacherData}
          itemCount={studentsData.length}
          itemLabel="student"
        />

        <ItemSelector
          items={studentsData}
          selectedIndex={selectedStudentIndex}
          onSelectionChange={handleStudentChange}
          onAddItem={handleAddStudent}
          userType="teacher"
        />

        <PersonInfoCard
          person={selectedStudent}
          userType="teacher"
          onAddItem={handleAddStudent}
          itemCount={studentsData.length}
          additionalInfo={{
            lastActivity: studentProgress.lastActivity
          }}
        />

        <QuickStats stats={studentProgress} />

        <PlaceholderCharts 
          showSubjects={true} 
          subjects={studentProgress.subjects} 
        />

        <RecentActivity activities={studentProgress.recentActivity} />

        <AddStudentModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          userRole="teacher"
          userId={auth.currentUser?.uid}
          onSuccess={handleAddSuccess}
        />
      </div>
    </div>
  );
};

export default TeacherDashboard;