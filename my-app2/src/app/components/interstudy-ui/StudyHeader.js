"use client";

export default function StudyHeader({
  currentQuestion,
  totalQuestions,
  difficultyConfig,
  sessionNumber,
}) {
  const difficultyText = difficultyConfig.title || "אימון";

  return (
    <div
      className="border-b border-gray-200/50 p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{difficultyConfig.icon}</span>
            <div>
              <div className="text-lg font-bold text-gray-800">
                שאלה {currentQuestion + 1} מתוך {totalQuestions}
              </div>
              {sessionNumber && (
                <div
                  className={`text-sm font-semibold bg-gradient-to-r ${difficultyConfig.color} text-transparent bg-clip-text`}
                >
                  אימון {sessionNumber} מתוך 9 - {difficultyText}
                </div>
              )}
            </div>
          </div>
        </div>
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
