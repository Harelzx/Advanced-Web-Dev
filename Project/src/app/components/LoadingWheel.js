import React from 'react';
import { useTheme } from './ThemeContext';

export default function LoadingWheel({ title, message }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex items-center justify-center ${
      isDark ? 'bg-gray-900' : 'bg-white'
    }`}>
      <div className={`p-10 rounded-lg shadow-xl w-96 text-center ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      } border`} dir="rtl">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
          isDark ? 'border-blue-400' : 'border-blue-500'
        } mx-auto mb-4`}></div>
        <h2 className={`text-xl font-semibold ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>{title}</h2>
        <p className={`mt-2 ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>{message}</p> 
      </div>
    </div>
  );
}
