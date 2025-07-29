'use client';

import { useEffect } from 'react';

/**
 * Fullscreen Chart Modal Component
 * Provides a mobile-optimized fullscreen view for charts
 */
export default function ChartModal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  isDark = false 
}) {
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${
      isDark 
        ? 'bg-black bg-opacity-90' 
        : 'bg-gray-900 bg-opacity-95'
    }`}>
      {/* Modal Header */}
      <div className={`flex items-center justify-between p-4 shadow-lg flex-shrink-0 border-b ${
        isDark
          ? 'bg-gray-900 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-lg font-semibold truncate flex-1 ${
          isDark ? 'text-white' : 'text-gray-800'
        }`}>
          {title}
        </h2>
        <button
          onClick={onClose}
          className={`ml-4 p-2 rounded-full transition-colors ${
            isDark
              ? 'bg-gray-800 hover:bg-gray-700'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          aria-label="סגור גרף"
        >
          <svg 
            className={`w-6 h-6 ${isDark ? 'text-gray-200' : 'text-gray-600'}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Modal Content - Scrollable */}
      <div className={`flex-1 overflow-y-auto p-4 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className={`rounded-lg shadow-xl p-4 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          {children}
        </div>
      </div>

      {/* Close instruction */}
      <div className={`flex-shrink-0 p-4 text-center ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <p className={`text-sm opacity-75 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          הקש כדי לסגור או הקש ESC
        </p>
      </div>

      {/* Overlay click to close */}
      <div 
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-label="סגור גרף"
      />
    </div>
  );
}