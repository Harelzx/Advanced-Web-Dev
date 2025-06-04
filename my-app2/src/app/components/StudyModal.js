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
    <div className="fixed top-16 md:top-0 right-0 left-0 bottom-0 md:left-64 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-50/80"></div>
      <div className="w-full max-w-4xl mx-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <FaTimes size={24} />
          </button>

          <div className="text-center mb-12">
            <div className="text-6xl mb-6">{icon}</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">{title}</h2>
            <p className="text-gray-600 text-lg">
              בחר את רמת הקושי להתחלת התרגול
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(difficultyConfigs).map(([key, config]) => (
              <button
                key={key}
                onClick={() => onStartQuiz(key)}
                className={`group p-6 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-r ${config.color} text-white text-right`}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {config.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{config.title}</h3>
                <p className="text-sm opacity-90">{config.description}</p>
                <div className="mt-4 text-xs opacity-75">
                  {config.timeLabel}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
