'use client'
import { useState } from 'react';
import { db } from '../../firebase/config';
import { doc, updateDoc, arrayRemove, deleteField } from 'firebase/firestore';

export default function RemoveStudentModal({ 
  isOpen, 
  onClose, 
  student, 
  userRole, 
  userId, 
  onStudentRemoved 
}) {
  const [removing, setRemoving] = useState(false);

  const removeStudent = async () => {
    if (!student) return;
    
    setRemoving(true);
    try {
      console.log(`Removing ${userRole} ${userId} from student ${student.id}`);
      
      // Remove student from teacher/parent's children array
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        children: arrayRemove(student.id)
      });
      console.log('Removed student from parent/teacher children array');

      // Remove teacher/parent reference from student
      const studentDocRef = doc(db, 'users', student.id);
      const updateField = userRole === 'teacher' ? 'teacherId' : 'parentId';
      
      console.log(`Updating student field: ${updateField} to null`);
      await updateDoc(studentDocRef, {
        [updateField]: null  // Use null to clear the field
      });
      console.log('Successfully updated student document');

      // Notify parent component to refresh data
      if (onStudentRemoved) {
        onStudentRemoved();
      }
      
      // Close modal
      onClose();
    } catch (error) {
      console.error('Error removing student:', error);
      alert(`Failed to remove ${userRole === 'teacher' ? 'student' : 'child'}. Please try again.`);
    } finally {
      setRemoving(false);
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Remove {userRole === 'teacher' ? 'Student' : 'Child'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {/* Student Info */}
        <div className="mb-6">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h4 className="font-semibold text-gray-800 mb-2">{student.name}</h4>
            
            {/* Student Stats */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Average Grade:</span>
                <span className={`font-bold ${
                  student.averageGrade >= 80 ? "text-green-600" : 
                  student.averageGrade >= 60 ? "text-yellow-600" : "text-red-600"
                }`}>
                  {student.averageGrade ? student.averageGrade.toFixed(1) : 0}%
                </span>
              </div>
              
              {Object.keys(student.grades || {}).length > 0 && (
                <div>
                  <span className="text-gray-600">Subjects:</span>
                  <div className="ml-2 mt-1">
                    {Object.entries(student.grades).map(([subject, grade]) => (
                      <div key={subject} className="flex justify-between">
                        <span className="text-gray-500">{subject}:</span>
                        <span className={`font-medium ${
                          grade >= 80 ? "text-green-600" : 
                          grade >= 60 ? "text-yellow-600" : "text-red-600"
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

        {/* Warning Message */}
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center mb-2">
            <span className="text-red-600 mr-2">⚠️</span>
            <span className="text-red-800 font-medium">Warning</span>
          </div>
          <p className="text-red-700 text-sm">
            Are you sure you want to remove this {userRole === 'teacher' ? 'student' : 'child'}? 
            This will disconnect them from your account and you will no longer be able to track their progress.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={removing}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={removeStudent}
            disabled={removing}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded disabled:opacity-50"
          >
            {removing ? 'Removing...' : `Remove ${userRole === 'teacher' ? 'Student' : 'Child'}`}
          </button>
        </div>
      </div>
    </div>
  );
} 