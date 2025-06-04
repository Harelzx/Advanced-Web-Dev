"use client";
import { FaCheck, FaTimes as FaX } from "react-icons/fa";
import { useState, useEffect } from "react";

export default function StudyQuestion({
  question,
  selectedAnswer,
  onAnswer,
  isAnswered,
}) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [showCurrentAnswer, setShowCurrentAnswer] = useState(false);

  // Reset section index when question changes
  useEffect(() => {
    setCurrentSectionIndex(0);
    setShowCurrentAnswer(false);
  }, [question?.id]);

  // Add effect for auto-progressing to next section
  useEffect(() => {
    if (question?.type === "sectioned" && Array.isArray(selectedAnswer)) {
      const currentAnswered =
        selectedAnswer[currentSectionIndex] !== undefined &&
        selectedAnswer[currentSectionIndex] !== null;

      if (currentAnswered) {
        // Wait a moment to show the result before moving to next section
        const timer = setTimeout(() => {
          // Find next unanswered section
          const nextUnansweredIndex = selectedAnswer.findIndex(
            (ans, idx) =>
              idx > currentSectionIndex && (ans === undefined || ans === null)
          );

          if (nextUnansweredIndex !== -1) {
            setCurrentSectionIndex(nextUnansweredIndex);
          }
        }, 1500); // 1.5 second delay

        return () => clearTimeout(timer);
      }
    }
  }, [question, selectedAnswer, currentSectionIndex]);

  // Handle loading state
  if (!question) {
    return (
      <div className="p-8 text-center">
        <div className="text-2xl text-gray-600">טוען שאלה...</div>
      </div>
    );
  }

  // For regular questions (easy/medium)
  if (question.type === "regular") {
    const questionText = question.text;
    const correctAnswer = question.correct_answer;
    const incorrectAnswers = question.incorrect_answers;

    // Handle malformed question data
    if (!questionText || !correctAnswer || !Array.isArray(incorrectAnswers)) {
      return (
        <div className="p-8 text-center">
          <div className="text-2xl text-red-600">שגיאה בטעינת השאלה</div>
        </div>
      );
    }

    // Create options array with correct answer first
    const options = [correctAnswer, ...incorrectAnswers];

    const renderOption = (option, index) => {
      const isSelected = selectedAnswer === index;
      const showResult = isAnswered;
      const isCorrect = index === 0; // Correct answer is always first

      // Show both the selected wrong answer and the correct answer
      const shouldHighlight = showResult && (isSelected || isCorrect);

      return (
        <button
          key={index}
          onClick={() => !isAnswered && onAnswer(0, index)}
          disabled={isAnswered}
          className={`w-full p-4 rounded-xl text-right transition-all duration-300 ${
            shouldHighlight
              ? isCorrect
                ? "bg-emerald-100 text-emerald-900 border-2 border-emerald-500"
                : "bg-red-100 text-red-900 border-2 border-red-500"
              : isAnswered
              ? "bg-white text-gray-400 border-2 border-gray-200"
              : "bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-lg">{option}</span>
            {showResult && shouldHighlight && (
              <span className="text-xl">
                {isCorrect ? (
                  <FaCheck className="text-emerald-600" />
                ) : (
                  <FaX className="text-red-600" />
                )}
              </span>
            )}
          </div>
        </button>
      );
    };

    return (
      <div className="p-8">
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-6 leading-relaxed whitespace-pre-line text-right text-gray-800 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text">
            {questionText}
          </h3>

          <div className="grid gap-4">
            {options.map((option, index) => renderOption(option, index))}
          </div>
        </div>
      </div>
    );
  }

  // For sectioned questions (hard)
  const sections = question.sections || [];

  // Ensure currentSectionIndex doesn't exceed available sections
  if (currentSectionIndex >= sections.length) {
    console.warn("Section index out of bounds, resetting to last section", {
      questionId: question.id,
      currentIndex: currentSectionIndex,
      totalSections: sections.length,
    });
    setCurrentSectionIndex(sections.length - 1);
    return (
      <div className="p-8 text-center">
        <div className="text-2xl text-gray-600">טוען סעיף...</div>
      </div>
    );
  }

  const currentSection = sections[currentSectionIndex];
  const sectionAnswers = Array.isArray(selectedAnswer) ? selectedAnswer : [];

  // Validate current section data
  if (!currentSection) {
    return (
      <div className="p-8 text-center">
        <div className="text-2xl text-red-600">שגיאה בטעינת הסעיף</div>
      </div>
    );
  }

  const sectionText = currentSection.text;
  const correctAnswer = currentSection.correct_answer;
  const incorrectAnswers = currentSection.incorrect_answers;
  const options = [correctAnswer, ...incorrectAnswers];
  const isSectionAnswered =
    sectionAnswers[currentSectionIndex] !== undefined &&
    sectionAnswers[currentSectionIndex] !== null;

  const renderSectionOption = (option, index) => {
    const isSelected = sectionAnswers[currentSectionIndex] === index;
    const showResult = isSectionAnswered;
    const isCorrect = index === 0;

    // Only highlight if this option was selected or if it's the correct answer AND a wrong answer was selected
    const shouldHighlight =
      showResult &&
      (isSelected ||
        (isCorrect &&
          sectionAnswers[currentSectionIndex] !== null &&
          sectionAnswers[currentSectionIndex] !== 0));

    // Only gray out other options after an answer is selected
    const isGrayedOut = isSectionAnswered && !shouldHighlight;

    return (
      <button
        key={index}
        onClick={() =>
          !isSectionAnswered && onAnswer(currentSectionIndex, index)
        }
        disabled={isSectionAnswered}
        className={`w-full p-4 rounded-xl text-right transition-all duration-300 ${
          shouldHighlight
            ? isCorrect
              ? "bg-emerald-100 text-emerald-900 border-2 border-emerald-500"
              : "bg-red-100 text-red-900 border-2 border-red-500"
            : isGrayedOut
            ? "bg-white text-gray-400 border-2 border-gray-200"
            : "bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-lg">{option}</span>
          {shouldHighlight && (
            <span className="text-xl">
              {isCorrect ? (
                <FaCheck className="text-emerald-600" />
              ) : (
                <FaX className="text-red-600" />
              )}
            </span>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="p-8">
      {/* Progress bar for sectioned questions */}
      <div className="mb-6 bg-gray-100 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
          style={{
            width: `${((currentSectionIndex + 1) / sections.length) * 100}%`,
          }}
        ></div>
      </div>

      {/* Question image if available */}
      {question.imageUrl && (
        <div className="mb-6">
          <img
            src={question.imageUrl}
            alt="Question"
            className="max-w-full h-auto rounded-xl shadow-lg mx-auto"
            onError={(e) => {
              console.error("Error loading image:", e);
              e.target.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Current section */}
      <div className="mb-8">
        {/* Section header */}
        <div className="mb-4 text-sm font-medium text-gray-500 text-right">
          סעיף {currentSectionIndex + 1} מתוך {sections.length}
        </div>

        {/* Section text */}
        <h3 className="text-2xl font-bold mb-6 leading-relaxed whitespace-pre-line text-right text-gray-800 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text">
          {sectionText}
        </h3>

        {/* Section options */}
        <div className="grid gap-4">
          {options.map((option, index) => renderSectionOption(option, index))}
        </div>
      </div>
    </div>
  );
}
