"use client";
import { FaCheck, FaTimes } from "react-icons/fa";
import { useState, useEffect, useMemo } from "react";

export default function StudyQuestion({
  question,
  isAnswered,
  userAnswer,
  onAnswer,
}) {
  // Hard question (bagrut) progressive section logic
  const [currentSection, setCurrentSection] = useState(0);
  const [sectionAnswered, setSectionAnswered] = useState(false);
  const [selectedSectionAnswer, setSelectedSectionAnswer] = useState(null);
  const [sectionResults, setSectionResults] = useState([]);

  // Always define section and allAnswers to keep hooks order consistent
  const section =
    question && question.sections && Array.isArray(question.sections)
      ? question.sections[currentSection]
      : null;

  const allAnswers = useMemo(() => {
    if (!section) return [];
    return [section.correct_answer, ...(section.incorrect_answers || [])].sort(
      () => Math.random() - 0.5
    );
  }, [section]);

  useEffect(() => {
    setCurrentSection(0);
    setSectionAnswered(false);
    setSelectedSectionAnswer(null);
    setSectionResults([]);
  }, [question]);

  if (question && question.sections && Array.isArray(question.sections)) {
    if (!section) {
      return (
        <div className="p-8">
          <div className="text-center bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-600 text-xl mb-2">⚠️ שגיאה בשאלה</div>
            <div className="text-red-500 text-sm">
              התרגול לא מכיל סעיפים תקינים
            </div>
          </div>
        </div>
      );
    }

    function handleSectionAnswer(ans) {
      setSelectedSectionAnswer(ans);
      setSectionAnswered(true);
      setSectionResults((results) => [
        ...results,
        ans === section.correct_answer,
      ]);
    }
    function handleNextSection() {
      setSectionAnswered(false);
      setSelectedSectionAnswer(null);
      if (currentSection < question.sections.length - 1) {
        setCurrentSection(currentSection + 1);
      } else {
        // All sections done, call onAnswer to move to next question
        if (onAnswer) onAnswer(sectionResults);
      }
    }

    return (
      <div className="p-8">
        {question.imageUrl && (
          <div className="mb-6 flex justify-center">
            <img
              src={question.imageUrl}
              alt="bagrut"
              className="max-w-full max-h-96 rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Section Progress */}
        <div className="mb-6 text-center">
          <span className="text-lg font-semibold text-gray-700">
            סעיף {currentSection + 1} מתוך {question.sections.length}
          </span>
        </div>

        {/* Answer Options */}
        <div className="grid gap-4">
          {allAnswers.map((ans, idx) => {
            let buttonClass =
              "group w-full p-5 text-right rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] ";

            if (sectionAnswered) {
              if (ans === section.correct_answer) {
                buttonClass +=
                  "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-400 text-emerald-800 shadow-lg scale-[1.02]";
              } else if (ans === selectedSectionAnswer) {
                buttonClass +=
                  "bg-gradient-to-r from-red-50 to-rose-50 border-red-400 text-red-800 shadow-lg";
              } else {
                buttonClass +=
                  "bg-gray-50 border-gray-200 text-gray-500 opacity-60";
              }
            } else {
              buttonClass +=
                "panels border-gray-200 hover:border-indigo-400 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:shadow-lg text-gray-700 hover:text-indigo-700";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSectionAnswer(ans)}
                disabled={sectionAnswered}
                className={buttonClass}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {sectionAnswered && ans === section.correct_answer && (
                      <div className="bg-emerald-500 text-white rounded-full p-2 ml-3 animate-bounce">
                        <FaCheck size={16} />
                      </div>
                    )}
                    {sectionAnswered &&
                      ans === selectedSectionAnswer &&
                      ans !== section.correct_answer && (
                        <div className="bg-red-500 text-white rounded-full p-2 ml-3 animate-pulse">
                          <FaTimes size={16} />
                        </div>
                      )}
                  </div>
                  <span className="text-lg font-medium group-hover:font-semibold transition-all duration-200">
                    {ans}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Next Section Button */}
        {sectionAnswered && (
          <div className="mt-6 flex justify-center w-full pb-6">
            <button
              onClick={handleNextSection}
              className="px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 transform bg-green-600 hover:bg-green-700 hover:scale-105 shadow-lg"
            >
              {currentSection < question.sections.length - 1
                ? "המשך לסעיף הבא"
                : "השאלה הבאה"}
            </button>
          </div>
        )}
      </div>
    );
  }

  // הגנה למקרה של שאלה לא תקינה
  if (
    !question ||
    !question.options ||
    !Array.isArray(question.options) ||
    question.options.length === 0
  ) {
    return (
      <div className="p-8">
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-red-600 text-xl mb-2">⚠️ שגיאה בשאלה</div>
          <div className="text-red-500 text-sm">
            השאלה לא מכילה אפשרויות תקינות
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Question */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-6 leading-relaxed whitespace-pre-line text-right text-gray-800 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text">
          {question.question || "שאלה ללא טקסט"}
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
                "panels border-gray-200 hover:border-indigo-400 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:shadow-lg text-gray-700 hover:text-indigo-700";
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
                          <FaTimes size={16} />
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
