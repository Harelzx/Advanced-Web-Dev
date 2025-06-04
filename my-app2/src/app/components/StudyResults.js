"use client";
import { FaGraduationCap, FaHome, FaRedo, FaChartLine } from "react-icons/fa";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { useState, useEffect } from "react";
import StudyProgress from "./StudyProgress";

export default function StudyResults({
  score,
  maxScore,
  difficulty,
  config,
  onRestart,
  onNewQuiz,
  questions,
  userAnswers,
  onSave,
  onReviewQuestion,
}) {
  const [user] = useAuthState(auth);
  const [showProgress, setShowProgress] = useState(false);
  const [expandAll, setExpandAll] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [imageStatuses, setImageStatuses] = useState({});
  const [retryCount, setRetryCount] = useState({});

  // Calculate normalized total score (out of 100)
  const normalizedTotalScore = Math.round(
    questions.reduce((total, question, index) => {
      if (question.type === "sectioned") {
        const sectionScores =
          userAnswers[index]?.reduce((secTotal, ans, sectionIndex) => {
            const sectionScore = question.sections[sectionIndex]?.score || 0;
            return secTotal + (ans === 0 ? sectionScore : 0);
          }, 0) || 0;

        // Get max possible score for this question
        const maxQuestionScore = question.sections.reduce(
          (total, section) => total + (section.score || 0),
          0
        );

        // Convert to score out of 20
        return total + (sectionScores / maxQuestionScore) * 20;
      } else {
        // Regular questions
        return total + (userAnswers[index] === 0 ? 20 : 0);
      }
    }, 0)
  );

  const percentage = normalizedTotalScore;

  // Effect to handle expandAll changes
  useEffect(() => {
    if (expandAll) {
      const allExpanded = questions.reduce((acc, _, index) => {
        acc[index] = true;
        return acc;
      }, {});
      setExpandedQuestions(allExpanded);
    } else {
      setExpandedQuestions({});
    }
  }, [expandAll, questions]);

  const toggleQuestion = (index) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Hebrew letters for section numbering
  const getHebrewLetter = (index) => {
    const hebrewLetters = ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י"];
    return hebrewLetters[index] || index + 1;
  };

  const getScoreEmoji = () => {
    if (percentage >= 90) return "🏆";
    if (percentage >= 80) return "🎉";
    if (percentage >= 70) return "👏";
    if (percentage >= 60) return "👍";
    return "💪";
  };

  const getScoreMessage = () => {
    if (percentage >= 90) return "מצוין! כל הכבוד! 🌟";
    if (percentage >= 80) return "עבודה טובה מאוד! 🎉";
    if (percentage >= 70) return "טוב! המשך להתאמן! 💪";
    if (percentage >= 60) return "לא רע, יש מקום לשיפור! 📚";
    return "המשך להתאמן, אתה תשתפר! 💡";
  };

  const handleImageError = (questionId) => {
    setImageStatuses((prev) => ({
      ...prev,
      [questionId]: "error",
    }));
  };

  const handleImageLoad = (questionId) => {
    setImageStatuses((prev) => ({
      ...prev,
      [questionId]: "loaded",
    }));
  };

  if (showProgress) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="p-8">
            <button
              onClick={() => setShowProgress(false)}
              className="mb-4 text-gray-600 hover:text-gray-800 transition-colors flex items-center"
            >
              ← חזור לתוצאות
            </button>
            <StudyProgress userId={user?.uid} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="p-8 text-center border-b border-gray-100">
          <div className="text-8xl mb-6 animate-bounce">{getScoreEmoji()}</div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            סיימת את החידון!
          </h2>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div
              className={`${config.bgColor} ${config.textColor} ${config.borderColor} border rounded-full px-6 py-3 text-sm font-semibold flex items-center gap-3`}
            >
              <span className="text-2xl">{config.icon}</span>
              <span>{config.title}</span>
            </div>
          </div>

          {/* Score Circle */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="5"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${(percentage / 100) * 282.6} 282.6`}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-gray-800">
              {percentage}%
            </span>
          </div>

          <div className="text-center mb-6">
            <p className="text-lg text-gray-600">
              הציון שלך:{" "}
              <span className="font-bold text-indigo-600">
                {normalizedTotalScore}
              </span>{" "}
              מתוך <span className="font-bold">100</span> נקודות
            </p>
            <p className="text-sm text-gray-500 mt-1">
              השלמת {questions.length} שאלות
            </p>
            <p className="text-lg text-gray-600 mt-2">{getScoreMessage()}</p>
            {user && (
              <p className="text-sm text-emerald-600 mt-2">
                ✓ התוצאות נשמרו בחשבון שלך
              </p>
            )}
          </div>
        </div>

        {/* Question Review */}
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">סיכום שאלות</h3>
            <button
              onClick={() => setExpandAll(!expandAll)}
              className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              {expandAll ? "צמצם הכל" : "הרחב הכל"}
            </button>
          </div>
          <div className="space-y-6">
            {questions.map((question, index) => {
              const isCorrect =
                question.type === "sectioned"
                  ? Array.isArray(userAnswers[index]) &&
                    userAnswers[index].every((ans, idx) => ans === 0)
                  : userAnswers[index] === 0;

              const questionScore =
                question.type === "sectioned"
                  ? (() => {
                      // Calculate raw score
                      const rawScore =
                        userAnswers[index]?.reduce(
                          (total, ans, sectionIndex) => {
                            const sectionScore =
                              question.sections[sectionIndex]?.score || 0;
                            return total + (ans === 0 ? sectionScore : 0);
                          },
                          0
                        ) || 0;

                      // Get max possible score
                      const maxScore = question.sections.reduce(
                        (total, section) => total + (section.score || 0),
                        0
                      );

                      // Normalize to score out of 20
                      return Math.round((rawScore / maxScore) * 20);
                    })()
                  : userAnswers[index] === 0
                  ? 20
                  : 0;

              return (
                <div
                  key={index}
                  className={`p-6 rounded-2xl border-2 ${
                    isCorrect
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`text-sm font-semibold px-3 py-1 rounded-full ${
                          isCorrect
                            ? "bg-emerald-200 text-emerald-800"
                            : "bg-red-200 text-red-800"
                        }`}
                      >
                        {questionScore} נקודות מתוך 20
                      </div>
                      <button
                        onClick={() => toggleQuestion(index)}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {expandedQuestions[index] ? "▼" : "▶"}
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-gray-600 text-sm">
                        שאלה {index + 1}
                      </div>
                      {onReviewQuestion && (
                        <button
                          onClick={() => onReviewQuestion(index)}
                          className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          חזור לשאלה
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-right mb-4">{question.text}</div>

                  {/* Show question image if available */}
                  {expandedQuestions[index] && question.imageUrl && (
                    <div className="mb-6">
                      {imageStatuses[question.id] === "loading" && (
                        <div className="flex justify-center items-center h-32">
                          <div className="animate-spin text-4xl">⚡</div>
                        </div>
                      )}
                      <img
                        src={question.imageUrl}
                        alt="Question"
                        className={`max-w-full h-auto rounded-xl shadow-lg mx-auto ${
                          imageStatuses[question.id] === "loading"
                            ? "hidden"
                            : ""
                        }`}
                        onError={() => handleImageError(question.id)}
                        onLoad={() => handleImageLoad(question.id)}
                      />
                    </div>
                  )}

                  {expandedQuestions[index] &&
                    (question.type === "sectioned" ? (
                      <div className="space-y-4">
                        {question.sections.map((section, sectionIndex) => {
                          const sectionScore = section.score || 0;
                          const maxSectionScore = question.sections.reduce(
                            (total, sec) => total + (sec.score || 0),
                            0
                          );
                          const normalizedSectionScore = Math.round(
                            (sectionScore / maxSectionScore) * 20
                          );

                          return (
                            <div
                              key={sectionIndex}
                              className="text-sm bg-white/50 p-4 rounded-lg"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <div className="font-semibold">
                                  סעיף {getHebrewLetter(sectionIndex)}:
                                </div>
                                {userAnswers[index]?.[sectionIndex] === 0 && (
                                  <div className="text-emerald-600 text-xs">
                                    {normalizedSectionScore} נקודות
                                  </div>
                                )}
                              </div>
                              <div
                                className={`font-semibold mb-2 ${
                                  userAnswers[index]?.[sectionIndex] === 0
                                    ? "text-emerald-800"
                                    : "text-red-800"
                                }`}
                              >
                                {userAnswers[index]?.[sectionIndex] === 0
                                  ? "תשובה נכונה!"
                                  : userAnswers[index]?.[sectionIndex] === -1
                                  ? "לא הספקת לענות"
                                  : "תשובה שגויה"}
                              </div>
                              <div className="text-gray-600">
                                <span className="font-semibold">
                                  התשובה הנכונה:{" "}
                                </span>
                                {section.correct_answer}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-sm">
                        <div
                          className={`font-semibold mb-2 ${
                            userAnswers[index] === 0
                              ? "text-emerald-800"
                              : "text-red-800"
                          }`}
                        >
                          {userAnswers[index] === 0
                            ? "תשובה נכונה!"
                            : userAnswers[index] === -1
                            ? "לא הספקת לענות"
                            : "תשובה שגויה"}
                        </div>
                        <div className="text-gray-600">
                          <span className="font-semibold">התשובה הנכונה: </span>
                          {question.correct_answer}
                        </div>
                      </div>
                    ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-8 bg-gray-50 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onRestart}
              className="group bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center"
            >
              <FaRedo className="ml-2 group-hover:animate-spin" />
              <span>התחל מחדש את אותה רמה</span>
            </button>
            <button
              onClick={onNewQuiz}
              className="group bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center"
            >
              <FaGraduationCap className="ml-2 group-hover:animate-pulse" />
              <span>בחר רמה אחרת</span>
            </button>
            {user && (
              <button
                onClick={() => setShowProgress(true)}
                className="group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center"
              >
                <FaChartLine className="ml-2 group-hover:animate-pulse" />
                <span>הצג התקדמות</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
