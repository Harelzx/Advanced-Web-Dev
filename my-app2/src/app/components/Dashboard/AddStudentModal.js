'use client'
import { useState } from 'react';
import { db } from '@/app/firebase/config';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';

const AddStudentModal = ({ isOpen, onClose, userRole, userId, onSuccess }) => {
  const [studentEmail, setStudentEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleClose = () => {
    setStudentEmail('');
    setSubmitMessage('');
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!studentEmail.trim()) {
      setSubmitMessage('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Find the student by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', studentEmail.trim()), where('role', '==', 'student'));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setSubmitMessage('No student found with this email address');
        setIsSubmitting(false);
        return;
      }

      const studentDoc = querySnapshot.docs[0];
      const studentData = studentDoc.data();
      
      // Different logic based on user role
      if (userRole === 'parent') {
        await handleParentAddChild(studentDoc, studentData);
      } else if (userRole === 'teacher') {
        await handleTeacherAddStudent(studentDoc, studentData);
      }

    } catch (error) {
      console.error('Error adding student:', error);
      setSubmitMessage('Error adding student. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleParentAddChild = async (studentDoc, studentData) => {
    try {
      // Get current parent data to check for duplicates
      const parentDocRef = doc(db, 'users', userId);
      const parentDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', userId)));
      
      if (!parentDoc.empty) {
        const parentData = parentDoc.docs[0].data();
        
        // Check if child is already added
        if (parentData.children && parentData.children.some(child => child.email === studentEmail.trim())) {
          setSubmitMessage('This child is already in your list');
          setIsSubmitting(false);
          return;
        }
      }

      // Add child to parent's children array
      await updateDoc(parentDocRef, {
        children: arrayUnion({
          id: studentDoc.id,
          email: studentData.email,
          name: studentData.fullName || studentData.name || studentData.email.split('@')[0],
          addedAt: new Date()
        })
      });

      setSubmitMessage('Child added successfully! 🎉');
      setStudentEmail('');
      
      // Call success callback
      if (onSuccess) {
        onSuccess({
          type: 'child',
          student: {
            id: studentDoc.id,
            email: studentData.email,
            name: studentData.fullName || studentData.name || studentData.email.split('@')[0]
          }
        });
      }
      
      // Close modal after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      console.error('Error adding child:', error);
      setSubmitMessage('Error adding child. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleTeacherAddStudent = async (studentDoc, studentData) => {
    try {
      // Get current teacher data to check for duplicates
      const teacherDocRef = doc(db, 'users', userId);
      const teacherDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', userId)));
      
      if (!teacherDoc.empty) {
        const teacherData = teacherDoc.docs[0].data();
        
        // Check if student is already added
        if (teacherData.students && teacherData.students.some(student => student.email === studentEmail.trim())) {
          setSubmitMessage('This student is already in your class');
          setIsSubmitting(false);
          return;
        }
      }

      // Add student to teacher's students array
      await updateDoc(teacherDocRef, {
        students: arrayUnion({
          id: studentDoc.id,
          email: studentData.email,
          name: studentData.fullName || studentData.name || studentData.email.split('@')[0],
          addedAt: new Date()
        })
      });

      setSubmitMessage('Student added to your class successfully! 🎉');
      setStudentEmail('');
      
      // Call success callback
      if (onSuccess) {
        onSuccess({
          type: 'student',
          student: {
            id: studentDoc.id,
            email: studentData.email,
            name: studentData.fullName || studentData.name || studentData.email.split('@')[0]
          }
        });
      }
      
      // Close modal after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      console.error('Error adding student:', error);
      setSubmitMessage('Error adding student to class. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const modalTitle = userRole === 'parent' ? '👶 Add Child' : '🎓 Add Student';
  const emailLabel = userRole === 'parent' ? "Child's Email Address" : "Student's Email Address";
  const emailHelp = userRole === 'parent' 
    ? "Enter the email address your child used to register as a student"
    : "Enter the email address of the student you want to add to your class";
  const submitButtonText = userRole === 'parent' ? 'Add Child' : 'Add Student';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white text-2xl font-bold">{modalTitle}</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="studentEmail" className="block text-gray-300 text-sm font-medium mb-2">
              {emailLabel}
            </label>
            <input
              id="studentEmail"
              name="studentEmail"
              type="email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              placeholder="student@example.com"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={isSubmitting}
              required
            />
            <p className="text-gray-400 text-xs mt-1">
              {emailHelp}
            </p>
          </div>

          {submitMessage && (
            <div className={`p-3 rounded-lg text-sm transition-all ${
              submitMessage.includes('successfully') || submitMessage.includes('🎉')
                ? 'bg-green-900 text-green-300 border border-green-700'
                : 'bg-red-900 text-red-300 border border-red-700'
            }`}>
              {submitMessage}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;