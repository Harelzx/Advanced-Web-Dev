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

      // Call success callback immediately
      if (onSuccess) {
        onSuccess({
          type: userType === 'parent' ? 'child' : 'student',
          person: personToRemove
        });
      }

      // Show success message and close modal after 1.5 seconds
      const personType = userType === 'parent' ? 'child' : 'student';
      setRemoveMessage(`✅ ${personToRemove.name} has been removed successfully!`);
      
      // Close modal after 1.5 seconds
      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (error) {
      const personType = userType === 'parent' ? 'child' : 'student';
      setRemoveMessage(`❌ Error removing ${personType}. Please try again.`);
      setIsRemoving(false);
    }
  };

  if (!isOpen || !personToRemove) return null;

  const personType = userType === 'parent' ? 'child' : 'student';
  const modalTitle = userType === 'parent' ? '🗑️ Remove Child' : '🗑️ Remove Student';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white text-2xl font-bold">{modalTitle}</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white text-2xl transition-colors"
            disabled={isRemoving}
          >
            ×
          </button>
        </div>

        {/* Person Info */}
        <div className="bg-gray-700 p-4 rounded-lg mb-4">
          <div className="text-white font-semibold mb-1">{personToRemove.name}</div>
          <div className="text-gray-300 text-sm">{personToRemove.email}</div>
        </div>

        {/* Warning Message */}
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-4">
          <p className="text-red-200 text-sm">
            ⚠️ Are you sure you want to remove <strong>{personToRemove.name}</strong> from your {personType} list?
          </p>
          <p className="text-red-300 text-xs mt-2">
            This action cannot be undone. You'll need to add them again if you change your mind.
          </p>
        </div>

        {/* Success/Error Message */}
        {removeMessage && (
          <div className={`p-3 rounded-lg text-sm transition-all mb-4 ${
            removeMessage.includes('✅')
              ? 'bg-green-900 text-green-300 border border-green-700'
              : 'bg-red-900 text-red-300 border border-red-700'
          }`}>
            {removeMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            disabled={isRemoving}
          >
            Cancel
          </button>
          <button
            onClick={handleRemove}
            className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isRemoving}
          >
            {isRemoving ? 'Removing...' : `Remove ${personType === 'child' ? 'Child' : 'Student'}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveConfirmationModal;