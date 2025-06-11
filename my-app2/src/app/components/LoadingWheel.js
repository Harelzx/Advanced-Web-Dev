import React from 'react';

export default function LoadingWheel({ title, message }) {
  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96 text-center" dir="rtl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-white text-xl">{title}</h2>
          <p className="text-gray-300 mt-2">{message}</p>
        </div>
      </div>
    );
}