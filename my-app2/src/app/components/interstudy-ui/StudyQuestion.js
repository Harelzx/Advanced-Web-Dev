"use client";
import { FaCheck, FaTimes } from "react-icons/fa";
import { useState, useEffect, useMemo } from "react";
import Image from 'next/image';

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
        <div className="text-center bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="text-red-600 dark:text-red-400 text-xl mb-2">⚠️ שגיאה בשאלה</div>
          <div className="text-red-500 dark:text-red-400 text-sm">
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
            <Image
              src={question.imageUrl}
              alt="bagrut"
              width={800}
              height={600}
              className="max-w-full max-h-96 rounded-lg shadow-lg object-contain"
            />
          </div>
        )}

        {/* Section Progress */}
        <div className="mb-6 text-center">
          <span className="text-lg font-semibold">
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
                  "bg-gradient-to-r from-green-100 to-emerald-100 dark:from-emerald-900/50 dark:to-green-900/50 border-green-300 dark:border-emerald-500 text-green-700 dark:text-emerald-200 shadow-lg scale-[1.02]";
              } else if (ans === selectedSectionAnswer) {
                buttonClass +=
                  "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/50 dark:to-rose-900/50 border-red-400 dark:border-red-500 text-red-800 dark:text-red-200 shadow-lg";
              } else {
                buttonClass +=
                  "panels border-gray-200 dark:border-gray-700 opacity-60";
              }
            } else {
              buttonClass +=
                "panels border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 hover:shadow-lg hover:text-indigo-700 dark:hover:text-indigo-400";
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
          <div className="mt-6 flex justify-center w-full">
            <button
              onClick={handleNextSection}
              className="px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 transform bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 hover:scale-105 shadow-lg"
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
        <div className="text-center bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="text-red-600 dark:text-red-400 text-xl mb-2">⚠️ שגיאה בשאלה</div>
          <div className="text-red-500 dark:text-red-400 text-sm">
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
        <h3 className="text-2xl font-bold mb-6 leading-relaxed whitespace-pre-line text-right">
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
                  "bg-gradient-to-r from-green-100 to-emerald-100 dark:from-emerald-900/50 dark:to-green-900/50 border-green-300 dark:border-emerald-500 text-green-700 dark:text-emerald-200 shadow-lg scale-[1.02]";
              } else if (index === userAnswer) {
                buttonClass +=
                  "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/50 dark:to-rose-900/50 border-red-400 dark:border-red-500 text-red-800 dark:text-red-200 shadow-lg";
              } else {
                buttonClass +=
                  "panels border-gray-200 dark:border-gray-700 opacity-60";
              }
            } else {
              buttonClass +=
                "panels border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 hover:shadow-lg hover:text-indigo-700 dark:hover:text-indigo-400";
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
