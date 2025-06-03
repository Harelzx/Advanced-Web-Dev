"use client";

export default function StudyHeader({
  currentQuestion,
  totalQuestions,
  difficulty,
  difficultyConfig,
  timeLeft,
}) {
  return (
    <div className="p-8 border-b border-gray-100">
      {/* Difficulty Badge */}
      <div className="flex items-center justify-between mb-6">
        <div
          className={`${difficultyConfig.bgColor} ${difficultyConfig.textColor} ${difficultyConfig.borderColor} border rounded-full px-4 py-2 text-sm font-semibold flex items-center space-x-2`}
        >
          <span className="text-lg">{difficultyConfig.icon}</span>
          <span>{difficultyConfig.title}</span>
        </div>

        {/* Timer */}
        {timeLeft !== null && (
          <div className="flex items-center space-x-2">
            <div
              className={`text-lg font-mono ${
                timeLeft <= 10
                  ? "text-red-600 animate-pulse"
                  : timeLeft <= 20
                  ? "text-orange-600"
                  : "text-gray-600"
              }`}
            >
              {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
              {String(timeLeft % 60).padStart(2, "0")}
            </div>
            <span className="text-sm text-gray-500">⏱️</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
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
