"use client";
import { FaGraduationCap, FaHome, FaRedo, FaChartLine } from "react-icons/fa";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { useState } from "react";
import StudyProgress from "./StudyProgress";

export default function StudyResults({
  score,
  totalQuestions,
  maxScore = 100,
  onRestart,
  onHome,
  onChooseDifficulty,
}) {
  const [user] = useAuthState(auth);
  const [showProgress, setShowProgress] = useState(false);
  const percentage = Math.round((score / maxScore) * 100);

  const getScoreEmoji = () => {
    if (percentage >= 90) return "🏆";
    if (percentage >= 80) return "🎉";
    if (percentage >= 70) return "👏";
    if (percentage >= 60) return "👍";
    return "💪";
  };

  const getScoreMessage = () => {
    if (percentage >= 90) return "מצוין! כל הכבוד! 🌟";
    if (percentage >= 80) return "עבודה טובה מאוד! 🎉";
    if (percentage >= 70) return "טוב! המשך להתאמן! 💪";
    if (percentage >= 60) return "לא רע, יש מקום לשיפור! 📚";
    return "המשך להתאמן, אתה תשתפר! 💡";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {!showProgress ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="text-center">
              <div className="text-8xl mb-6 animate-bounce">
                {getScoreEmoji()}
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                סיימת את החידון!
              </h2>

              {/* Score Circle */}
              <div className="relative w-[10vw] h-[10vw] max-w-[100px] max-h-[100px] mx-auto mb-6">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="5"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${(percentage / 100) * 282.6} 282.6`}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient
                      id="gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-bold text-gray-800">
                  {percentage}%
                </span>
              </div>

              {/* Score Section */}
              <div className="text-center mb-6">
                <p className="text-lg text-gray-600">
                  הציון שלך:{" "}
                  <span className="font-bold text-indigo-600">{score}</span>{" "}
                  מתוך <span className="font-bold">{maxScore}</span> נקודות
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  השלמת {totalQuestions} שאלות
                </p>
                <p className="text-lg text-gray-600 mt-2">
                  {getScoreMessage()}
                </p>
                {user && (
                  <p className="text-sm text-emerald-600 mt-2">
                    ✓ התוצאות נשמרו בחשבון שלך
                  </p>
                )}
              </div>

              {/* Buttons Section */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <button
                  onClick={onRestart}
                  className="group bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center"
                >
                  <FaRedo className="ml-2 group-hover:animate-spin" />
                  <span>התחל מחדש את אותה רמה</span>
                </button>
                <button
                  onClick={onChooseDifficulty}
                  className="group bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center"
                >
                  <FaGraduationCap className="ml-2 group-hover:animate-pulse" />
                  <span>בחר רמה אחרת</span>
                </button>
                {user && (
                  <button
                    onClick={() => setShowProgress(true)}
                    className="group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center"
                  >
                    <FaChartLine className="ml-2 group-hover:animate-pulse" />
                    <span>הצג התקדמות</span>
                  </button>
                )}
                <button
                  onClick={onHome}
                  className="group bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center"
                >
                  <FaHome className="ml-2 group-hover:animate-pulse" />
                  <span>חזור לדף הראשי</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setShowProgress(false)}
              className="mb-4 text-gray-600 hover:text-gray-800 transition-colors flex items-center"
            >
              ← חזור לתוצאות
            </button>
            <StudyProgress userId={user?.uid} />
          </div>
        )}
      </div>
    </div>
  );
}
