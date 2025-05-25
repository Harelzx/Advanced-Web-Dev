'use client'
import { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/config';
import { doc, getDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
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
import { generateProgressData } from '../../utils/progressGenerator';

const ParentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [parentData, setParentData] = useState(null);
  const [childrenData, setChildrenData] = useState([]);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [childToRemove, setChildToRemove] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  const fetchChildrenData = async (children, setChildrenData, setError, setSelectedChildIndex, selectedChildIndex) => {
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
              addedAt: child.addedAt, // Keep this for removal
              ...childDocSnap.data()
            });
          } else {
            childrenInfo.push(child);
          }
        } catch (err) {
          console.error(`Error fetching child ${child.id}:`, err);
          childrenInfo.push(child);
        }
      }
      setChildrenData(childrenInfo);
      if (selectedChildIndex >= childrenInfo.length) {
        setSelectedChildIndex(Math.max(0, childrenInfo.length - 1));
      }
    } catch (error) {
      console.error("Error fetching children data:", error);
      setError('Error loading children data');
    }
  };

  const fetchLegacyStudentData = async (studentEmail, setChildrenData, setError) => {
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

  useEffect(() => {
    let unsubscribeAuth;
    let unsubscribeParent;
    setLoading(true);
    unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace('/login');
        return;
      }
      // Set up real-time listener for parent data
      const parentDocRef = doc(db, "users", currentUser.uid);
      unsubscribeParent = onSnapshot(parentDocRef, async (docSnap) => {
        if (!docSnap.exists()) {
          setError('Parent data not found');
          setLoading(false);
          return;
        }
        const parentInfo = docSnap.data();
        if (parentInfo.role !== 'parent') {
          router.replace('/login');
          return;
        }
        setParentData(parentInfo);
        if (parentInfo.children && parentInfo.children.length > 0) {
          await fetchChildrenData(parentInfo.children, setChildrenData, setError, setSelectedChildIndex, selectedChildIndex);
        } else {
          if (parentInfo.studentEmail) {
            await fetchLegacyStudentData(parentInfo.studentEmail, setChildrenData, setError);
          } else {
            setChildrenData([]);
          }
        }
        setLoading(false);
      });
    });
    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeParent) unsubscribeParent();
    };
  }, [router, selectedChildIndex]);

  // Modal handlers
  const handleAddChild = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleRemoveChild = (child) => {
    setChildToRemove(child);
    setIsRemoveModalOpen(true);
  };

  const handleCloseRemoveModal = () => {
    setIsRemoveModalOpen(false);
    setChildToRemove(null);
  };

  // Success handlers
  const handleChildAdded = (result) => {
    setSuccessMessage(`✅ Successfully added ${result.student.name} to your children!`);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleChildRemoved = (result) => {
    setSuccessMessage(`🗑️ ${result.person.name} has been removed from your children list.`);
    setTimeout(() => setSuccessMessage(''), 5000);
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
            isOpen={isAddModalOpen}
            onClose={handleCloseAddModal}
            userType="parent"
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
          onRemoveItem={handleRemoveChild}  // New prop
          userType="parent"
        />

        <PersonInfoCard
          person={selectedChild}
          userType="parent"
          itemCount={childrenData.length}
          showAddButton={false} 
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

        {/* Add Modal */}
        <AddStudentModal
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
          userType="parent"
          userId={auth.currentUser?.uid}
          onSuccess={handleChildAdded}
        />

        {/* Remove Modal */}
        <RemoveConfirmationModal
          isOpen={isRemoveModalOpen}
          onClose={handleCloseRemoveModal}
          userType="parent"
          userId={auth.currentUser?.uid}
          personToRemove={childToRemove}
          onSuccess={handleChildRemoved}
        />
      </div>
    </div>
  );
};

export default ParentDashboard;