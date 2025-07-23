'use client';

import { useState, useMemo } from 'react';
import ProgressBar from './ProgressBar';
import { SuccessRateTrendChart, ImprovementGraph } from './PerformanceCharts';
import { useTheme } from '../ThemeContext';
import ChartModal from './ChartModal';

// A unified card component for displaying student/child data.
export default function UserCard({ student, userRole, onRemove }) {
  const [showDetails, setShowDetails] = useState(false);
  const [showChartsModal, setShowChartsModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useTheme();

  // Detect mobile screen size
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  // Data processing for progress bar and strengths/weaknesses - memoized for performance
  const { totalSessions, completedCount, completionPercentage, strong, weak } = useMemo(() => {
    if (!student?.trainingProgress && !student?.practicePerformance) {
      return {
        totalSessions: 9,
        completedCount: 0,
        completionPercentage: 0,
        strong: null,
        weak: null
      };
    }

    const { trainingProgress, practicePerformance } = student;
    const total = 9;
    // Handle both array and number formats for completedSessions
    const completed = Array.isArray(trainingProgress?.completedSessions) 
      ? trainingProgress.completedSessions.length 
      : (trainingProgress?.completedSessions || 0);
    const completion = Math.round((completed / total) * 100);

    // Calculate subject strengths and weaknesses
    let subjectStrong = null, subjectWeak = null;
    if (practicePerformance && Object.keys(practicePerformance).length > 0) {
      const sortedSubjects = Object.entries(practicePerformance).sort((a, b) => b[1] - a[1]);
      subjectStrong = sortedSubjects[0];
      subjectWeak = sortedSubjects[sortedSubjects.length - 1];
    }

    return { 
      totalSessions: total,
      completedCount: completed,
      completionPercentage: completion, 
      strong: subjectStrong, 
      weak: subjectWeak 
    };
  }, [student]);

  // Check if dark mode is active using theme context
  const isDarkMode = theme === 'dark';

  // Study frequency indicator and preferred study time - memoized for performance
  const { studyFrequency, preferredStudyTime } = useMemo(() => {
    if (!student) {
      return {
        studyFrequency: { text: 'לא זמין', color: 'text-gray-500' },
        preferredStudyTime: null
      };
    }

    const { daysSinceLastStudy, preferredStudyHour } = student;
    
    // Study frequency indicator
    let frequency;
    if (daysSinceLastStudy === null) {
      frequency = { text: 'לא התחיל לתרגל ⚪', color: 'text-gray-500' };
    } else if (daysSinceLastStudy === 0) {
      frequency = { text: 'תרגל היום 🟢', color: 'text-green-600 dark:text-green-400' };
    } else if (daysSinceLastStudy === 1) {
      frequency = { text: 'תרגל אתמול 🟢', color: 'text-green-600 dark:text-green-400' };
    } else if (daysSinceLastStudy <= 3) {
      frequency = { text: `לפני ${daysSinceLastStudy} ימים 🟡`, color: 'text-yellow-600 dark:text-yellow-400' };
    } else {
      frequency = { text: `לפני ${daysSinceLastStudy} ימים 🔴`, color: 'text-red-600 dark:text-red-400' };
    }

    // Format preferred study time
    let studyTime = null;
    if (preferredStudyHour) {
      const nextHour = preferredStudyHour + 1;
      studyTime = `${preferredStudyHour.toString().padStart(2, '0')}:00-${nextHour.toString().padStart(2, '0')}:00`;
    }

    return { studyFrequency: frequency, preferredStudyTime: studyTime };
  }, [student]);

  if (!student) return null;

  // Common data
  const { 
    name, averageGrade, grades, trainingProgress, practicePerformance, 
    averageTimeSpent, wrongQuestions, sessionAnalytics
  } = student;

  return (
    <div className="panels bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      {/* Header with name and remove button */}
      <div className="flex justify-between items-center gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 flex-1 text-right p-2 rounded-lg transition-all duration-200 border border-transparent ${
            isDarkMode 
              ? 'hover:!bg-gray-700' 
              : 'hover:!bg-blue-50 hover:!border-blue-200'
          }`}
        >
          <svg
            className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <h3 className={`font-semibold text-lg ${
            isDarkMode 
              ? '!text-white hover:!text-blue-300' 
              : '!text-black hover:!text-blue-700'
          }`}>{name}</h3>
        </button>
        <button
          onClick={() => onRemove(student)}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex-shrink-0"
          title={`הסר ${userRole === 'teacher' ? 'תלמיד/ה' : 'ילד/ה'}`}
        >
          הסר
        </button>
      </div>

      {/* Content - Only shown when expanded */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-4 mt-4">
        {/* Training Progress */}
        {trainingProgress && (
          <div>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">התקדמות באימון</p>
            <ProgressBar percentage={completionPercentage} color="bg-blue-500" />
            <div className="flex justify-between items-center mt-1 text-sm text-gray-600 dark:text-gray-400">
              <span>{totalSessions} / {completedCount} מפגשים</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{completionPercentage}%</span>
            </div>
          </div>
        )}

        {/* Study Analytics */}
        <div className="mt-4 border-t border-gray-200 dark:border-gray-600 pt-3">
          {/* Overall Average */}
          <div className="mb-2">
            <span className="text-base font-bold text-gray-800 dark:text-gray-200">ממוצע כללי: </span>
            <span className={`text-lg font-bold ${averageGrade >= 80 ? "text-green-600 dark:text-green-400" : averageGrade >= 60 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"}`}>
              {averageGrade?.toFixed(1)}%
            </span>
          </div>
          
          {/* Study Frequency */}
          <div className="mb-2">
            <span className="text-base font-bold text-gray-800 dark:text-gray-200">פעילות אחרונה: </span>
            <span className={`text-sm font-medium ${studyFrequency.color}`}>
              {studyFrequency.text}
            </span>
          </div>

          {/* Preferred Study Time */}
          {preferredStudyTime && (
            <div className="mb-2">
              <span className="text-base font-bold text-gray-800 dark:text-gray-200">שעות לימוד מועדפות: </span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {preferredStudyTime}
              </span>
            </div>
          )}
          
          {/* Initial Test Average */}
          <div className="mb-2">
            <span className="text-base font-bold text-gray-800 dark:text-gray-200">ממוצע מבחן ראשוני: </span>
            {Object.keys(grades || {}).length > 0 ? (
              <span className={`text-lg font-bold ${
                Object.values(grades).reduce((a, b) => a + b, 0) / Object.values(grades).length >= 80 
                  ? "text-green-600 dark:text-green-400" 
                  : Object.values(grades).reduce((a, b) => a + b, 0) / Object.values(grades).length >= 60 
                  ? "text-yellow-600 dark:text-yellow-400" 
                  : "text-red-600 dark:text-red-400"
              }`}>
                {(Object.values(grades).reduce((a, b) => a + b, 0) / Object.values(grades).length).toFixed(1)}%
              </span>
            ) : (
              <span className="text-lg text-gray-500 dark:text-gray-400">
                טרם בוצע מבחן ראשוני
              </span>
            )}
            {Object.keys(grades || {}).length > 0 && (
              <button onClick={() => setShowDetails(!showDetails)} className="text-button mr-2">
                {showDetails ? 'הסתר פרטים' : 'הצג פרטים'}
              </button>
            )}
          </div>
        </div>
        
        {/* Detailed Subjects Breakdown (Collapsible) */}
        {showDetails && (
          <div className="text-sm border-t border-gray-200 dark:border-gray-600 pt-3 mt-3 text-right">
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">ציוני מבחן ראשוני:</p>
            {Object.entries(grades || {}).map(([subject, grade]) => (
              <div key={subject} className="mb-1">
                <span className="text-gray-600 dark:text-gray-400">{subject}: </span>
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
                    <p className="text-base font-bold text-gray-700 dark:text-gray-300">נושא חזק</p>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">{strong[0]} ({Math.round(strong[1])}%)</p>
                  </div>
                )}
                {weak && (
                  <div className="px-2">
                    <p className="text-base font-bold text-gray-700 dark:text-gray-300">דורש שיפור</p>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">{weak[0]} ({Math.round(weak[1])}%)</p>
                  </div>
                )}
                {averageTimeSpent > 0 && (
                  <div className="px-2">
                    <p className="text-base font-bold text-gray-700 dark:text-gray-300">זמן תרגול ממוצע</p>
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{averageTimeSpent.toFixed(0)} דקות</p>
                  </div>
                )}
            </div>
        )}
        
        {/* Wrong Questions Count */}
        {wrongQuestions && Object.keys(wrongQuestions).length > 0 && (
          <div className="mt-2 text-sm border-t border-gray-200 dark:border-gray-600 pt-3">
            <span className="text-base font-bold text-gray-800 dark:text-gray-200">שאלות שגויות: </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {(() => {
                const wrongCount = Object.values(wrongQuestions).reduce((total, questions) => total + (Array.isArray(questions) ? questions.length : 0), 0);
                
                // Calculate total questions from completed sessions
                const totalQuestions = trainingProgress && trainingProgress.completedSessions
                  ? (Array.isArray(trainingProgress.completedSessions) 
                      ? trainingProgress.completedSessions.length 
                      : 0) * 10
                  : 0;
                
                return totalQuestions > 0 
                  ? `${wrongCount} מתוך ${totalQuestions} סה"כ`
                  : `${wrongCount} סה"כ`;
              })()}
            </span>
          </div>
        )}

        {/* Performance Charts - show if has multiple sessions */}
        {sessionAnalytics && sessionAnalytics.length > 1 && (
          <div className="mt-4 border-t border-gray-200 dark:border-gray-600 pt-4 space-y-4">
            {isMobile ? (
              /* Mobile: Single Charts Button */
              <button
                onClick={() => setShowChartsModal(true)}
                className={`w-full p-4 border-2 rounded-lg transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-500 hover:from-gray-600 hover:to-gray-500' 
                    : 'bg-gradient-to-r from-blue-50 to-green-50 border-blue-200 hover:from-blue-100 hover:to-green-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center ml-6">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200">צפה בגרפים</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        מגמת הצלחה {sessionAnalytics.length > 2 ? '• גרף שיפור' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mr-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isDarkMode
                        ? 'bg-gray-600 text-gray-200'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {sessionAnalytics.length > 2 ? '2' : '1'} גרפים
                    </span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ) : (
              /* Desktop: Inline Charts */
              <div className="space-y-4">
                {/* Success Rate Trend Chart */}
                <div className="panels p-3 rounded-lg min-h-0 touch-manipulation">
                  <div className="h-40 sm:h-48">
                    <SuccessRateTrendChart sessionAnalytics={sessionAnalytics} isDark={isDarkMode} />
                  </div>
                </div>
                
                {/* Improvement Graph */}
                {sessionAnalytics.length > 2 && (
                  <div className="panels p-3 rounded-lg min-h-0 touch-manipulation">
                    <div className="h-40 sm:h-48">
                      <ImprovementGraph sessionAnalytics={sessionAnalytics} isDark={isDarkMode} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        </div>
      </div>

      {/* Charts Modal for Mobile */}
      <ChartModal
        isOpen={showChartsModal}
        onClose={() => setShowChartsModal(false)}
        title={`גרפי ביצועים - ${name}`}
        isDark={isDarkMode}
      >
        <div className="space-y-8">
          {/* Success Rate Trend Chart */}
          <div className="panels p-4 rounded-lg">
            <div className="h-64 sm:h-80">
              <SuccessRateTrendChart 
                sessionAnalytics={sessionAnalytics} 
                isDark={isDarkMode} 
                isFullscreen={true}
              />
            </div>
          </div>

          {/* Improvement Graph - only show if enough sessions */}
          {sessionAnalytics.length > 2 && (
            <div className="panels p-4 rounded-lg">
              <div className="h-64 sm:h-80">
                <ImprovementGraph 
                  sessionAnalytics={sessionAnalytics} 
                  isDark={isDarkMode} 
                  isFullscreen={true}
                />
              </div>
            </div>
          )}
        </div>
      </ChartModal>
    </div>
  );
} 