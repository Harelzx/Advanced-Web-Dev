// AddStudentModal.js - תיקון למיקום במרכז המסך
'use client'

import { useState } from 'react';
import { auth, db } from '../../firebase/config';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';

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
    console.log('Form submitted with email:', studentEmail);

    if (!studentEmail.trim()) {
      setSubmitMessage('Please enter a valid email address');
      return;
    }

    if (!userId) {
      console.error('No userId provided');
      setSubmitMessage('Error: User ID is missing');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('Searching for student...');

    try {
      console.log('Searching for student with email:', studentEmail.trim());
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', studentEmail.trim()), where('role', '==', 'student'));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('No student found with email:', studentEmail.trim());
        setSubmitMessage('No student found with this email address');
        setIsSubmitting(false);
        return;
      }

      const studentDoc = querySnapshot.docs[0];
      const studentDataFromDb = studentDoc.data();
      console.log('Found student:', studentDataFromDb);
      
      if (userType === 'parent') {
        await handleAddPerson(studentDoc.id, studentDataFromDb, 'parent', 'children', 'child');
      } else if (userType === 'teacher') {
        await handleAddPerson(studentDoc.id, studentDataFromDb, 'teacher', 'students', 'student');
      } else {
        console.error('Unknown user type:', userType);
        setSubmitMessage('Error: Unknown user type specified.');
        setIsSubmitting(false);
      }

    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setSubmitMessage(`Error finding student: ${error.message}. Please try again.`);
      setIsSubmitting(false);
    }
  };

  const handleAddPerson = async (studentDocId, studentData, userType, arrayField, personType) => {
    console.log('Adding person:', { studentDocId, studentData, userType, arrayField, personType });
    setSubmitMessage(`Adding ${personType} to ${userType}...`);

    try {
      const userDocRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        console.error('User document not found for ID:', userId);
        setSubmitMessage('Error: Your user profile was not found.');
        setIsSubmitting(false);
        return;
      }

      const userData = userSnap.data();
      console.log('Current user data:', userData);

      if (userData[arrayField] && userData[arrayField].some(person => person.id === studentDocId || person.email === studentData.email)) {
        console.log('Person already exists in list');
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

      console.log('Adding person:', personToAdd);
      await updateDoc(userDocRef, {
        [arrayField]: arrayUnion(personToAdd)
      });

      setSubmitMessage(`${personType} added successfully! 🎉`);
      setStudentEmail('');

      if (onSuccess) {
        console.log('Calling onSuccess callback');
        onSuccess({
          type: personType,
          student: { ...personToAdd, addedAt: new Date() }
        });
      }
      
      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (error) {
      console.error('Error in handleAddPerson:', error);
      setSubmitMessage(`Error adding ${personType}: ${error.message}. Please try again.`);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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