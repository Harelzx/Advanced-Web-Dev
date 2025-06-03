"use client";
import { useState, useEffect } from "react";
import { FaHome } from "react-icons/fa";
import StudyModal from "./StudyModal";
import StudyHeader from "./StudyHeader";
import StudyQuestion from "./StudyQuestion";
import StudySectionedQuestion from "./StudySectionedQuestion";
import StudyActions from "./StudyActions";
import StudyExplanation from "./StudyExplanation";
import StudyResults from "./StudyResults";

export default function Study({
  questions,
  title = "חידון מתמטיקה",
  icon = "🧮",
  onHome,
  difficultyConfigs = {
    easy: {
      color:
        "from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-800",
      icon: "🌱",
      title: "קל",
      description: "נוסחאות בסיסיות ותרגילים מהירים",
      timeLabel: "זמן מוגבל לכל שאלה",
    },
    medium: {
      color:
        "from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-800",
      icon: "🔥",
      title: "בינוני",
      description: "שאלות מורכבות יותר ונושאים מתקדמים",
      timeLabel: "זמן מוגבל מותאם",
    },
    hard: {
      color: "from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200",
      textColor: "text-rose-800",
      icon: "⚡",
      title: "קשה",
      description: "שאלות מבגרות - אתגר אמיתי",
      timeLabel: "ללא הגבלת זמן",
    },
  },
}) {
  const [showModal, setShowModal] = useState(true);
  const [difficulty, setDifficulty] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
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
    const difficultyQuestions =
      questions[selectedDifficulty]?.slice(0, 5) || [];
    setSelectedQuestions(difficultyQuestions);
    // Initialize answers array based on whether questions have sections
    const initialAnswers = difficultyQuestions.map((q) =>
      q.sections ? new Array(q.sections.length).fill(null) : null
    );
    setUserAnswers(initialAnswers);
    setCurrentQuestion(0);
    setTimeLeft(difficultyQuestions[0]?.timeLimit || null);
    setShowModal(false);
  };

  const handleAnswer = (sectionIndex, answerIndex) => {
    if (isAnswered) return;

    const currentQ = selectedQuestions[currentQuestion];
    const newAnswers = [...userAnswers];

    if (currentQ.sections) {
      // For sectioned questions
      newAnswers[currentQuestion][sectionIndex] = answerIndex;
      setUserAnswers(newAnswers);

      // Check if all sections are answered
      const allSectionsAnswered = newAnswers[currentQuestion].every(
        (answer) => answer !== null
      );

      if (allSectionsAnswered) {
        setIsAnswered(true);
        // Calculate score for all sections
        let sectionScore = 0;
        currentQ.sections.forEach((section, idx) => {
          if (newAnswers[currentQuestion][idx] === section.correctAnswer) {
            sectionScore += section.points;
          }
        });
        setScore(score + sectionScore);
      }
    } else {
      // For regular questions
      newAnswers[currentQuestion] = answerIndex;
      setUserAnswers(newAnswers);
      setIsAnswered(true);

      if (answerIndex === currentQ.correct) {
        setScore(score + 1);
      }
    }
  };

  const handleTimeUp = () => {
    setIsAnswered(true);
    const newAnswers = [...userAnswers];
    const currentQ = selectedQuestions[currentQuestion];

    if (currentQ.sections) {
      // For sectioned questions, mark all unanswered sections as timed out
      newAnswers[currentQuestion] = newAnswers[currentQuestion].map(
        (answer) => answer ?? -1
      );
    } else {
      newAnswers[currentQuestion] = -1; // -1 indicates no answer/timeout
    }
    setUserAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < selectedQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setIsAnswered(false);
      setShowExplanation(false);
      setTimeLeft(selectedQuestions[currentQuestion + 1].timeLimit || null);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setShowModal(true);
    setDifficulty(null);
    setCurrentQuestion(0);
    setSelectedQuestions([]);
    setUserAnswers([]);
    setShowExplanation(false);
    setTimeLeft(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
  };

  const restartCurrentLevel = () => {
    setCurrentQuestion(0);
    const difficultyQuestions = questions[difficulty]?.slice(0, 5) || [];
    setSelectedQuestions(difficultyQuestions);
    const initialAnswers = difficultyQuestions.map((q) =>
      q.sections ? new Array(q.sections.length).fill(null) : null
    );
    setUserAnswers(initialAnswers);
    setShowExplanation(false);
    setTimeLeft(difficultyQuestions[0]?.timeLimit || null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
  };

  const getDifficultyConfig = (diff) => {
    return (
      difficultyConfigs[diff] || {
        color: "from-gray-500 to-gray-600",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
        textColor: "text-gray-800",
        icon: "📚",
        title: "רגיל",
        description: "שאלות רגילות",
        timeLabel: "זמן רגיל",
      }
    );
  };

  // Show modal for difficulty selection
  if (showModal) {
    return (
      <StudyModal
        onClose={onHome || (() => (window.location.href = "/"))}
        onStartQuiz={startQuiz}
        difficultyConfigs={difficultyConfigs}
        title={title}
        icon={icon}
      />
    );
  }

  // Show results screen
  if (quizCompleted) {
    const totalPossibleScore = selectedQuestions.reduce(
      (total, q) =>
        total +
        (q.sections
          ? q.sections.reduce((sTotal, s) => sTotal + (s.points || 0), 0)
          : 1),
      0
    );

    // Normalize score to 100
    const normalizedScore = Math.round((score / totalPossibleScore) * 100);

    return (
      <StudyResults
        score={score}
        totalQuestions={selectedQuestions.length}
        maxScore={100}
        onRestart={restartCurrentLevel}
        onChooseDifficulty={resetQuiz}
        onHome={onHome || (() => (window.location.href = "/Main_Page"))}
      />
    );
  }

  // Show loading if no questions
  if (selectedQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⚡</div>
          <p className="text-xl text-gray-600">טוען שאלות...</p>
        </div>
      </div>
    );
  }

  const question = selectedQuestions[currentQuestion];
  const diffConfig = getDifficultyConfig(difficulty);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {/* Floating Home Button */}
      <button
        onClick={onHome || (() => (window.location.href = "/"))}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white p-4 rounded-full font-semibold shadow-2xl z-50 transition-all duration-300 transform hover:scale-110 group"
      >
        <FaHome size={20} className="group-hover:animate-pulse" />
      </button>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-4xl w-full">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Header */}
            <StudyHeader
              currentQuestion={currentQuestion}
              totalQuestions={selectedQuestions.length}
              difficulty={difficulty}
              difficultyConfig={diffConfig}
              timeLeft={timeLeft}
            />

            {/* Question Content */}
            {question.sections ? (
              <StudySectionedQuestion
                question={question}
                userAnswers={userAnswers[currentQuestion] || []}
                onAnswer={handleAnswer}
                isAnswered={isAnswered}
              />
            ) : (
              <StudyQuestion
                question={question}
                isAnswered={isAnswered}
                userAnswer={userAnswers[currentQuestion]}
                onAnswer={(answerIndex) => handleAnswer(null, answerIndex)}
              />
            )}

            {/* Action Buttons */}
            <StudyActions
              isAnswered={isAnswered}
              showExplanation={showExplanation}
              onToggleExplanation={() => setShowExplanation(!showExplanation)}
              onNext={nextQuestion}
              isLastQuestion={currentQuestion === selectedQuestions.length - 1}
            />

            {/* Explanation */}
            {showExplanation && question.sections ? (
              question.sections.map((section, index) => (
                <StudyExplanation
                  key={section.id}
                  explanation={section.explanation}
                  show={true}
                  title={`הסבר לחלק ${section.id}`}
                />
              ))
            ) : (
              <StudyExplanation
                explanation={question.explanation}
                show={showExplanation}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
