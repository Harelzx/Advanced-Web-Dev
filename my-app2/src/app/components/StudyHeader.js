"use client";

export default function StudyHeader({
  currentQuestion,
  totalQuestions,
  difficulty,
  config,
  timeLeft,
}) {
  return (
    <div className="p-8 bg-white border-b border-gray-100">
      {/* Header Content */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        {/* Difficulty Badge */}
        <div
          className={`${config.bgColor} ${config.textColor} ${config.borderColor} border rounded-full px-6 py-3 text-sm font-semibold flex items-center gap-3 shadow-sm`}
        >
          <span className="text-2xl">{config.icon}</span>
          <span className="text-base">{config.title}</span>
        </div>

        {/* Timer */}
        {timeLeft !== null && (
          <div className="flex items-center gap-3 bg-gray-50 px-6 py-3 rounded-full shadow-sm">
            <div
              className={`text-lg font-mono font-bold ${
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
            <span className="text-xl">⏱️</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner">
          <div
            className={`h-4 rounded-full transition-all duration-500 ease-out relative bg-gradient-to-r ${config.color}`}
            style={{
              width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
            }}
          >
            <div className="absolute inset-0 bg-white/20"></div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
          <span>
            שאלה {currentQuestion + 1} מתוך {totalQuestions}
          </span>
          <span className="font-semibold">
            {Math.round(((currentQuestion + 1) / totalQuestions) * 100)}% הושלם
          </span>
        </div>
      </div>
    </div>
  );
}
