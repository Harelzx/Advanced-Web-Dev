"use client";
import { useRouter } from "next/navigation";

export default function SessionSummaryScreen({
  results,
  completedSessions,
  nextSessionNumber,
  onContinue,
  onBackToSessions,
  isComplete,
  onRedoSession,
}) {
  const router = useRouter();
  // Calculate score as a percentage out of 100
  const maxScore = results.totalQuestions * 20;
  const finalScore =
    maxScore > 0 ? Math.round((results.score / maxScore) * 100) : 0;

  return (
    <div
              className="min-h-screen panels flex items-center justify-center p-4 pt-20"
      dir="rtl"
    >
      <div className="max-w-md w-full panels backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold mb-4 text-slate-800 dark:text-slate-200">כל הכבוד!</h2>
        <p className="text-lg text-slate-700 dark:text-slate-300 mb-6">
          סיימת את תרגול מספר{" "}
          <span className="font-bold text-slate-800 dark:text-slate-200">{completedSessions}</span> בציון{" "}
          <span className="font-bold text-indigo-600 dark:text-indigo-400">
            {finalScore} מתוך 100
          </span>
          .
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!isComplete &&
          typeof nextSessionNumber === "number" &&
          nextSessionNumber >= 1 &&
          nextSessionNumber <= 9 ? (
            <button
              onClick={onContinue}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition duration-300 shadow-md transform hover:scale-105"
            >
              המשך לתרגול הבא ({nextSessionNumber})
            </button>
          ) : null}
          <button
            onClick={onRedoSession}
            className="bg-blue-200/80 dark:bg-blue-700/60 text-blue-800 dark:text-blue-200 font-bold py-3 px-6 rounded-xl hover:bg-blue-300/90 dark:hover:bg-blue-600/70 transition duration-300 shadow-md"
          >
            בצע תרגול זה שוב
          </button>
          {isComplete ? (
            <div className="flex flex-col gap-4 items-center w-full">
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                סיימת את כל תוכנית התרגולים!
              </p>
              <button
                onClick={onBackToSessions}
                className="bg-slate-200/80 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200 font-bold py-3 px-6 rounded-xl hover:bg-slate-300/90 dark:hover:bg-slate-600/70 transition duration-300 shadow-md"
              >
                חזור לעמוד התרגולים
              </button>
            </div>
          ) : (
            <button
              onClick={onBackToSessions}
              className="bg-slate-200/80 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200 font-bold py-3 px-6 rounded-xl hover:bg-slate-300/90 dark:hover:bg-slate-600/70 transition duration-300 shadow-md"
            >
              חזור לעמוד התרגולים
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
