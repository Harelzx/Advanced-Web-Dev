"use client";
import { useState, useEffect } from "react";
import { FaCheck, FaTimes as FaX } from "react-icons/fa";

export default function StudySectionedQuestion({
  question,
  userAnswers,
  onAnswer,
  isAnswered,
}) {
  const [currentSection, setCurrentSection] = useState(0);
  const [imageStatus, setImageStatus] = useState("loading"); // 'loading', 'error', 'loaded'
  const [retryCount, setRetryCount] = useState(0);
  const [proxyImageUrl, setProxyImageUrl] = useState(null);
  const totalSections = question.sections.length;
  const currentSectionData = question.sections[currentSection];

  // Reset states when question changes
  useEffect(() => {
    setCurrentSection(0);
    setImageStatus("loading");
    setRetryCount(0);
    setProxyImageUrl(null);
  }, [question.id]);

  // Handle image loading
  useEffect(() => {
    if (question?.imageUrl) {
      try {
        console.log("Processing question image:", {
          url: question.imageUrl,
          questionId: question.id,
        });

        // Reset states
        setImageStatus("loading");
        setRetryCount(0);

        // Use the Firebase Storage URL directly
        setProxyImageUrl(question.imageUrl);
      } catch (error) {
        console.error("Error processing image URL:", {
          error: error.message,
          url: question?.imageUrl,
          questionId: question?.id,
        });
        setImageStatus("error");
      }
    } else {
      setProxyImageUrl(null);
      setImageStatus("error");
    }
  }, [question?.imageUrl, question?.id]);

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
      {/* Question Image */}
      {question?.imageUrl && (
        <div className="mb-6 relative">
          {imageStatus === "loading" && (
            <div className="text-center py-4 bg-gray-50 rounded-lg mb-2">
              <div className="animate-pulse text-gray-500">
                טוען תמונה...{" "}
                {retryCount > 0 ? `(ניסיון ${retryCount + 1}/3)` : ""}
              </div>
            </div>
          )}

          {imageStatus === "error" && (
            <div className="text-center py-4 bg-red-50 rounded-lg mb-2">
              <div className="text-red-600">
                שגיאה בטעינת התמונה
                <button
                  onClick={() => {
                    setImageStatus("loading");
                    setRetryCount(0);
                    const timestamp = Date.now();
                    const url = new URL(question.imageUrl);
                    url.searchParams.set("t", timestamp.toString());
                    setProxyImageUrl(url.toString());
                  }}
                  className="underline mr-2 hover:text-red-800"
                >
                  נסה שוב
                </button>
              </div>
              <div className="text-xs text-red-400 mt-1 break-all">
                {question.imageUrl}
              </div>
            </div>
          )}

          {proxyImageUrl && (
            <img
              data-question-image
              src={proxyImageUrl}
              alt="תמונת השאלה"
              className={`max-w-full h-auto rounded-xl shadow-lg mx-auto transition-opacity duration-300 ${
                imageStatus === "loaded" ? "opacity-100" : "opacity-0"
              }`}
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
            />
          )}
        </div>
      )}

      {/* Section Navigation */}
      <div className="flex justify-center space-x-2 mb-6">
        {question.sections.map((section, index) => {
          const isCurrentSectionAnswered = userAnswers[index] !== null;
          const isCorrect =
            isCurrentSectionAnswered &&
            userAnswers[index] === section.correctAnswer;

          return (
            <button
              key={section.id}
              onClick={() => setCurrentSection(index)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2
                ${
                  currentSection === index
                    ? "bg-indigo-600 text-white"
                    : isCurrentSectionAnswered
                    ? isCorrect
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              <span>חלק {section.id}</span>
              {isCurrentSectionAnswered && <span>{isCorrect ? "✓" : "✗"}</span>}
            </button>
          );
        })}
      </div>

      {/* Current Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">
            {currentSection + 1} מתוך {totalSections} חלקים
          </span>
          <span className="text-sm font-semibold text-indigo-600">
            {currentSectionData.points} נקודות
          </span>
        </div>

        <h3 className="text-2xl font-bold mb-6 leading-relaxed text-right text-gray-800">
          {currentSectionData.text}
        </h3>

        {/* Answer Options */}
        <div className="grid gap-4">
          {currentSectionData.options.map((option, index) => {
            const isCurrentSectionAnswered =
              userAnswers[currentSection] !== null;
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
