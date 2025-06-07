"use client";
import { useState, useEffect } from "react";
import { FaHome } from "react-icons/fa";
import QuizHeader from "./StudyHeader";
import QuizQuestion from "./StudyQuestion";
import QuizResults from "./StudyResults";

// Renamed from Quiz to Study and props are adapted for the training program
export default function Study({
  practiceSets, // e.g., { easy: [questions] }
  sessionNumber,
  onQuizComplete, // Renamed from onComplete
  onHome,
  difficultyConfigs = {
    easy: {
      color: "from-emerald-500 to-teal-600",
      icon: "🌱",
      title: "רמה קלה",
    },
    moderate: {
      color: "from-amber-500 to-orange-600",
      icon: "🔥",
      title: "רמה בינונית",
    },
    hard: {
      color: "from-rose-500 to-red-600",
      icon: "⚡",
      title: "רמה קשה",
    },
  },
}) {
  const [difficulty, setDifficulty] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [startTime, setStartTime] = useState(null); // To calculate total time

  // Automatically start the quiz when the component mounts
  useEffect(() => {
    if (practiceSets && typeof practiceSets === 'object') {
      // Find the difficulty level that actually has questions
      const difficultyLevel = Object.keys(practiceSets).find(key => practiceSets[key] && practiceSets[key].length > 0);
      
      if (difficultyLevel) {
        const questions = practiceSets[difficultyLevel];
        setDifficulty(difficultyLevel);
        setSelectedQuestions(questions);
        setUserAnswers(new Array(questions.length).fill(null));
        setCurrentQuestion(0);
        setTimeLeft(null); // No time limit
        setIsLoading(false);
        setStartTime(Date.now()); // Start the timer
      }
    }
  }, [practiceSets]);

  const handleAnswer = (answerIndex) => {
    if (isAnswered) return;

    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setUserAnswers(newAnswers);
    setIsAnswered(true);

    if (answerIndex === selectedQuestions[currentQuestion].correct) {
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
    if (currentQuestion < selectedQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setIsAnswered(false);
      setTimeLeft(null); // No time limit
    } else {
      setQuizCompleted(true);
      
      if (onQuizComplete) {
        const timeSpent = startTime ? Math.ceil((Date.now() - startTime) / (1000 * 60)) : 0; // in minutes
        const results = {
          score: score,
          totalQuestions: selectedQuestions.length,
          answers: userAnswers.map((answer, index) => ({
            questionId: selectedQuestions[index].id,
            userAnswer: answer,
            correct: selectedQuestions[index].correct,
            isCorrect: answer === selectedQuestions[index].correct
          })),
          difficulty: difficulty,
          timeSpent: timeSpent
        };
        onQuizComplete(results);
      }
    }
  };

  // The reset function might not be needed in this flow, but keeping it for now
  const resetQuiz = () => {
    // This would need to trigger a re-fetch in the parent component
    // For now, it's best handled by navigating away and back.
    if(onHome) onHome();
  };

  const getDifficultyConfig = (diff) => {
    return (
      difficultyConfigs[diff] || {
        color: "from-gray-500 to-gray-600",
        icon: "📚",
        title: "אימון",
      }
    );
  };

  // No longer need the difficulty selection modal

  // Show results screen
  if (quizCompleted) {
    return (
      <QuizResults
        score={score}
        totalQuestions={selectedQuestions.length}
        onRestart={onHome} // Restarting now goes home
        onHome={onHome}
        sessionNumber={sessionNumber}
      />
    );
  }

  // Show loading if questions are not yet processed
  if (isLoading || selectedQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🧠</div>
          <p className="text-xl text-gray-600">מכין עבורך אימון מותאם אישית...</p>
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
            {/* Header - now also receives sessionNumber */}
            <QuizHeader
              currentQuestion={currentQuestion}
              totalQuestions={selectedQuestions.length}
              difficulty={difficulty}
              difficultyConfig={diffConfig}
              timeLeft={timeLeft}
              sessionNumber={sessionNumber} // Pass session number to header
            />

            {/* Question Content */}
            <QuizQuestion
              question={question}
              isAnswered={isAnswered}
              userAnswer={userAnswers[currentQuestion]}
              onAnswer={handleAnswer}
            />

            {/* Action Buttons */}
            {isAnswered && (
              <div className="mt-6 flex justify-center w-full pb-6">
                <button
                  onClick={nextQuestion}
                  disabled={!isAnswered}
                  className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 transform ${
                    !isAnswered 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700 hover:scale-105 shadow-lg'
                  }`}
                >
                  {currentQuestion === selectedQuestions.length - 1 ? 'סיים תרגול' : 'השאלה הבאה'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
