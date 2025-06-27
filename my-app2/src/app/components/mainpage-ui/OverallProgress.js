'use client';

import { FaCheckCircle, FaRunning, FaFlagCheckered } from 'react-icons/fa';

/**
 * Displays user's overall training progress with a progress bar.
 * @param {number} completedSessions - How many sessions the user has finished.
 * @param {number} totalSessions - The total number of sessions in the plan.
 */
export default function OverallProgress({ completedSessions = 0, totalSessions = 9 }) {
  // Ensure completedSessions is not greater than totalSessions
  const validCompletedSessions = Math.min(totalSessions, completedSessions);
  const progressPercentage = totalSessions > 0 ? (validCompletedSessions / totalSessions) * 100 : 0;

  const getStatus = () => {
    if (validCompletedSessions === 0) {
      return { text: "בוא נתחיל את המסע!", icon: <FaRunning className="text-gray-500" /> };
    }
    if (progressPercentage >= 100) {
      return { text: "כל הכבוד! סיימת את כל התרגולים.", icon: <FaFlagCheckered className="text-green-500" /> };
    }
    return { text: "ממשיכים קדימה, עבודה מצוינת!", icon: <FaCheckCircle className="text-blue-500" /> };
  };

  const status = getStatus();

  return (
    <div className="panels p-4 rounded-lg shadow w-full h-full flex flex-col" dir="rtl">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">ההתקדמות שלי</h3>
      
      <div className="flex-grow">
        <div className="flex items-center justify-between mb-2 text-gray-600">
          <span className="font-semibold">{status.text}</span>
          <span className="font-bold text-lg text-indigo-600">
          {totalSessions} / {validCompletedSessions}
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex justify-end mt-2 text-sm text-gray-500 items-center gap-2">
        {status.icon}
        <span>
          {progressPercentage < 100
            ? `נותרו לך עוד ${totalSessions - validCompletedSessions} תרגולים`
            : "הגעת ליעד!"}
        </span>
      </div>
    </div>
  );
} 