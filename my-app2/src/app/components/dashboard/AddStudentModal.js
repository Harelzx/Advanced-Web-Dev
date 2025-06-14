'use client'
import { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, getDocs, query, where, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';

// A modal for teachers/parents to search for and add students/children to their list.
export default function AddStudentModal({ isOpen, onClose, userRole, userId, onStudentAdded }) {
  const [availableStudents, setAvailableStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset messages when modal opens
      setErrorMessage('');
      setSuccessMessage('');
      setSearchTerm('');
      fetchAvailableStudents();
    }
  }, [isOpen]);

  const fetchAvailableStudents = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'student'));
      const querySnapshot = await getDocs(q);
      
      const students = [];
      querySnapshot.forEach((doc) => {
        const studentData = doc.data();
        // For simplicity, show all students. In real app, filter by availability
        students.push({
          id: doc.id,
          name: studentData.fullName || studentData.email,
          email: studentData.email,
          parentId: studentData.parentId || null,
          teacherId: studentData.teacherId || null
        });
      });
      
      setAvailableStudents(students);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (studentId) => {
    setAdding(true);
    try {
      // First, get current user data to check if children field exists
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        throw new Error('User not found');
      }

      const userData = userDocSnap.data();
      const currentChildren = userData.children || [];

      // Check if student is already added
      if (currentChildren.includes(studentId)) {
        setErrorMessage(`ה${userRole === 'teacher' ? 'תלמיד/ה' : 'ילד/ה'} הזה/זו כבר קיים/ת ברשימה שלך.`);
        return;
      }

      // Update the teacher/parent document to include this student
      await updateDoc(userDocRef, {
        children: arrayUnion(studentId)
      });

      // Update the student document to link to this teacher/parent
      const studentDocRef = doc(db, 'users', studentId);
      const updateField = userRole === 'teacher' ? 'teacherId' : 'parentId';
      await updateDoc(studentDocRef, {
        [updateField]: userId
      });

      // Notify parent component to refresh data
      if (onStudentAdded) {
        onStudentAdded();
      }
      
      // Show success message briefly then close modal
      setSuccessMessage(`${userRole === 'teacher' ? 'תלמיד/ה' : 'ילד/ה'} נוסף/ה בהצלחה!`);
      setTimeout(() => {
        onClose();
      }, 1500);
          } catch (error) {
        console.error('Error adding student:', error);
        setErrorMessage(`נכשל בהוספת ${userRole === 'teacher' ? 'תלמיד/ה' : 'ילד/ה'}. אנא נסה/י שוב.`);
      } finally {
      setAdding(false);
    }
  };

  const filteredStudents = availableStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="panels p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            הוסף {userRole === 'teacher' ? 'תלמיד/ה' : 'ילד/ה'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✅</span>
              <span className="text-green-800 font-medium">{successMessage}</span>
            </div>
          </div>
        )}
        
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-red-600 mr-2">❌</span>
                <span className="text-red-800 font-medium">{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage('')}
                className="text-red-600 hover:text-red-800 ml-2"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Search Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
            חפש אחר {userRole === 'teacher' ? 'תלמיד/ה' : 'ילד/ה'}:
          </label>
          <input
            type="text"
            placeholder="הזן שם או אימייל..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-gray-900 placeholder-gray-500 panels text-right"
            style={{ color: '#111827', backgroundColor: '#ffffff' }}
          />
        </div>

        {/* Students List */}
        <div className="max-h-64 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4">
              <div className="text-gray-600">טוען תלמידים...</div>
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="space-y-2">
              {filteredStudents.map((student) => (
                <div key={student.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                  <div>
                    <div className="font-medium text-gray-800">{student.name}</div>
                    <div className="text-sm text-gray-600">{student.email}</div>
                    {(student.parentId || student.teacherId) && (
                      <div className="text-xs text-orange-600">
                        כבר משוייך ל{student.parentId ? 'הורה' : 'מורה'}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => addStudent(student.id)}
                    disabled={adding}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                  >
                    {adding ? 'מוסיף...' : 'הוסף'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-600">
              {searchTerm ? 'לא נמצאו תלמידים תואמים לחיפוש שלך.' : 'אין תלמידים זמינים.'}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="mt-4 text-left">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
} 