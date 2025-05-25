'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../firebase/config';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import AddStudentModal from '../../components/Dashboard/AddStudentModal';
import RemoveConfirmationModal from '../../components/Dashboard/RemoveConfirmationModal';
import { onAuthStateChanged } from 'firebase/auth';

// Import shared components
import { DashboardHeader } from '../../components/Dashboard/DashboardHeader';
import { ItemSelector } from '../../components/Dashboard/ItemSelector';
import { PersonInfoCard } from '../../components/Dashboard/PersonInfoCard';
import { QuickStats } from '../../components/Dashboard/QuickStats';
import { PlaceholderCharts } from '../../components/Dashboard/PlaceholderCharts';
import { RecentActivity } from '../../components/Dashboard/RecentActivity';
import { SuccessMessage } from '../../components/Dashboard/SuccessMessage';
import { EmptyState } from '../../components/Dashboard/EmptyState';
import { generateProgressData } from '../../utils/progressGenerator';

const TeacherDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [teacherData, setTeacherData] = useState(null);
  const [studentsData, setStudentsData] = useState([]);
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

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
            console.warn(`Student document ${student.id} not found, using array data`);
            studentsInfo.push(student);
          }
        } catch (err) {
          console.error(`Error fetching student ${student.id}:`, err);
          studentsInfo.push(student);
        }
      }
      setStudentsData(studentsInfo);
      // Update selected index if needed
      if (selectedStudentIndex >= studentsInfo.length) {
        setSelectedStudentIndex(Math.max(0, studentsInfo.length - 1));
      }
    } catch (error) {
      console.error("Error fetching students data:", error);
      setError(`Error loading students data: ${error.message}`);
    }
  };

  useEffect(() => {
    let unsubscribeAuth;
    let unsubscribeTeacher;
    setLoading(true);
    unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace('/login');
        return;
      }
      // Set up real-time listener for teacher data
      const teacherDocRef = doc(db, "users", currentUser.uid);
      unsubscribeTeacher = onSnapshot(teacherDocRef, async (docSnap) => {
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
      }, (error) => {
        setError(`Error loading teacher data: ${error.message}`);
        setLoading(false);
      });
    });
    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeTeacher) unsubscribeTeacher();
    };
  }, [router]);

  const handleAddStudent = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleRemoveStudent = (student) => {
    setStudentToRemove(student);
    setIsRemoveModalOpen(true);
  };

  const handleCloseRemoveModal = () => {
    setIsRemoveModalOpen(false);
    setStudentToRemove(null);
  };

  const handleStudentChange = (event) => {
    setSelectedStudentIndex(parseInt(event.target.value));
  };

  const handleAddSuccess = (result) => {
    setSuccessMessage(`✅ Successfully added ${result.student.name} to your class!`);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleStudentRemoved = (result) => {
    setSuccessMessage(`🗑️ ${result.person.name} has been removed from your students list.`);
    setTimeout(() => setSuccessMessage(''), 5000);
    
    // Update selected index if needed
    if (selectedStudentIndex >= studentsData.length - 1) {
      setSelectedStudentIndex(Math.max(0, studentsData.length - 2));
    }
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
  if (!selectedStudent) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-500 text-white p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>Selected student not found</p>
        </div>
      </div>
    );
  }

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
          onRemoveItem={handleRemoveStudent}
          userType="teacher"
        />

        <PersonInfoCard
          person={selectedStudent}
          userType="teacher"
          showAddButton={false}
          itemCount={studentsData.length}
          additionalInfo={{
            accountCreated: selectedStudent.createdAt?.seconds ? 
              new Date(selectedStudent.createdAt.seconds * 1000).toLocaleDateString() : 
              'Unknown'
          }}
        />

        <QuickStats stats={studentProgress} />

        <PlaceholderCharts 
          showSubjects={false} 
          subjects={[]} 
        />

        <RecentActivity activities={studentProgress.recentActivity} />

        <AddStudentModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          userType="teacher"
          userId={auth.currentUser?.uid}
          onSuccess={handleAddSuccess}
        />

        <RemoveConfirmationModal
          isOpen={isRemoveModalOpen}
          onClose={handleCloseRemoveModal}
          userType="teacher"
          userId={auth.currentUser?.uid}
          personToRemove={studentToRemove}
          onSuccess={handleStudentRemoved}
        />
      </div>
    </div>
  );
};

export default TeacherDashboard;