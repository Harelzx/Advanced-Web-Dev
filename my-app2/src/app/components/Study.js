"use client";
import { useState, useEffect } from "react";
import { FaHome } from "react-icons/fa";
import StudyModal from "./StudyModal";
import StudyHeader from "./StudyHeader";
import StudyQuestion from "./StudyQuestion";
import StudyActions from "./StudyActions";
import StudyExplanation from "./StudyExplanation";
import StudyResults from "./StudyResults";
import { auth, db } from "@/app/firebase/config";
import { doc, setDoc, serverTimestamp, increment } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import Navbar from "./Navbar";
import { fetchQuestionsByDifficulty } from "@/app/firebase/questions";

export default function Study({
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
  const [user] = useAuthState(auth);
  const [showModal, setShowModal] = useState(true);
  const [difficulty, setDifficulty] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [rawScores, setRawScores] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isAnswered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      handleTimeUp();
    }
  }, [timeLeft, isAnswered]);

  const startQuiz = async (selectedDifficulty) => {
    setIsLoading(true);
    setDifficulty(selectedDifficulty);

    try {
      const questions = await fetchQuestionsByDifficulty(selectedDifficulty);

      if (questions.length === 0) {
        throw new Error("No questions found for this difficulty level");
      }

      // Initialize sectioned questions with currentSection = 0
      const initializedQuestions = questions.map((q) => ({
        ...q,
        currentSection: 0,
      }));

      setSelectedQuestions(initializedQuestions);
      // For sectioned questions, we need an answer for each section
      const initialAnswers = initializedQuestions.map((q) =>
        q.type === "sectioned" ? new Array(q.sections.length).fill(null) : null
      );
      setUserAnswers(initialAnswers);
      setRawScores(new Array(questions.length).fill(0));
      setCurrentQuestion(0);
      setTimeLeft(questions[0]?.timeLimit || 30);
      setShowModal(false);
    } catch (error) {
      console.error("Error starting quiz:", error);
      alert("שגיאה בטעינת השאלות. אנא נסה שוב מאוחר יותר.");
      resetQuiz();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (sectionIndex, answerIndex) => {
    if (isAnswered) return;

    const currentQ = selectedQuestions[currentQuestion];
    const newAnswers = [...userAnswers];
    const newRawScores = [...rawScores];

    if (currentQ.type === "sectioned") {
      // For sectioned questions, store answer in the array for this question
      if (!Array.isArray(newAnswers[currentQuestion])) {
        newAnswers[currentQuestion] = new Array(currentQ.sections.length).fill(
          null
        );
      }

      // Update the answer for the specific section
      newAnswers[currentQuestion][sectionIndex] = answerIndex;

      // Calculate score for this section
      const isCorrect = answerIndex === 0;
      const sectionScore =
        currentQ.sections[sectionIndex].score ||
        Math.floor(100 / currentQ.sections.length);

      // Reset the score for this question and recalculate total from all sections
      newRawScores[currentQuestion] = newAnswers[currentQuestion].reduce(
        (total, ans, idx) => {
          if (ans === null) return total;
          const secScore =
            currentQ.sections[idx].score ||
            Math.floor(100 / currentQ.sections.length);
          return total + (ans === 0 ? secScore : 0);
        },
        0
      );

      // Check if all sections are answered
      const allSectionsAnswered = newAnswers[currentQuestion].every(
        (answer) => answer !== null
      );
      if (allSectionsAnswered) {
        setIsAnswered(true);
      }
    } else {
      // For regular questions, store single answer
      newAnswers[currentQuestion] = answerIndex;
      setIsAnswered(true);

      // Calculate score
      const isCorrect = answerIndex === 0;
      newRawScores[currentQuestion] = isCorrect ? 20 : 0;
    }

    setUserAnswers(newAnswers);
    setRawScores(newRawScores);

    // Calculate total score
    const totalScore = newRawScores.reduce((sum, score) => sum + score, 0);
    setScore(totalScore);
  };

  const handleTimeUp = () => {
    setIsAnswered(true);
    const currentQ = selectedQuestions[currentQuestion];
    const newAnswers = [...userAnswers];
    const newRawScores = [...rawScores];

    if (currentQ.type === "sectioned") {
      if (!Array.isArray(newAnswers[currentQuestion])) {
        newAnswers[currentQuestion] = new Array(currentQ.sections.length).fill(
          null
        );
      }
      // Mark current section as timed out
      newAnswers[currentQuestion][currentQ.currentSection] = -1;

      // Recalculate score for the question
      newRawScores[currentQuestion] = newAnswers[currentQuestion].reduce(
        (total, ans, idx) => {
          if (ans === null || ans === -1) return total;
          const secScore =
            currentQ.sections[idx].score ||
            Math.floor(100 / currentQ.sections.length);
          return total + (ans === 0 ? secScore : 0);
        },
        0
      );
    } else {
      newAnswers[currentQuestion] = -1;
      newRawScores[currentQuestion] = 0; // No points for timeout
    }

    setUserAnswers(newAnswers);
    setRawScores(newRawScores);
    setScore(newRawScores.reduce((sum, score) => sum + score, 0));
  };

  const nextQuestion = () => {
    if (currentQuestion < selectedQuestions.length - 1) {
      // Move to next question
      setCurrentQuestion(currentQuestion + 1);
      setIsAnswered(false);
      setShowExplanation(false);
      const nextQ = selectedQuestions[currentQuestion + 1];
      setTimeLeft(nextQ.timeLimit || null);
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
    setRawScores([]);
    setShowExplanation(false);
    setTimeLeft(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
  };

  const restartCurrentLevel = async () => {
    setIsLoading(true);
    try {
      const questions = await fetchQuestionsByDifficulty(difficulty);
      setSelectedQuestions(questions);
      setCurrentQuestion(0);
      setUserAnswers(new Array(questions.length).fill(null));
      setRawScores(new Array(questions.length).fill(0));
      setShowExplanation(false);
      setTimeLeft(questions[0]?.timeLimit || null);
      setIsAnswered(false);
      setScore(0);
      setQuizCompleted(false);
    } catch (error) {
      console.error("Error restarting quiz:", error);
      alert("שגיאה בטעינת השאלות. אנא נסה שוב מאוחר יותר.");
      resetQuiz();
    } finally {
      setIsLoading(false);
    }
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

  // Function to save results to Firebase
  const saveResults = async () => {
    if (!user) return;

    try {
      // Create a unique ID for this quiz attempt
      const quizId = `${difficulty}_${Date.now()}`;

      // Calculate percentage score (out of 100)
      const maxScore = selectedQuestions.length * 20; // 20 points per question
      const percentageScore = Math.round((score / maxScore) * 100);

      // Save detailed results
      await setDoc(doc(db, "users", user.uid, "interStudyResults", quizId), {
        difficulty,
        score: percentageScore,
        totalQuestions: selectedQuestions.length,
        timestamp: serverTimestamp(),
        details: {
          rawScore: score,
          maxPossibleScore: maxScore,
          questionResults: selectedQuestions.map((q, index) => ({
            questionId: q.id,
            userAnswer: userAnswers[index],
            isCorrect: userAnswers[index] === 0,
            points: rawScores[index],
            maxPoints: 20,
          })),
        },
      });

      // Update user's average score for this difficulty
      const averageScoreRef = doc(
        db,
        "users",
        user.uid,
        "interStudyStats",
        difficulty
      );
      await setDoc(
        averageScoreRef,
        {
          lastUpdated: serverTimestamp(),
          attempts: increment(1),
          totalScore: increment(percentageScore),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error saving quiz results:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {showModal ? (
        <StudyModal
          onClose={onHome}
          onStartQuiz={startQuiz}
          difficultyConfigs={difficultyConfigs}
          title={title}
          icon={icon}
        />
      ) : (
        <div className="container mx-auto px-4 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-2xl text-gray-600">טוען שאלות...</div>
            </div>
          ) : quizCompleted ? (
            <StudyResults
              score={score}
              questions={selectedQuestions}
              userAnswers={userAnswers}
              difficulty={difficulty}
              config={getDifficultyConfig(difficulty)}
              onRestart={restartCurrentLevel}
              onNewQuiz={resetQuiz}
              onSave={saveResults}
            />
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <StudyHeader
                  currentQuestion={currentQuestion}
                  totalQuestions={selectedQuestions.length}
                  timeLeft={timeLeft}
                  difficulty={difficulty}
                  config={getDifficultyConfig(difficulty)}
                />

                <StudyQuestion
                  question={selectedQuestions[currentQuestion]}
                  selectedAnswer={userAnswers[currentQuestion]}
                  onAnswer={handleAnswer}
                  isAnswered={isAnswered}
                />

                {isAnswered && (
                  <StudyExplanation
                    show={showExplanation}
                    onToggle={() => setShowExplanation(!showExplanation)}
                    explanation={selectedQuestions[currentQuestion].explanation}
                  />
                )}

                <StudyActions
                  isAnswered={isAnswered}
                  isLastQuestion={
                    currentQuestion === selectedQuestions.length - 1
                  }
                  onNext={nextQuestion}
                  onFinish={() => {
                    setQuizCompleted(true);
                    saveResults();
                  }}
                  showExplanation={showExplanation}
                  onToggleExplanation={() =>
                    setShowExplanation(!showExplanation)
                  }
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
