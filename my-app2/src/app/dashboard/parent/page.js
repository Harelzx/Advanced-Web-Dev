'use client'
import { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/config';
import { doc, getDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
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

const ParentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [parentData, setParentData] = useState(null);
  const [childrenData, setChildrenData] = useState([]);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkParentAccess = async () => {
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

        // Set up real-time listener for parent data
        const parentDocRef = doc(db, "users", currentUser.uid);
        const unsubscribe = onSnapshot(parentDocRef, async (docSnap) => {
          if (!docSnap.exists()) {
            setError('Parent data not found');
            setLoading(false);
            return;
          }

          const parentInfo = docSnap.data();
          
          // Check if user is actually a parent
          if (parentInfo.role !== 'parent') {
            router.replace('/login');
            return;
          }

          setParentData(parentInfo);

          // Fetch children data if children array exists
          if (parentInfo.children && parentInfo.children.length > 0) {
            await fetchChildrenData(parentInfo.children);
          } else {
            // Check for legacy studentEmail field
            if (parentInfo.studentEmail) {
              await fetchLegacyStudentData(parentInfo.studentEmail);
            } else {
              setChildrenData([]);
            }
          }
          
          setLoading(false);
        });

        return () => unsubscribe();

      } catch (error) {
        console.error("Error fetching parent/student data:", error);
        setError('Error loading dashboard data');
        setLoading(false);
      }
    };

    const fetchChildrenData = async (children) => {
      try {
        const childrenInfo = [];
        for (const child of children) {
          try {
            const childDocRef = doc(db, "users", child.id);
            const childDocSnap = await getDoc(childDocRef);
            
            if (childDocSnap.exists()) {
              childrenInfo.push({
                id: child.id,
                name: child.name,
                email: child.email,
                ...childDocSnap.data()
              });
            } else {
              // If child document doesn't exist, use data from parent's array
              childrenInfo.push(child);
            }
          } catch (err) {
            console.error(`Error fetching child ${child.id}:`, err);
            // Fallback to using data from parent's children array
            childrenInfo.push(child);
          }
        }
        setChildrenData(childrenInfo);
      } catch (error) {
        console.error("Error fetching children data:", error);
        setError('Error loading children data');
      }
    };

    const fetchLegacyStudentData = async (studentEmail) => {
      try {
        const studentsRef = collection(db, "users");
        const studentQuery = query(studentsRef, 
          where("email", "==", studentEmail),
          where("role", "==", "student")
        );
        const studentSnapshot = await getDocs(studentQuery);

        if (!studentSnapshot.empty) {
          const studentDoc = studentSnapshot.docs[0];
          setChildrenData([{
            id: studentDoc.id,
            name: studentDoc.data().fullName || studentEmail.split('@')[0],
            email: studentEmail,
            ...studentDoc.data()
          }]);
        } else {
          setError('Student data not found');
        }
      } catch (error) {
        console.error("Error fetching legacy student data:", error);
        setError('Error loading student data');
      }
    };

    checkParentAccess();
  }, [router]);

  const handleAddChild = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChildAdded = (result) => {
    console.log('Child added successfully:', result);
    setSuccessMessage(`✅ Successfully added ${result.student.name} to your children!`);
    // Hide success message after 5 seconds
    setTimeout(() => setSuccessMessage(''), 5000);
    // Data will be updated automatically through onSnapshot
  };

  const handleChildChange = (event) => {
    setSelectedChildIndex(parseInt(event.target.value));
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading parent dashboard...</div>
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

  // No children state
  if (!childrenData || childrenData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <SuccessMessage message={successMessage} isVisible={!!successMessage} />
          
          <DashboardHeader 
            userType="parent"
            userData={parentData}
            itemCount={0}
            itemLabel=""
          />

          <div className="bg-gray-800 p-12 rounded-lg shadow-xl text-center">
            <div className="text-8xl mb-6">👨‍👩‍👧‍👦</div>
            <h2 className="text-white text-2xl font-bold mb-4">No Children Added Yet</h2>
            <p className="text-gray-400 text-lg mb-8">Add your child to start tracking their learning progress</p>
            <button
              onClick={handleAddChild}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg"
            >
              Add Your First Child
            </button>
          </div>

          <AddStudentModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            userRole="parent"
            userId={auth.currentUser?.uid}
            onSuccess={handleChildAdded}
          />
        </div>
      </div>
    );
  }

  const selectedChild = childrenData[selectedChildIndex];
  const childProgress = generateProgressData();

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <SuccessMessage message={successMessage} isVisible={!!successMessage} />

        <DashboardHeader 
          userType="parent"
          userData={parentData}
          itemCount={childrenData.length}
          itemLabel="child"
        />

        <ItemSelector
          items={childrenData}
          selectedIndex={selectedChildIndex}
          onSelectionChange={handleChildChange}
          onAddItem={handleAddChild}
          userType="parent"
        />

        <PersonInfoCard
          person={selectedChild}
          userType="parent"
          onAddItem={handleAddChild}
          itemCount={childrenData.length}
          additionalInfo={{
            accountCreated: selectedChild.createdAt ? 
              new Date(selectedChild.createdAt.seconds * 1000).toLocaleDateString() : 
              'Unknown'
          }}
        />

        <QuickStats stats={childProgress} />

        <PlaceholderCharts 
          showSubjects={false} 
          subjects={[]} 
        />

        <RecentActivity activities={childProgress.recentActivity} />

        <AddStudentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          userRole="parent"
          userId={auth.currentUser?.uid}
          onSuccess={handleChildAdded}
        />
      </div>
    </div>
  );
};

export default ParentDashboard;