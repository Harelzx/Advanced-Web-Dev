'use client';

import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function EditProfileModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onProfileUpdated 
}) {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && currentUser) {
      setFormData({
        fullName: currentUser.fullName || '',
        phoneNumber: currentUser.phoneNumber || ''
      });
      setError('');
    }
  }, [isOpen, currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.fullName.trim()) {
      setError('שם מלא הוא שדה חובה');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Update user document in Firestore
      const userRef = doc(db, 'users', currentUser.id);
      const updateData = {
        fullName: formData.fullName.trim(),
      };

      // Add phone number if provided
      if (formData.phoneNumber.trim()) {
        updateData.phoneNumber = formData.phoneNumber.trim();
      }

      await updateDoc(userRef, updateData);

      // Notify parent component of successful update
      if (onProfileUpdated) {
        onProfileUpdated({
          ...currentUser,
          ...updateData
        });
      }

      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('שגיאה בעדכון הפרופיל. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="panels p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            עריכת פרופיל
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Field */}
          <div>
            <label 
              htmlFor="fullName" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              שם מלא *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="הכנס שם מלא"
              required
              disabled={loading}
            />
          </div>

          {/* Phone Number Field */}
          <div>
            <label 
              htmlFor="phoneNumber" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              מספר טלפון (אופציונלי)
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="050-1234567"
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={loading}
            >
              ביטול
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 
                         disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              disabled={loading}
            >
              {loading ? 'שומר...' : 'שמור שינויים'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}