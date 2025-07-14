"use client";

export default function SessionStartScreen({
  sessionNumber,
  difficulty,
  onStart,
  isGeneralExplanation = false,
}) {
  return (
    <div
              className="min-h-screen panels flex items-center justify-center p-4 pt-20"
      dir="rtl"
    >
      <div className="max-w-2xl w-full panels backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center">
        <div className="text-5xl mb-4">🚀</div>
        {!isGeneralExplanation ? (
          <>
            <h1 className="text-4xl font-bold mb-2">
              תרגול מספר {sessionNumber}
            </h1>
            <p className="text-xl mb-6">
              רמת קושי:{" "}
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{difficulty}</span>
            </p>
          </>
        ) : (
          <h1 className="text-4xl font-bold mb-2">
            תרגולים אינטראקטיביים
          </h1>
        )}

        <p className="mb-8 max-w-lg mx-auto opacity-80">
          תוכנית האימונים בנויה מ-9 תרגולים ברמות קושי עולות: 3 תרגולים ראשונים
          ברמה קלה, 3 ברמה בינונית, ו-3 אחרונים ברמת בגרות מאתגרת.
        </p>

        <div className="panels p-6 rounded-2xl mb-8 text-right space-y-4">
          <h3 className="text-lg font-bold mb-3">
            כמה דגשים לפני שמתחילים:
          </h3>
          <div className="flex items-start">
            <span className="text-xl text-indigo-500 dark:text-indigo-400 ml-3 pt-1">🎯</span>
            <p className="">
              <strong>תרגול מותאם אישית:</strong> השאלות נבחרות עבורך על בסיס
              התוצאות מהמבחן הראשוני, ומתמקדות בנושאים בהם נדרש חיזוק.
            </p>
          </div>
          <div className="flex items-start">
            <span className="text-xl text-indigo-500 dark:text-indigo-400 ml-3 pt-1">💡</span>
            <p className="">
              <strong>עקביות היא המפתח:</strong> מומלץ לבצע תרגול אחד ביום, עד
              שלושה בשבוע.
            </p>
          </div>
          <div className="flex items-start">
            <span className="text-xl text-indigo-500 dark:text-indigo-400 ml-3 pt-1">🤔</span>
            <p className="">
              <strong>נתקעת?</strong> אין בעיה! מורה ה-AI שלנו זמין לכל שאלה,
              24/7.
            </p>
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl hover:shadow-xl transition-all duration-300 text-xl shadow-lg transform hover:scale-105"
        >
          {isGeneralExplanation ? "בואו נתחיל!" : "בואו נתחיל!"}
        </button>
      </div>
    </div>
  );
}
