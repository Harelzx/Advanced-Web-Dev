"use client";
import { FaCheck, FaTimes as FaX } from "react-icons/fa";

export default function QuizQuestion({
  question,
  isAnswered,
  userAnswer,
  onAnswer,
}) {
  return (
    <div className="p-8">
      {/* Question */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-6 leading-relaxed whitespace-pre-line text-right text-gray-800 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text">
          {question.question}
        </h3>

        {/* Answer Options */}
        <div className="grid gap-4">
          {question.options.map((option, index) => {
            let buttonClass =
              "group w-full p-5 text-right rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] ";

            if (isAnswered) {
              if (index === question.correct) {
                buttonClass +=
                  "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-400 text-emerald-800 shadow-lg scale-[1.02]";
              } else if (index === userAnswer) {
                buttonClass +=
                  "bg-gradient-to-r from-red-50 to-rose-50 border-red-400 text-red-800 shadow-lg";
              } else {
                buttonClass +=
                  "bg-gray-50 border-gray-200 text-gray-500 opacity-60";
              }
            } else {
              buttonClass +=
                "bg-white border-gray-200 hover:border-indigo-400 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:shadow-lg text-gray-700 hover:text-indigo-700";
            }

            return (
              <button
                key={index}
                onClick={() => onAnswer(index)}
                disabled={isAnswered}
                className={buttonClass}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {isAnswered && index === question.correct && (
                      <div className="bg-emerald-500 text-white rounded-full p-2 ml-3 animate-bounce">
                        <FaCheck size={16} />
                      </div>
                    )}
                    {isAnswered &&
                      index === userAnswer &&
                      index !== question.correct && (
                        <div className="bg-red-500 text-white rounded-full p-2 ml-3 animate-pulse">
                          <FaX size={16} />
                        </div>
                      )}
                  </div>
                  <span className="text-lg font-medium group-hover:font-semibold transition-all duration-200">
                    {option}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
