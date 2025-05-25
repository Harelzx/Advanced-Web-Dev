'use client'
import { useState } from 'react';
import { auth, db } from '../../firebase/config'; // ודא שייבוא db תקין
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, getDoc, serverTimestamp } from 'firebase/firestore';

const AddStudentModal = ({ isOpen, onClose, userType, userId, onSuccess }) => {
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
    setSubmitMessage('Searching for student...');

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', studentEmail.trim()), where('role', '==', 'student'));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setSubmitMessage('No student found with this email address');
        setIsSubmitting(false);
        return;
      }

      const studentDoc = querySnapshot.docs[0];
      const studentDataFromDb = studentDoc.data();
      
      if (userType === 'parent') {
        await handleParentAddChild(studentDoc.id, studentDataFromDb);
      } else if (userType === 'teacher') {
        await handleTeacherAddStudent(studentDoc.id, studentDataFromDb);
      } else {
        setSubmitMessage('Error: Unknown user type specified.');
        setIsSubmitting(false);
      }

    } catch (error) {
      setSubmitMessage(`Error finding student: ${error.message}. Please try again.`);
      setIsSubmitting(false);
    }
  };

  const handleParentAddChild = async (studentDocId, studentData) => {
    setSubmitMessage('Adding child to parent...');

    try {
      const parentDocRef = doc(db, 'users', userId);

      const parentSnap = await getDoc(parentDocRef);

      if (parentSnap.exists()) {
        const parentRealData = parentSnap.data();

        if (parentRealData.children && parentRealData.children.some(child => child.id === studentDocId || child.email === studentData.email)) {
          setSubmitMessage('This child is already in your list');
          setIsSubmitting(false);
          return;
        }
      } else {
        setSubmitMessage('Error: Your user profile was not found.');
        setIsSubmitting(false);
        return;
      }

      const childToAdd = {
        id: studentDocId,
        email: studentData.email,
        name: studentData.fullName || studentData.name || studentData.email.split('@')[0],
        addedAt: new Date()
      };

      await updateDoc(parentDocRef, {
        children: arrayUnion(childToAdd)
      });

      setSubmitMessage('Child added successfully! 🎉');
      setStudentEmail('');

      if (onSuccess) {
        onSuccess({
          type: 'child',
          student: { ...childToAdd, addedAt: new Date() }
        });
      }
      
      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (error) {
      setSubmitMessage(`Error adding child: ${error.message}. Please try again.`);
      setIsSubmitting(false);
    }
  };

  const handleTeacherAddStudent = async (studentDocId, studentData) => {
    setSubmitMessage('Linking student to teacher...');

    try {
      const teacherDocRef = doc(db, 'users', userId);

      const teacherSnap = await getDoc(teacherDocRef);

      if (teacherSnap.exists()) {
        const teacherRealData = teacherSnap.data();

        if (teacherRealData.students && teacherRealData.students.some(student => student.id === studentDocId || student.email === studentData.email)) {
          setSubmitMessage('This student is already in your class');
          setIsSubmitting(false);
          return;
        }
      } else {
        setSubmitMessage('Error: Your user profile was not found.');
        setIsSubmitting(false);
        return;
      }

      const studentToAdd = {
        id: studentDocId,
        email: studentData.email,
        name: studentData.fullName || studentData.name || studentData.email.split('@')[0],
        addedAt: new Date()
      };

      await updateDoc(teacherDocRef, {
        students: arrayUnion(studentToAdd)
      });

      setSubmitMessage('Student added to your class successfully! 🎉');
      setStudentEmail('');

      if (onSuccess) {
        onSuccess({
          type: 'student',
          student: { ...studentToAdd, addedAt: new Date() }
        });
      }
      
      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (error) {
      setSubmitMessage(`Error adding student to class: ${error.message}. Please try again.`);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const modalTitle = userType === 'parent' ? '👶 Add Child' : '🎓 Add Student';
  const emailLabel = userType === 'parent' ? "Child's Email Address" : "Student's Email Address";
  const emailHelp = userType === 'parent' 
    ? "Enter the email address your child used to register as a student"
    : "Enter the email address of the student you want to add to your class";
  const submitButtonText = userType === 'parent' ? 'Add Child' : 'Add Student';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white text-2xl font-bold">{modalTitle}</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white text-2xl transition-colors"
            disabled={isSubmitting}
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
                : submitMessage.includes('Error') || submitMessage.includes('No student found') || submitMessage.includes('already in your list')
                  ? 'bg-red-900 text-red-300 border border-red-700'
                  : 'bg-blue-900 text-blue-300 border border-blue-700'
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