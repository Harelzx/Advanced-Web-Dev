'use client';

import LoadingWheel from '../components/LoadingWheel';
import { useFirstQuizLogic } from '../hooks/useFirstQuizLogic';

export default function FirstQuiz() {
  const {
    questions,
    loading,
    userAnswers,
    currentIndex,
    shuffledOptions,
    submitting,
    totalAnswered,
    totalQuestions,
    handleAnswerChange,
    finishTest,
    handleGridClick,
  } = useFirstQuizLogic();

  if (submitting) {
    return <LoadingWheel title="שומר תוצאות..." message="אנא המתן בזמן שאנו מעבדים את התשובות שלך." />;
  }

  return (
    <div className="min-h-screen panels-900 flex items-center justify-center p-6">
      <div className="flex w-full max-w-6xl">
        {/* Question Navigation Grid (Left Side) */}
        <div className="w-1/4 panels p-4 rounded-l-xl flex flex-col items-center">
          <h2 className="text-blue-700 text-xl font-bold mb-4" style={{ direction: 'rtl' }}>
            מפת שאלות
          </h2>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: totalQuestions }, (_, i) => (
              <button
                key={i}
                onClick={() => handleGridClick(i)}
                className={`w-12 h-12 border-2 rounded flex items-center justify-center ${
                  currentIndex === i
                    ? 'bg-blue-500 text-white border-blue-700'
                    : userAnswers[questions[i]?.id]
                    ? 'bg-green-500 text-white border-green-600'
                    : 'panels text-black border-gray-300'
                }`}
                style={{ direction: 'rtl' }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Main Quiz Content (Right Side) */}
        <div className="w-3/4 panels p-6 rounded-r-xl shadow-2xl text-center ml-4">
          <div className="flex justify-between items-center mb-4">
            <div className="text-blue-500 font-medium text-sm">
              ענית על {totalAnswered} מתוך {totalQuestions} שאלות
            </div>
          </div>
          <h1 className="text-white text-3xl font-bold mb-6" style={{ direction: 'rtl', textAlign: 'right' }}>
            חידון שאלות
          </h1>
          {loading ? (
            <LoadingWheel title="טוען שאלות..." message="אנא המתן בזמן שאנו מכינים את החידון." />
          ) : questions.length > 0 ? (
            <>
              <h2 className="text-xl text-white font-semibold mb-4" style={{ direction: 'rtl', textAlign: 'right' }}>
                {questions[currentIndex].question || `שאלה ${currentIndex + 1}`}
              </h2>
              <div className="grid gap-4">
                {shuffledOptions.map((option, index) => {
                  const qId = questions[currentIndex].id;
                  const isSelected = userAnswers[qId] === option;
                  const buttonStyles = `group w-full p-5 rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] text-right ${
                    isSelected
                      ? 'bg-blue-500'
                      : 'bg-gray-50 border-gray-200 panels hover:bg-blue hover:border-green-400 hover:text-green-800'
                  }`;
                  return (
                    <button
                      key={index}
                      className={buttonStyles}
                      onClick={() => handleAnswerChange(qId, option)}
                      style={{ direction: 'rtl', textAlign: 'right' }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium">{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={finishTest}
                className="mt-6 w-full bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
                disabled={submitting}
              >
                סיים מבחן
              </button>
            </>
          ) : (
            <p className="text-white" style={{ direction: 'rtl', textAlign: 'right' }}>
              לא נמצאו שאלות.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}