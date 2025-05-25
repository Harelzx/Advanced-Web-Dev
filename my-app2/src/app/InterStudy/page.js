"use client";
import { useState, useEffect } from "react";
import { getDocs, collection, getFirestore, addDoc } from "firebase/firestore";
import {
  FaTimes,
  FaClock,
  FaLightbulb,
  FaCheck,
  FaTimes as FaX,
  FaHome,
  FaTrophy,
  FaGraduationCap,
} from "react-icons/fa";

// Sample math questions based on Israeli Bagrut material
const mathQuestions = {
  easy: [
    {
      id: 1,
      question: "פתור את המשוואה: 2x + 5 = 13",
      options: ["x = 4", "x = 6", "x = 9", "x = 3"],
      correct: 0,
      explanation: "2x + 5 = 13\n2x = 13 - 5\n2x = 8\nx = 4",
      timeLimit: 30,
    },
    {
      id: 2,
      question: 'מהו שטח המשולש עם בסיס 8 ס"מ וגובה 6 ס"מ?',
      options: ['24 ס"מ²', '48 ס"מ²', '14 ס"מ²', '32 ס"מ²'],
      correct: 0,
      explanation:
        'שטח משולש = (בסיס × גובה) ÷ 2\nשטח = (8 × 6) ÷ 2 = 48 ÷ 2 = 24 ס"מ²',
      timeLimit: 45,
    },
    {
      id: 3,
      question: "חשב: 15% מ-200",
      options: ["30", "25", "35", "20"],
      correct: 0,
      explanation: "15% מ-200 = 0.15 × 200 = 30",
      timeLimit: 25,
    },
    {
      id: 4,
      question: "פתור: √64 =",
      options: ["8", "6", "10", "4"],
      correct: 0,
      explanation: "√64 = 8 כי 8² = 64",
      timeLimit: 20,
    },
    {
      id: 5,
      question: 'מהו היקף עיגול ברדיוס 7 ס"מ? (π ≈ 3.14)',
      options: ['43.96 ס"מ', '153.86 ס"מ', '21.98 ס"מ', '14 ס"מ'],
      correct: 0,
      explanation: 'היקף עיגול = 2πr = 2 × 3.14 × 7 = 43.96 ס"מ',
      timeLimit: 40,
    },
  ],
  moderate: [
    {
      id: 6,
      question: "פתור את מערכת המשוואות:\n2x + y = 7\nx - y = 2",
      options: [
        "x = 3, y = 1",
        "x = 2, y = 3",
        "x = 4, y = -1",
        "x = 1, y = 5",
      ],
      correct: 0,
      explanation:
        "מהמשוואה השנייה: y = x - 2\nהצבה במשוואה הראשונה:\n2x + (x - 2) = 7\n3x - 2 = 7\n3x = 9\nx = 3\ny = 3 - 2 = 1",
      timeLimit: 90,
    },
    {
      id: 7,
      question: "מצא את נקודות החיתוך של הפרבולה y = x² - 4x + 3 עם ציר ה-x",
      options: [
        "x = 1, x = 3",
        "x = -1, x = -3",
        "x = 2, x = 4",
        "x = 0, x = 3",
      ],
      correct: 0,
      explanation:
        "נקודות חיתוך עם ציר x: y = 0\nx² - 4x + 3 = 0\n(x - 1)(x - 3) = 0\nx = 1 או x = 3",
      timeLimit: 120,
    },
    {
      id: 8,
      question: "חשב את הגבול: lim(x→2) (x² - 4)/(x - 2)",
      options: ["4", "2", "0", "לא קיים"],
      correct: 0,
      explanation:
        "פירוק: (x² - 4)/(x - 2) = (x + 2)(x - 2)/(x - 2) = x + 2\nכאשר x → 2: x + 2 → 4",
      timeLimit: 100,
    },
    {
      id: 9,
      question: "מצא את הנגזרת של הפונקציה f(x) = 3x³ - 2x² + x - 5",
      options: [
        "f'(x) = 9x² - 4x + 1",
        "f'(x) = 3x² - 2x + 1",
        "f'(x) = 9x² - 4x",
        "f'(x) = x³ - x²",
      ],
      correct: 0,
      explanation:
        "נגזרת של ax^n היא n·ax^(n-1)\nf'(x) = 3·3x² - 2·2x + 1 = 9x² - 4x + 1",
      timeLimit: 80,
    },
    {
      id: 10,
      question: "במשולש ישר זווית, אם זווית אחת היא 30°, ומהו יחס הצלעות?",
      options: ["1:√3:2", "1:2:√3", "√3:1:2", "2:1:√3"],
      correct: 0,
      explanation:
        "במשולש 30-60-90, יחס הצלעות הוא:\nמול 30°: מול 60°: מול 90° = 1:√3:2",
      timeLimit: 75,
    },
  ],
  hard: [
    {
      id: 11,
      question:
        "נתונה הפונקציה f(x) = ln(x² + 1). חשב את האינטגרל ∫₀¹ f(x)dx באמצעות אינטגרציה בחלקים",
      options: [
        "ln(2) - 1 + π/4",
        "2ln(2) - 1",
        "ln(2) + π/4 - 1",
        "ln(2) - π/4",
      ],
      correct: 0,
      explanation:
        "זהו אינטגרל מורכב הדורש שימוש באינטגרציה בחלקים ובהצבות טריגונומטריות.\nהפתרון המלא כולל מספר שלבים של הצבה ופירוק.",
      timeLimit: null,
    },
    {
      id: 12,
      question: "פתור את המשוואה הדיפרנציאלית: dy/dx - 2y = e^(3x)",
      options: [
        "y = Ce^(2x) + e^(3x)",
        "y = Ce^(2x) - e^(3x)",
        "y = Ce^(2x) + (1/3)e^(3x)",
        "y = Ce^(-2x) + e^(3x)",
      ],
      correct: 0,
      explanation:
        "זוהי משוואה דיפרנציאלית ליניארית מסדר ראשון.\nהפתרון הכללי: y = Ce^(2x) + פתרון פרטי\nעבור הפתרון הפרטי נציב y = Ae^(3x) ונקבל A = 1",
      timeLimit: null,
    },
    {
      id: 13,
      question:
        "מצא את המקסימום והמינימום של הפונקציה f(x,y) = x² + y² - 2x - 4y + 5 בתחום המוגבל על ידי x² + y² ≤ 9",
      options: [
        "מקס: 14, מין: 0",
        "מקס: 18, מין: 2",
        "מקס: 12, מין: 1",
        "מקס: 15, מין: 0",
      ],
      correct: 0,
      explanation:
        "זוהי בעיית אופטימיזציה עם אילוץ.\nצריך למצוא נקודות קריטיות בפנים התחום ועל הגבול באמצעות כופלי לגראנז'.",
      timeLimit: null,
    },
    {
      id: 14,
      question: "הוכח כי הטור ∑(n=1 to ∞) 1/(n²+1) מתכנס ומצא את גבולו",
      options: [
        "מתכנס ל-π/2 - 1",
        "מתכנס ל-π²/6 - 1",
        "מתכנס ל-1",
        "מתכנס ל-π/4",
      ],
      correct: 0,
      explanation:
        "משווים לטור p עם p=2 ומשתמשים במבחן ההשוואה.\nהטור מתכנס אך חישוב הסכום המדויק דורש שיטות מתקדמות.",
      timeLimit: null,
    },
    {
      id: 15,
      question:
        "במרחב התלת-ממדי, מצא את המרחק בין הישר L: (x-1)/2 = (y+1)/(-1) = z/3 למישור P: 2x - y + z = 5",
      options: [
        "המרחק הוא 2/√6",
        "המרחק הוא √6/3",
        "הישר חותך את המישור",
        "המרחק הוא 1/√6",
      ],
      correct: 2,
      explanation:
        "צריך לבדוק אם הישר מקביל למישור או חותך אותו.\nוקטור כיוון הישר: (2,-1,3)\nוקטור נורמל למישור: (2,-1,1)\nמכפלה סקלרית ≠ 0, לכן הישר חותך את המישור.",
      timeLimit: null,
    },
  ],
};

export default function InterStudy() {
  const [showModal, setShowModal] = useState(true);
  const [difficulty, setDifficulty] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isAnswered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      handleTimeUp();
    }
  }, [timeLeft, isAnswered]);

  const startQuiz = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    const selectedQuestions = mathQuestions[selectedDifficulty].slice(0, 5); // Take 5 questions
    setQuestions(selectedQuestions);
    setUserAnswers(new Array(selectedQuestions.length).fill(null));
    setCurrentQuestion(0);
    setTimeLeft(selectedQuestions[0].timeLimit);
    setShowModal(false);
  };

  const handleAnswer = (answerIndex) => {
    if (isAnswered) return;

    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setUserAnswers(newAnswers);
    setIsAnswered(true);

    if (answerIndex === questions[currentQuestion].correct) {
      setScore(score + 1);
    }
  };

  const handleTimeUp = () => {
    setIsAnswered(true);
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = -1; // -1 indicates no answer/timeout
    setUserAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setIsAnswered(false);
      setShowExplanation(false);
      setTimeLeft(questions[currentQuestion + 1].timeLimit);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setShowModal(true);
    setDifficulty(null);
    setCurrentQuestion(0);
    setQuestions([]);
    setUserAnswers([]);
    setShowExplanation(false);
    setTimeLeft(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
  };

  const getDifficultyConfig = (diff) => {
    switch (diff) {
      case "easy":
        return {
          color:
            "from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700",
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-200",
          textColor: "text-emerald-800",
          icon: "🌱",
        };
      case "moderate":
        return {
          color:
            "from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          textColor: "text-amber-800",
          icon: "🔥",
        };
      case "hard":
        return {
          color:
            "from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700",
          bgColor: "bg-rose-50",
          borderColor: "border-rose-200",
          textColor: "text-rose-800",
          icon: "⚡",
        };
      default:
        return {
          color: "from-gray-500 to-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-800",
          icon: "📚",
        };
    }
  };

  if (showModal) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center z-50 p-4">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-lg w-full mx-4 relative shadow-2xl border border-white/20">
          <button
            onClick={() => (window.location.href = "/")}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <FaTimes size={24} />
          </button>

          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🧮</div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              חידון מתמטיקה
            </h2>
            <p className="text-gray-600">בחר את רמת הקושי המתאימה לך</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => startQuiz("easy")}
              className={`group w-full p-6 text-white rounded-2xl font-semibold transition-all duration-300 bg-gradient-to-r ${
                getDifficultyConfig("easy").color
              } transform hover:scale-105 hover:shadow-xl`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">
                  {getDifficultyConfig("easy").icon}
                </span>
                <div className="text-right">
                  <div className="text-xl font-bold">קל</div>
                </div>
              </div>
              <div className="text-sm opacity-90 text-right">
                נוסחאות בסיסיות ותרגילים מהירים
              </div>
              <div className="text-xs mt-2 opacity-80 bg-white/20 rounded-lg px-3 py-1 inline-block">
                זמן מוגבל לכל שאלה
              </div>
            </button>

            <button
              onClick={() => startQuiz("moderate")}
              className={`group w-full p-6 text-white rounded-2xl font-semibold transition-all duration-300 bg-gradient-to-r ${
                getDifficultyConfig("moderate").color
              } transform hover:scale-105 hover:shadow-xl`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">
                  {getDifficultyConfig("moderate").icon}
                </span>
                <div className="text-right">
                  <div className="text-xl font-bold">בינוני</div>
                </div>
              </div>
              <div className="text-sm opacity-90 text-right">
                שאלות מורכבות יותר ונושאים מתקדמים
              </div>
              <div className="text-xs mt-2 opacity-80 bg-white/20 rounded-lg px-3 py-1 inline-block">
                זמן מוגבל מותאם
              </div>
            </button>

            <button
              onClick={() => startQuiz("hard")}
              className={`group w-full p-6 text-white rounded-2xl font-semibold transition-all duration-300 bg-gradient-to-r ${
                getDifficultyConfig("hard").color
              } transform hover:scale-105 hover:shadow-xl`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">
                  {getDifficultyConfig("hard").icon}
                </span>
                <div className="text-right">
                  <div className="text-xl font-bold">קשה</div>
                </div>
              </div>
              <div className="text-sm opacity-90 text-right">
                שאלות מבגרות (שאלון 581) - אתגר אמיתי
              </div>
              <div className="text-xs mt-2 opacity-80 bg-white/20 rounded-lg px-3 py-1 inline-block">
                ללא הגבלת זמן
              </div>
            </button>
          </div>

          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>בהצלחה! 💪</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    const getScoreEmoji = () => {
      if (percentage >= 90) return "🏆";
      if (percentage >= 80) return "🎉";
      if (percentage >= 70) return "👏";
      if (percentage >= 60) return "👍";
      return "💪";
    };

    const getScoreMessage = () => {
      if (percentage >= 90) return "מעולה! אתה מאסטר מתמטיקה!";
      if (percentage >= 80) return "כל הכבוד! ביצועים מצוינים!";
      if (percentage >= 70) return "יפה מאוד! אתה בדרך הנכונה!";
      if (percentage >= 60) return "לא רע! המשך להתאמן!";
      return "אל תתייאש! התרגול עושה את המאסטר!";
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="text-center">
              <div className="text-8xl mb-6 animate-bounce">
                {getScoreEmoji()}
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                סיימת את החידון!
              </h2>
              {/* Score Circle */}
              <div className="relative w-[10vw] h-[10vw] max-w-[100px] max-h-[100px] mx-auto mb-6">
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
                    <linearGradient
                      id="gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-bold text-gray-800">
                  {percentage}%
                </span>
              </div>
              {/* Score Section */}
              <div className="text-center mb-6">
                <p className="text-lg text-gray-600">
                  הציון שלך:{" "}
                  <span className="font-bold text-indigo-600">{score}</span>{" "}
                  מתוך <span className="font-bold">{questions.length}</span>
                </p>
                <p className="text-lg text-gray-600 mt-2">
                  {getScoreMessage()}
                </p>
              </div>

              {/* Buttons Section */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <button
                  onClick={resetQuiz}
                  className="group bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <FaGraduationCap className="mr-2 group-hover:animate-pulse" />
                  <span>התחל חידון חדש</span>
                </button>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="group bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <FaHome className="group-hover:animate-pulse" />
                  <span>חזור לדף הבית</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⚡</div>
          <p className="text-xl text-gray-600">טוען שאלות...</p>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const diffConfig = getDifficultyConfig(difficulty);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {/* Floating Home Button */}
      <button
        onClick={() => (window.location.href = "/")}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white p-4 rounded-full font-semibold shadow-2xl z-50 transition-all duration-300 transform hover:scale-110 group"
      >
        <FaHome size={20} className="group-hover:animate-pulse" />
      </button>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-4xl w-full">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Header */}
            <div
              className={`${diffConfig.bgColor} border-b ${diffConfig.borderColor} p-6`}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{diffConfig.icon}</span>
                    <div>
                      <div className="text-lg font-bold text-gray-800">
                        שאלה {currentQuestion + 1} מתוך {questions.length}
                      </div>
                      <div
                        className={`text-sm ${diffConfig.textColor} font-medium`}
                      >
                        {difficulty === "easy"
                          ? "רמה קלה"
                          : difficulty === "moderate"
                          ? "רמה בינונית"
                          : "רמה קשה"}
                      </div>
                    </div>
                  </div>
                </div>

                {timeLeft !== null && (
                  <div
                    className={`flex items-center space-x-3 px-4 py-2 rounded-2xl ${
                      timeLeft <= 10
                        ? "bg-red-100 text-red-600 animate-pulse"
                        : "bg-blue-100 text-blue-600"
                    } transition-all duration-300`}
                  >
                    <FaClock className={timeLeft <= 10 ? "animate-spin" : ""} />
                    <span className="font-bold text-lg">{timeLeft}s</span>
                  </div>
                )}
              </div>

              {/* Enhanced Progress Bar */}
              <div className="relative">
                <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out relative"
                    style={{
                      width: `${
                        ((currentQuestion + 1) / questions.length) * 100
                      }%`,
                    }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-1 text-center">
                  התקדמות:{" "}
                  {Math.round(((currentQuestion + 1) / questions.length) * 100)}
                  %
                </div>
              </div>
            </div>

            {/* Question Content */}
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
                      } else if (index === userAnswers[currentQuestion]) {
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
                        onClick={() => handleAnswer(index)}
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
                              index === userAnswers[currentQuestion] &&
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

              {/* Action Buttons */}
              {isAnswered && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
                  <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="group flex items-center space-x-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    <FaLightbulb className="group-hover:animate-pulse" />
                    <span>{showExplanation ? "הסתר הסבר" : "הצג הסבר"}</span>
                  </button>

                  <button
                    onClick={nextQuestion}
                    className="group bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
                  >
                    <span>
                      {currentQuestion < questions.length - 1
                        ? "שאלה הבאה"
                        : "סיים חידון"}
                    </span>
                    {currentQuestion === questions.length - 1 && (
                      <FaTrophy className="group-hover:animate-bounce" />
                    )}
                  </button>
                </div>
              )}

              {/* Enhanced Explanation */}
              {showExplanation && (
                <div className="mt-8 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-3xl blur-sm"></div>
                  <div className="relative bg-gradient-to-r from-blue-50 to-purple-50 border-r-4 border-blue-400 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-500 text-white rounded-full p-2 ml-3">
                        <FaLightbulb size={20} />
                      </div>
                      <h4 className="font-bold text-xl text-blue-800">
                        הסבר מפורט:
                      </h4>
                    </div>
                    <div className="bg-white/60 rounded-xl p-4 border border-blue-200">
                      <p className="text-blue-700 whitespace-pre-line text-right leading-relaxed text-lg">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
