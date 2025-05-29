"use client";
import { FaClock } from "react-icons/fa";

export default function QuizHeader({
  currentQuestion,
  totalQuestions,
  difficulty,
  difficultyConfig,
  timeLeft,
}) {
  return (
    <div
      className={`${difficultyConfig.bgColor} border-b ${difficultyConfig.borderColor} p-6`}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{difficultyConfig.icon}</span>
            <div>
              <div className="text-lg font-bold text-gray-800">
                שאלה {currentQuestion + 1} מתוך {totalQuestions}
              </div>
              <div
                className={`text-sm ${difficultyConfig.textColor} font-medium`}
              >
                {difficulty === "easy"
                  ? "רמה קלה"
                  : difficulty === "moderate"
                  ? "רמה בינונית"
                  : "רמה קשה"}
              </div>
            </div>
          </div>
        </div>

        {timeLeft !== null && (
          <div
            className={`flex items-center space-x-3 px-4 py-2 rounded-2xl ${
              timeLeft <= 10
                ? "bg-red-100 text-red-600 animate-pulse"
                : "bg-blue-100 text-blue-600"
            } transition-all duration-300`}
          >
            <FaClock className={timeLeft <= 10 ? "animate-spin" : ""} />
            <span className="font-bold text-lg">{timeLeft}s</span>
          </div>
        )}
      </div>

      {/* Enhanced Progress Bar */}
      <div className="relative">
        <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out relative"
            style={{
              width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
            }}
          >
            <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
          </div>
        </div>
        <div className="text-xs text-gray-600 mt-1 text-center">
          התקדמות: {Math.round(((currentQuestion + 1) / totalQuestions) * 100)}%
        </div>
      </div>
    </div>
  );
}
