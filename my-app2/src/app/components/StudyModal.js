"use client";
import { FaTimes } from "react-icons/fa";

export default function StudyModal({
  onClose,
  onStartQuiz,
  difficultyConfigs = {}, // set a default value
  title = "חידון מתמטיקה",
  icon = "🧮",
}) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-lg w-full mx-4 relative shadow-2xl border border-white/20">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <FaTimes size={24} />
        </button>

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{icon}</div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {title}
          </h2>

          <div className="space-y-4">
            {Object.entries(difficultyConfigs).map(([difficulty, config]) => (
              <button
                key={difficulty}
                onClick={() => onStartQuiz(difficulty)}
                className={`group w-full p-6 text-white rounded-2xl font-semibold transition-all duration-300 bg-gradient-to-r ${config.color} transform hover:scale-105 hover:shadow-xl`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{config.icon}</span>
                  <div className="text-right">
                    <div className="text-xl font-bold">{config.title}</div>
                  </div>
                </div>
                <div className="text-sm opacity-90 text-right">
                  {config.description}
                </div>
                <div className="text-xs mt-2 opacity-80 bg-white/20 rounded-lg px-3 py-1 inline-block">
                  {config.timeLabel}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>בהצלחה! 💪</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
