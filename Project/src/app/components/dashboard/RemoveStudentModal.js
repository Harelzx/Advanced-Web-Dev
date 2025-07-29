'use client'
import { useState } from 'react';
import { db } from '../../firebase/config';
import { doc, updateDoc, arrayRemove, deleteField } from 'firebase/firestore';

// A confirmation modal for removing a student/child from a teacher/parent's list.
export default function RemoveStudentModal({ 
  isOpen, 
  onClose, 
  student, 
  userRole, 
  userId, 
  onStudentRemoved 
}) {
  const [removing, setRemoving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const removeStudent = async () => {
    if (!student) return;
    
    setRemoving(true);
    setErrorMessage(''); // Clear any previous error messages
    try {
      // Remove student from teacher/parent's children array
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        children: arrayRemove(student.id)
      });

      // Remove teacher/parent reference from student
      const studentDocRef = doc(db, 'users', student.id);
      const updateField = userRole === 'teacher' ? 'teacherId' : 'parentId';
      
      await updateDoc(studentDocRef, {
        [updateField]: null  // Use null to clear the field
      });

      // Notify parent component to refresh data
      if (onStudentRemoved) {
        onStudentRemoved();
      }
      
      // Close modal
      onClose();
    } catch (error) {
      setErrorMessage(`נכשל בהסרת ה${userRole === 'teacher' ? 'תלמיד/ה' : 'ילד/ה'}. אנא נסה/י שוב.`);
    } finally {
      setRemoving(false);
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" dir="rtl">
      <div className="panels p-6 rounded-lg shadow-xl w-96 isolate">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            הסר {userRole === 'teacher' ? 'תלמיד/ה' : 'ילד/ה'}
          </h3>
          <button
            onClick={onClose}
            className="btn-close"
          >
            ×
          </button>
        </div>

        {/* Student Info */}
        <div className="mb-6 text-right">
          <div className="panels p-4 rounded-lg border border-gray-200 dark:border-gray-600 isolate relative z-10">
            
            {/* Student Stats */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">ציון ממוצע:</span>
                <span className={`font-bold ${
                  student.averageGrade >= 80 ? "text-green-600 dark:text-green-400" : 
                  student.averageGrade >= 60 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"
                }`}>
                  {student.averageGrade ? student.averageGrade.toFixed(1) : 0}%
                </span>
              </div>
              
              {Object.keys(student.grades || {}).length > 0 && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">מקצועות:</span>
                  <div className="mr-2 mt-1">
                    {Object.entries(student.grades).map(([subject, grade]) => (
                      <div key={subject} className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">{subject}:</span>
                        <span className={`font-medium ${
                          grade >= 80 ? "text-green-600 dark:text-green-400" : 
                          grade >= 60 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"
                        }`}>
                          {grade}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-red-600 dark:text-red-400 ml-2">❌</span>
                <span className="text-red-800 dark:text-red-200 font-medium">{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage('')}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 mr-2"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Warning Message */}
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-right">
          <div className="flex items-center mb-2">
            <span className="text-red-600 dark:text-red-400 ml-2">⚠️</span>
            <span className="text-red-800 dark:text-red-200 font-medium">אזהרה</span>
          </div>
          <p className="text-red-700 dark:text-red-300 text-sm">
            האם את/ה בטוח/ה שברצונך להסיר את ה{userRole === 'teacher' ? 'תלמיד/ה' : 'ילד/ה'} הזה/זו?
            פעולה זו תנתק אותם מחשבונך ולא תהיה לך עוד אפשרות לעקוב אחר התקדמותם.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={removing}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded disabled:opacity-50"
          >
            ביטול
          </button>
          <button
            onClick={removeStudent}
            disabled={removing}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded disabled:opacity-50"
          >
            {removing ? 'מסיר...' : `הסר ${userRole === 'teacher' ? 'תלמיד/ה' : 'ילד/ה'}`}
          </button>
        </div>
      </div>
    </div>
  );
}