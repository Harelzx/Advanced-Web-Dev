import React from 'react';

export default function LoadingWheel({ title, message }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-10 rounded-lg shadow-xl w-96 text-center" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"></div>
        <h2 className="text-xl">{title}</h2>
        <p className="mt-2">{message}</p> 
      </div>
    </div>
  );
}
