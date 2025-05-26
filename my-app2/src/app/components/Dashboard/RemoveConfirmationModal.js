// RemoveConfirmationModal.js - תיקון למיקום במרכז המסך
'use client'

import { useState } from 'react';
import { db } from '../../firebase/config';
import { doc, updateDoc, arrayRemove, getDoc } from 'firebase/firestore';

const RemoveConfirmationModal = ({
  isOpen,
  onClose,
  userType,
  userId,
  personToRemove,
  onSuccess
}) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeMessage, setRemoveMessage] = useState('');

  const handleClose = () => {
    if (isRemoving) return; // Don't close if removing
    setRemoveMessage('');
    setIsRemoving(false);
    onClose();
  };

  const handleRemove = async () => {
    if (!personToRemove) return;

    setIsRemoving(true);
    setRemoveMessage('');

    try {
      const userDocRef = doc(db, 'users', userId);
      const fieldName = userType?.toLowerCase() === 'parent' ? 'children' : 'students';
      
      // Get current user data
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        throw new Error('User document not found');
      }

      const userData = userDoc.data();
      const currentArray = userData[fieldName] || [];
      
      // Find the item to remove by ID
      const itemToRemove = currentArray.find(item => item.id === personToRemove.id);
      
      if (!itemToRemove) {
        throw new Error('Item not found in array');
      }

      // Remove the item from the array
      await updateDoc(userDocRef, {
        [fieldName]: arrayRemove(itemToRemove)
      });

      // Show success message
      const personType = userType === 'parent' ? 'child' : 'student';
      setRemoveMessage(`✅ ${personToRemove.name} has been removed successfully!`);
      setIsRemoving(false);

      // המתן 4 שניות כשהמודאל עדיין פתוח ומציג את הודעת ההצלחה
      await new Promise(resolve => setTimeout(resolve, 4000));

      // רק לאחר ההמתנה, קרא לפונקציית ההצלחה וסגור את המודאל
      if (onSuccess) {
        onSuccess({
          type: userType === 'parent' ? 'child' : 'student',
          person: personToRemove
        });
      }
      
      handleClose();

    } catch (error) {
      const personType = userType === 'parent' ? 'child' : 'student';
      setRemoveMessage(`❌ Error removing ${personType}. Please try again.`);
      setIsRemoving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content modal-enter">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-600 rounded-t">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {userType === 'parent' ? 'Remove Child' : 'Remove Student'}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
            disabled={isRemoving}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1l12 12M13 1L1 13"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to remove <span className="font-semibold">{personToRemove?.name}</span> from your {userType === 'parent' ? 'children' : 'students'} list?
              This action cannot be undone.
            </p>

            {removeMessage && (
              <div className={`p-3 rounded ${
                removeMessage.includes('Error') ? 'bg-red-500' : 'bg-green-500'
              } text-white`}>
                {removeMessage}
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                disabled={isRemoving}
              >
                Cancel
              </button>
              <button
                onClick={handleRemove}
                disabled={isRemoving}
                className={`px-6 py-2 rounded-lg font-medium text-white ${
                  isRemoving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300'
                }`}
              >
                {isRemoving ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoveConfirmationModal;