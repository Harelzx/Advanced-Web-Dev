"use client";
import { useState, useEffect } from "react";
import { FaCheck, FaTimes as FaX } from "react-icons/fa";

export default function StudySectionedQuestion({
  question,
  userAnswers,
  onAnswer,
  isAnswered,
  onQuestionComplete,
}) {
  const [currentSection, setCurrentSection] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [imageStatus, setImageStatus] = useState("loading");
  const [proxyImageUrl, setProxyImageUrl] = useState(question.imageUrl);

  const totalSections = question.sections.length;
  const currentSectionData = question.sections[currentSection];
  const isCurrentSectionAnswered = userAnswers[currentSection] !== null;
  const allSectionsAnswered = userAnswers.every((answer) => answer !== null);

  useEffect(() => {
    // Reset to first section when question changes
    setCurrentSection(0);
  }, [question.id]);

  useEffect(() => {
    // If current section is answered and not all sections are answered,
    // advance to next section after a short delay
    if (isCurrentSectionAnswered && !allSectionsAnswered) {
      const timer = setTimeout(() => {
        const nextUnansweredSection = userAnswers.findIndex(
          (answer) => answer === null
        );
        if (nextUnansweredSection !== -1) {
          setCurrentSection(nextUnansweredSection);
        }
      }, 1500); // Delay before advancing

      return () => clearTimeout(timer);
    }
    // If all sections are answered, trigger the completion callback
    else if (allSectionsAnswered && onQuestionComplete) {
      const timer = setTimeout(() => {
        onQuestionComplete();
      }, 1500); // Same delay before moving to next question

      return () => clearTimeout(timer);
    }
  }, [
    userAnswers,
    isCurrentSectionAnswered,
    allSectionsAnswered,
    onQuestionComplete,
  ]);

  const handleImageError = (e) => {
    const errorDetails = {
      url: e.target?.src || "unknown",
      questionId: question?.id,
      retryCount,
      timestamp: new Date().toISOString(),
    };

    console.error("Image load error:", errorDetails);

    if (retryCount >= 2) {
      console.log("Max retries reached");
      setImageStatus("error");
      return;
    }

    // Increment retry count
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    setImageStatus("loading");

    // Add cache buster to URL
    const timestamp = Date.now();
    const url = new URL(question.imageUrl);
    url.searchParams.set("t", timestamp.toString());

    console.log("Retrying with URL:", {
      url: url.toString(),
      attempt: newRetryCount,
    });

    setProxyImageUrl(url.toString());
  };

  const handleImageLoad = (e) => {
    const loadDetails = {
      url: e.target?.src || "unknown",
      questionId: question?.id,
      size: `${e.target?.naturalWidth}x${e.target?.naturalHeight}`,
      timestamp: new Date().toISOString(),
    };

    console.log("Image loaded successfully:", loadDetails);
    setImageStatus("loaded");
  };

  const handleAnswer = (sectionIndex, answerIndex) => {
    if (isAnswered || userAnswers[sectionIndex] !== null) return;
    onAnswer(sectionIndex, answerIndex);
  };

  return (
    <div className="p-8">
      {/* Question */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-6 leading-relaxed whitespace-pre-line text-right text-gray-800 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text">
          {question.question}
        </h3>

        {/* Image if available */}
        {question.imageUrl && (
          <div className="mb-6">
            {imageStatus === "loading" && (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin text-4xl">⚡</div>
              </div>
            )}
            <img
              src={proxyImageUrl}
              alt="Question"
              className={`max-w-full h-auto rounded-xl shadow-lg mx-auto ${
                imageStatus === "loading" ? "hidden" : ""
              }`}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          </div>
        )}

        {/* Section Navigation */}
        <div className="flex justify-center gap-2 mb-4">
          {question.sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => setCurrentSection(index)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                currentSection === index
                  ? "bg-indigo-600 text-white scale-110"
                  : userAnswers[index] !== null
                  ? userAnswers[index] === section.correctAnswer
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-red-100 text-red-800"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              סעיף {section.id || String.fromCharCode(97 + index)}
              {userAnswers[index] !== null && (
                <span className="ml-1">
                  {userAnswers[index] === section.correctAnswer ? "✓" : "✗"}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Current Section */}
        <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
          <h4 className="text-xl font-semibold mb-4 text-gray-800">
            סעיף{" "}
            {currentSectionData.id || String.fromCharCode(97 + currentSection)}
          </h4>
          <p className="text-lg mb-6 text-gray-700">
            {currentSectionData.text}
          </p>

          {/* Answer Options */}
          <div className="grid gap-4">
            {currentSectionData.options.map((option, index) => {
              let buttonClass =
                "group w-full p-5 text-right rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] ";

              if (isCurrentSectionAnswered) {
                if (index === currentSectionData.correctAnswer) {
                  buttonClass +=
                    "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-400 text-emerald-800 shadow-lg scale-[1.02]";
                } else if (index === userAnswers[currentSection]) {
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
                  onClick={() => handleAnswer(currentSection, index)}
                  disabled={isCurrentSectionAnswered}
                  className={buttonClass}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{option}</span>
                    {isCurrentSectionAnswered && (
                      <span>
                        {index === currentSectionData.correctAnswer ? (
                          <FaCheck className="text-emerald-500" />
                        ) : index === userAnswers[currentSection] ? (
                          <FaX className="text-red-500" />
                        ) : null}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section Progress */}
      <div className="mt-6">
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentSection + 1) / totalSections) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
