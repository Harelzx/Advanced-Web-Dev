'use client';

import LoadingWheel from '../components/LoadingWheel';
import { useFirstQuizLogic } from '@/app/hooks/useFirstQuizLogic';

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
    handleNextQuestion,
    handlePreviousQuestion,
  } = useFirstQuizLogic();

  if (submitting) {
    return <LoadingWheel title="שומר תוצאות..." message="אנא המתן בזמן שאנו מעבדים את התשובות שלך." />;
  }

  return (
    <div className="min-h-screen panels-900 flex items-center justify-center p-2 md:p-6">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl gap-4">
        {/* Question Navigation Grid - Hidden on mobile, visible on large screens */}
        <div className="hidden lg:block lg:w-1/4 panels p-4 rounded-xl">
          <h2 className="text-blue-700 text-xl font-bold mb-4" style={{ direction: 'rtl' }}>
            מפת שאלות
          </h2>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: totalQuestions }, (_, i) => (
              <button
                key={i}
                onClick={() => handleGridClick(i)}
                className={`w-12 h-12 border-2 rounded flex items-center justify-center text-sm ${
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

        {/* Main Quiz Content */}
        <div className="w-full lg:w-3/4 panels p-4 md:p-6 rounded-xl shadow-2xl">
          {/* Mobile Progress Indicator */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
            <div className="text-blue-500 font-medium text-sm">
              שאלה {currentIndex + 1} מתוך {totalQuestions}
            </div>
            <div className="text-blue-500 font-medium text-sm">
              ענית על {totalAnswered} מתוך {totalQuestions} שאלות
            </div>
          </div>

          <h1 className="text-white text-2xl md:text-3xl font-bold mb-6" style={{ direction: 'rtl', textAlign: 'right' }}>
            חידון שאלות
          </h1>
          {loading ? (
            <LoadingWheel title="טוען שאלות..." message="אנא המתן בזמן שאנו מכינים את החידון." />
          ) : questions.length > 0 ? (
            <>
              <h2 className="text-lg md:text-xl text-white font-semibold mb-4" style={{ direction: 'rtl', textAlign: 'right' }}>
                {questions[currentIndex].question || `שאלה ${currentIndex + 1}`}
              </h2>
              <div className="grid gap-3 md:gap-4">
                {shuffledOptions.map((option, index) => {
                  const qId = questions[currentIndex].id;
                  const isSelected = userAnswers[qId] === option;
                  const buttonStyles = `group w-full p-3 md:p-5 rounded-xl md:rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] text-right ${
                    isSelected
                      ? 'bg-blue-500 text-white border-blue-600'
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
                        <span className="text-base md:text-lg font-medium">{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Buttons - Above finish button */}
              <div className="flex justify-between items-center mt-6 mb-4">
                <button
                  onClick={handleNextQuestion}
                  disabled={currentIndex === totalQuestions - 1}
                  className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-4 py-2 rounded transition-colors"
                >
                  שאלה הבאה
                </button>
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentIndex === 0}
                  className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-4 py-2 rounded transition-colors"
                >
                  שאלה קודמת
                </button>
              </div>

              <button
                onClick={finishTest}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition text-lg"
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