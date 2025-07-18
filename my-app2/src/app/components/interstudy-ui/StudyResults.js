"use client";
import { FaGraduationCap, FaHome } from "react-icons/fa";

export default function QuizResults({
  score,
  totalQuestions,
  onRestart,
  onHome,
}) {
  const percentage = Math.round((score / totalQuestions) * 100);

  const getScoreEmoji = () => {
    if (percentage >= 90) return "🏆";
    if (percentage >= 80) return "🎉";
    if (percentage >= 70) return "👏";
    if (percentage >= 60) return "👍";
    return "💪";
  };

  const getScoreMessage = () => {
    if (percentage >= 90) return "מעולה! אתה מאסטר מתמטיקה!";
    if (percentage >= 80) return "כל הכבוד! ביצועים מצוינים!";
    if (percentage >= 70) return "יפה מאוד! אתה בדרך הנכונה!";
    if (percentage >= 60) return "לא רע! המשך להתאמן!";
    return "אל תתייאש! התרגול עושה את המאסטר!";
  };

  return (
          <div className="min-h-screen panels flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="panels backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
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
                  className="dark:stroke-slate-600"
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
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-bold text-slate-800 dark:text-slate-200">
                {percentage}%
              </span>
            </div>

            {/* Score Section */}
            <div className="text-center mb-6">
              <p className="text-lg text-slate-600 dark:text-slate-400">
                הציון שלך:{" "}
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{score}</span> מתוך{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">{totalQuestions}</span>
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">{getScoreMessage()}</p>
            </div>

            {/* Buttons Section */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <button
                onClick={onRestart}
                className="group bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <FaGraduationCap className="mr-2 group-hover:animate-pulse" />
                <span>התחל חידון חדש</span>
              </button>
              <button
                onClick={onHome}
                className="group bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 dark:from-slate-600 dark:to-slate-700 dark:hover:from-slate-700 dark:hover:to-slate-800 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <FaHome className="group-hover:animate-pulse" />
                <span>חזור לדף הבית</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
