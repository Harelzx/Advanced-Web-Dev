"use client";
import { FaLightbulb, FaTrophy } from "react-icons/fa";

export default function QuizActions({
  isAnswered,
  showExplanation,
  onToggleExplanation,
  onNext,
  isLastQuestion,
}) {
  if (!isAnswered) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 px-8">
      <button
        onClick={onToggleExplanation}
        className="group flex items-center space-x-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
      >
        <FaLightbulb className="group-hover:animate-pulse" />
        <span>{showExplanation ? "הסתר הסבר" : "הצג הסבר"}</span>
      </button>

      <button
        onClick={onNext}
        className="group bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
      >
        <span>{isLastQuestion ? "סיים חידון" : "שאלה הבאה"}</span>
        {isLastQuestion && <FaTrophy className="group-hover:animate-bounce" />}
      </button>
    </div>
  );
}
