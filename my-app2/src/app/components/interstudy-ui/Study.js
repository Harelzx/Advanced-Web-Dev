"use client";
import StudyHeader from "./StudyHeader";
import StudyQuestion from "./StudyQuestion";
import StudyResults from "./StudyResults";

function LoadingDisplay() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin text-6xl mb-4">🧠</div>
        <p className="text-xl text-gray-600">מכין עבורך אימון מותאם אישית...</p>
      </div>
    </div>
  );
}

export default function Study({
  isLoading,
  quizCompleted,
  score,
  totalQuestions,
  difficulty,
  currentQuestion,
  question,
  isAnswered,
  userAnswer,
  handleAnswer,
  nextQuestion,
  onHome,
  sessionNumber,
  difficultyConfigs = {
    easy: {
      color: "from-emerald-500 to-teal-600",
      icon: "🌱",
      title: "רמה קלה",
    },
    medium: {
      color: "from-amber-500 to-orange-600",
      icon: "🔥",
      title: "רמה בינונית",
    },
    hard: { color: "from-rose-500 to-red-600", icon: "⚡", title: "רמה קשה" },
  },
}) {
  const getDifficultyConfig = (diff) => {
    return (
      difficultyConfigs[diff] || {
        color: "from-gray-500 to-gray-600",
        icon: "📚",
        title: "אימון",
      }
    );
  };

  if (isLoading || !question) {
    return <LoadingDisplay />;
  }

  if (quizCompleted) {
    return (
      <StudyResults
        score={score}
        totalQuestions={totalQuestions}
        onRestart={onHome}
        onHome={onHome}
        sessionNumber={sessionNumber}
      />
    );
  }

  const diffConfig = getDifficultyConfig(difficulty);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-4xl w-full">
          <div className="panels/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <StudyHeader
              currentQuestion={currentQuestion}
              totalQuestions={totalQuestions}
              difficultyConfig={diffConfig}
              sessionNumber={sessionNumber}
            />

            <StudyQuestion
              question={question}
              isAnswered={isAnswered}
              userAnswer={userAnswer}
              onAnswer={handleAnswer}
            />

            {isAnswered &&
              !(question.sections && Array.isArray(question.sections)) && (
                <div className="mt-6 flex justify-center w-full pb-6">
                  <button
                    onClick={nextQuestion}
                    className="px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 transform bg-green-600 hover:bg-green-700 hover:scale-105 shadow-lg"
                  >
                    {currentQuestion === totalQuestions - 1
                      ? "סיים תרגול"
                      : "השאלה הבאה"}
                  </button>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
