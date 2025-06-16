"use client";
import { useRouter } from "next/navigation";

export default function SessionSummaryScreen({
  results,
  completedSessions,
  nextSessionNumber,
  onContinue,
  onBackToSessions,
}) {
  const router = useRouter();
  const finalScore = Math.round((results.score / results.totalQuestions) * 100);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="max-w-md w-full panels/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold mb-4 text-gray-800">כל הכבוד!</h2>
        <p className="text-lg text-gray-700 mb-6">
          סיימת את תרגול מספר{" "}
          <span className="font-bold">{completedSessions}</span> בציון{" "}
          <span className="font-bold text-indigo-600">
            {finalScore} מתוך 100
          </span>
          .
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {nextSessionNumber <= 9 ? (
            <button
              onClick={onContinue}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition duration-300 shadow-md transform hover:scale-105"
            >
              המשך לתרגול הבא ({nextSessionNumber})
            </button>
          ) : (
            <p className="text-lg font-semibold text-green-600">
              סיימת את כל תוכנית האימונים!
            </p>
          )}
          <button
            onClick={onBackToSessions}
            className="bg-gray-200/80 text-gray-800 font-bold py-3 px-6 rounded-xl hover:bg-gray-300/90 transition duration-300 shadow-md"
          >
            חזור לעמוד התרגולים
          </button>
        </div>
      </div>
    </div>
  );
}
