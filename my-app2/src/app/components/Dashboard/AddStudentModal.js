// AddStudentModal.js - תיקון למיקום במרכז המסך
'use client'

import { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/config';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';

const AddStudentModal = ({ isOpen, onClose, userType, userId, onSuccess }) => {
  const [studentEmail, setStudentEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [internalOpen, setInternalOpen] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setInternalOpen(true);
  }, [isOpen]);

  const handleClose = () => {
    setStudentEmail('');
    setSubmitMessage('');
    setIsSubmitting(false);
    setInternalOpen(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!studentEmail.trim()) {
      setSubmitMessage('Please enter a valid email address');
      return;
    }

    if (!userId) {
      setSubmitMessage('Error: User ID is missing');
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
        await handleAddPerson(studentDoc.id, studentDataFromDb, 'parent', 'children', 'child');
      } else if (userType === 'teacher') {
        await handleAddPerson(studentDoc.id, studentDataFromDb, 'teacher', 'students', 'student');
      } else {
        setSubmitMessage('Error: Unknown user type specified.');
        setIsSubmitting(false);
      }

    } catch (error) {
      setSubmitMessage(`Error finding student: ${error.message}. Please try again.`);
      setIsSubmitting(false);
    }
  };

  const handleAddPerson = async (studentDocId, studentData, userType, arrayField, personType) => {
    setSubmitMessage(`Adding ${personType} to ${userType}...`);

    try {
      const userDocRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        setSubmitMessage('Error: Your user profile was not found.');
        setIsSubmitting(false);
        return;
      }

      const userData = userSnap.data();

      if (userData[arrayField] && userData[arrayField].some(person => person.id === studentDocId || person.email === studentData.email)) {
        setSubmitMessage(`This ${personType} is already in your list`);
        setIsSubmitting(false);
        return;
      }

      const personToAdd = {
        id: studentDocId,
        email: studentData.email,
        name: studentData.fullName || studentData.name || studentData.email.split('@')[0],
        addedAt: new Date()
      };

      await updateDoc(userDocRef, {
        [arrayField]: arrayUnion(personToAdd)
      });

      // קודם נסגור את המודאל
      handleClose();
      
      // רק אחרי שהמודאל נסגר, נקרא לפונקציית ההצלחה
      if (onSuccess) {
        onSuccess({
          type: personType,
          student: { ...personToAdd, addedAt: new Date() }
        });
      }

    } catch (error) {
      setSubmitMessage(`Error adding ${personType}: ${error.message}. Please try again.`);
      setIsSubmitting(false);
    }
  };

  if (!internalOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content modal-enter">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-600 rounded-t">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {userType === 'parent' ? 'Add Child' : 'Add Student'}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
            disabled={isSubmitting}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1l12 12M13 1L1 13"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="studentEmail" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                {userType === 'parent' ? 'Child\'s Email' : 'Student\'s Email'}
              </label>
              <input
                type="email"
                id="studentEmail"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                placeholder="name@company.com"
                required
                disabled={isSubmitting}
              />
            </div>

            {submitMessage && (
              <div className={`p-3 rounded ${
                submitMessage.includes('Error') || submitMessage.includes('No student') || submitMessage.includes('already') 
                  ? 'bg-red-500' 
                  : 'bg-green-500'
              } text-white`}>
                {submitMessage}
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !studentEmail}
                className={`px-6 py-2 rounded-lg font-medium text-white ${
                  isSubmitting || !studentEmail
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300'
                }`}
              >
                {isSubmitting ? 'Adding...' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStudentModal;