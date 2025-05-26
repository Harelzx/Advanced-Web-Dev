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
import SuccessMessage from '../../components/Dashboard/SuccessMessage';
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
  const [justAddedStudent, setJustAddedStudent] = useState(false);
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
            studentsInfo.push(student);
          }
        } catch (err) {
          studentsInfo.push(student);
        }
      }
      setStudentsData(studentsInfo);
      // Update selected index if needed
      if (selectedStudentIndex >= studentsInfo.length && studentsInfo.length > 0) {
        setSelectedStudentIndex(Math.max(0, studentsInfo.length - 1));
      } else if (studentsInfo.length === 0) {
        setSelectedStudentIndex(0);
      }
    } catch (error) {
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
    if (justAddedStudent) return;
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setJustAddedStudent(false);
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
    setTimeout(() => setSuccessMessage(''), 4000);
    setJustAddedStudent(true);
    handleModalClose();
  };

  const handleStudentRemoved = async (result) => {
    setSuccessMessage(`🗑️ ${result.person.name} has been removed from your students list.`);
    setTimeout(() => setSuccessMessage(''), 4000);
    
    if (result.remainingCount === 0) {
      setStudentsData([]);
      setSelectedStudentIndex(0);
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
  
  // אם אין סטודנט נבחר או שהאינדקס לא תקין, נציג את EmptyState
  if (!selectedStudent && studentsData.length > 0) {
    // אם יש סטודנטים אבל האינדקס לא תקין, נתקן את האינדקס
    const validIndex = Math.max(0, Math.min(selectedStudentIndex, studentsData.length - 1));
    if (validIndex !== selectedStudentIndex) {
      setSelectedStudentIndex(validIndex);
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white text-xl">Updating selection...</div>
        </div>
      );
    }
  }
  
  // אם אין סטודנט נבחר בכלל, נציג שגיאה זמנית
  if (!selectedStudent) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const studentProgress = generateProgressData();

  return (
    <>
      <div className="min-h-screen bg-gray-900 p-6 relative">
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
        </div>
      </div>

      {isModalOpen && (
        <AddStudentModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          userType="teacher"
          userId={auth.currentUser?.uid}
          onSuccess={handleAddSuccess}
        />
      )}

      {isRemoveModalOpen && (
        <RemoveConfirmationModal
          isOpen={isRemoveModalOpen}
          onClose={handleCloseRemoveModal}
          userType="teacher"
          userId={auth.currentUser?.uid}
          personToRemove={studentToRemove}
          onSuccess={handleStudentRemoved}
        />
      )}
    </>
  );
};

export default TeacherDashboard;