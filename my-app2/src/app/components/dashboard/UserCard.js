'use client';

import { useState } from 'react';
import StatsCard from './StatsCard';
import ProgressBar from './ProgressBar';

// A unified card component for displaying student/child data.
export default function UserCard({ user, student, role, userRole, onRemove }) {
  const [showDetails, setShowDetails] = useState(false);

  // Support both 'user' and 'student' props for backward compatibility
  const userData = user || student;
  const currentRole = role || userRole;

  if (!userData) return null;

  // Common data
  const { name, averageGrade, grades, trainingProgress, practicePerformance, averageTimeSpent, wrongQuestions } = userData;

  // Data processing for progress bar and strengths/weaknesses
  const totalSessions = 9;
  const completionPercentage = trainingProgress?.completedSessions
    ? Math.round((trainingProgress.completedSessions / totalSessions) * 100)
    : 0;
  const lastActivityDate = trainingProgress?.lastActivity?.toDate();

  const getSubjectStrength = () => {
    if (!practicePerformance || Object.keys(practicePerformance).length === 0) {
      return { strong: null, weak: null };
    }
    const sortedSubjects = Object.entries(practicePerformance).sort((a, b) => b[1] - a[1]);
    const strong = sortedSubjects[0];
    const weak = sortedSubjects[sortedSubjects.length - 1];
    return { strong, weak };
  };
  const { strong, weak } = getSubjectStrength();

  return (
    <div className="panels p-4 rounded-lg shadow">
      {/* Header with name and remove button */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">{name}</h3>
        <button
          onClick={() => onRemove(userData)}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
          title={`הסר ${currentRole === 'teacher' ? 'תלמיד/ה' : 'ילד/ה'}`}
        >
          הסר
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Training Progress */}
        {trainingProgress && (
          <div>
            <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">התקדמות באימון</p>
            <ProgressBar percentage={completionPercentage} color="bg-blue-500" />
            <div className="flex justify-between items-center mt-1 text-sm text-gray-600 dark:text-gray-400">
              <span>{totalSessions || 0} / {trainingProgress.completedSessions} מפגשים</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{completionPercentage}%</span>
            </div>
            {lastActivityDate && (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-right mt-2">
                <span className="font-semibold text-gray-600 dark:text-gray-300">פעילות אחרונה:</span> <span className="font-semibold text-gray-600 dark:text-gray-300">{lastActivityDate.toLocaleDateString('he-IL')}</span>
              </div>
            )}
          </div>
        )}

        {/* Average Grade */}
        <div>
          <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">ממוצע מבחן ראשוני</p>
          <div className="flex justify-between items-center">
            <p className={`text-2xl font-bold ${averageGrade >= 80 ? "text-green-600 dark:text-green-400" : averageGrade >= 60 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"}`}>
              {averageGrade?.toFixed(1) || 0}%
            </p>
            <button onClick={() => setShowDetails(!showDetails)} className="text-button">
              {showDetails ? 'הסתר פרטים' : 'הצג פרטים'}
            </button>
          </div>
        </div>
        
        {/* Detailed Subjects Breakdown (Collapsible) */}
        {showDetails && (
          <div className="text-sm border-t border-gray-200 dark:border-gray-600 pt-3 mt-3 text-right">
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">ציוני מבחן ראשוני:</p>
            {Object.entries(grades || {}).map(([subject, grade]) => (
              <div key={subject} className="flex justify-between mb-1">
                <span className="text-gray-600 dark:text-gray-400">{subject}:</span>
                <span className={`font-bold ${grade >= 80 ? "text-green-600 dark:text-green-400" : grade >= 60 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"}`}>
                  {grade}%
                </span>
              </div>
            ))}
          </div>
        )}
        
        {/* Strengths, Weaknesses and Avg Time */}
        {(practicePerformance || averageTimeSpent > 0) && (
            <div className="flex flex-wrap justify-around text-center border-t border-gray-200 dark:border-gray-600 pt-4">
                {strong && (
                  <div className="px-2">
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">נושא חזק</p>
                    <p className="font-bold text-green-600 dark:text-green-400">{strong[0]} ({Math.round(strong[1])}%)</p>
                  </div>
                )}
                {weak && (
                  <div className="px-2">
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">דורש שיפור</p>
                    <p className="font-bold text-red-600 dark:text-red-400">{weak[0]} ({Math.round(weak[1])}%)</p>
                  </div>
                )}
                {averageTimeSpent > 0 && (
                  <div className="px-2">
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">זמן תרגול ממוצע</p>
                    <p className="font-bold text-indigo-600 dark:text-indigo-400">{averageTimeSpent.toFixed(0)} דקות</p>
                  </div>
                )}
            </div>
        )}
        
        {/* Wrong Questions Count */}
        {wrongQuestions && Object.keys(wrongQuestions).length > 0 && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-3">
            <span className="font-medium">שאלות שגויות: </span>
            {Object.values(wrongQuestions).reduce((total, questions) => total + (Array.isArray(questions) ? questions.length : 0), 0)} {'סה"כ'}
          </div>
        )}
      </div>
    </div>
  );
} 