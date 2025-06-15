// components/PersonalizedPath/ProgressSection.js
"use client";
import React from 'react';
import ProgressBar from '../dashboard/ProgressBar';

export default function ProgressSection({ completedSteps, total, percentage }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">התקדמות במסלול</h3>
        <span className="text-sm text-gray-500">{completedSteps} מתוך {total}</span>
        <div className="flex items-center space-x-4 space-x-reverse">
          <span className="text-2xl font-bold text-blue-600">{percentage}%</span>
        </div>
      </div>
      <ProgressBar percentage={percentage} color="bg-blue-600" height="h-4" />
      {percentage === 100 && (
        <div className="mt-4 text-center">
          <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            🎉 כל הכבוד! סיימת את כל המסלול
          </span>
        </div>
      )}
    </div>
  );
}
