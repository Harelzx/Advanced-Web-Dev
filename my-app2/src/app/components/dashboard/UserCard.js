'use client';

import { useState } from 'react';
import StatsCard from './StatsCard';
import ProgressBar from './ProgressBar';

// A unified card component for displaying student/child data.
export default function UserCard({ user, role, onRemove }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!user) return null;

  // Common data
  const { name, averageGrade, grades, trainingProgress, practicePerformance, averageTimeSpent, wrongQuestions } = user;

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

  const title = (
    <div className="flex justify-between items-center w-full">
      <span className="font-semibold text-gray-800">{name}</span>
      <button
        onClick={() => onRemove(user)}
        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs flex-shrink-0"
        title={`הסר ${role === 'teacher' ? 'תלמיד/ה' : 'ילד/ה'}`}
      >
        הסר
      </button>
    </div>
  );

  return (
    <StatsCard title={title}>
      <div className="space-y-4">
        {/* Training Progress */}
        {trainingProgress && (
          <div>
            <p className="font-medium text-gray-700 mb-2">התקדמות באימון</p>
            <ProgressBar percentage={completionPercentage} color="bg-blue-500" />
            <div className="flex justify-between items-center mt-1 text-sm text-gray-600">
              <span>{totalSessions || 0} / {trainingProgress.completedSessions} מפגשים</span>
              <span className="font-bold text-blue-600">{completionPercentage}%</span>
            </div>
            {lastActivityDate && (
              <div className="text-xs text-gray-500 text-right mt-2">
                <span className="font-semibold">פעילות אחרונה:</span> {lastActivityDate.toLocaleDateString('he-IL')}
              </div>
            )}
          </div>
        )}

        {/* Average Grade */}
        <div>
          <p className="font-medium text-gray-700 mb-1">ממוצע מבחן ראשוני</p>
          <div className="flex justify-between items-center">
            <p className={`text-2xl font-bold ${averageGrade >= 80 ? "text-green-600" : averageGrade >= 60 ? "text-yellow-600" : "text-red-600"}`}>
              {averageGrade?.toFixed(1) || 0}%
            </p>
            <button onClick={() => setShowDetails(!showDetails)} className="text-sm text-blue-600 hover:underline">
              {showDetails ? 'הסתר פרטים' : 'הצג פרטים'}
            </button>
          </div>
        </div>
        
        {/* Strengths, Weaknesses and Avg Time */}
        {(practicePerformance || averageTimeSpent > 0) && (
            <div className="flex flex-wrap justify-around text-center border-t pt-4">
                {strong && (
                  <div className="px-2">
                    <p className="text-sm font-semibold text-gray-500">נושא חזק</p>
                    <p className="font-bold text-green-600">{strong[0]} ({Math.round(strong[1])}%)</p>
                  </div>
                )}
                {weak && (
                  <div className="px-2">
                    <p className="text-sm font-semibold text-gray-500">דורש שיפור</p>
                    <p className="font-bold text-red-600">{weak[0]} ({Math.round(weak[1])}%)</p>
                  </div>
                )}
                {averageTimeSpent > 0 && (
                  <div className="px-2">
                    <p className="text-sm font-semibold text-gray-500">זמן תרגול ממוצע</p>
                    <p className="font-bold text-indigo-600">{averageTimeSpent.toFixed(0)} דקות</p>
                  </div>
                )}
            </div>
        )}
        
        {/* Wrong Questions Count */}
        {wrongQuestions && Object.keys(wrongQuestions).length > 0 && (
          <div className="mt-2 text-sm text-gray-600 border-t pt-3">
            <span className="font-medium">שאלות שגויות: </span>
            {Object.values(wrongQuestions).reduce((total, questions) => total + (Array.isArray(questions) ? questions.length : 0), 0)} {'סה"כ'}
          </div>
        )}

        {/* Detailed Subjects Breakdown (Collapsible) */}
        {showDetails && (
          <div className="text-sm border-t pt-3 mt-3 text-right">
            <p className="font-semibold text-gray-700 mb-2">ציוני מבחן ראשוני:</p>
            {Object.entries(grades || {}).map(([subject, grade]) => (
              <div key={subject} className="flex justify-between mb-1">
                <span className="text-gray-600">{subject}:</span>
                <span className={`font-bold ${grade >= 80 ? "text-green-600" : grade >= 60 ? "text-yellow-600" : "text-red-600"}`}>
                  {grade}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </StatsCard>
  );
} 