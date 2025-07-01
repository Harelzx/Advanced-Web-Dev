"use client";

export default function SessionStartScreen({
  sessionNumber,
  difficulty,
  onStart,
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 panels"
      dir="rtl"
    >
      <div className="max-w-2xl w-full panels/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center">
        <div className="text-5xl mb-4">🚀</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          תרגול מספר {sessionNumber}
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          רמת קושי:{" "}
          <span className="font-semibold text-indigo-600">{difficulty}</span>
        </p>

        <p className="text-gray-700 mb-8 max-w-lg mx-auto">
          תוכנית האימונים בנויה מ-9 תרגולים ברמות קושי עולות: 3 תרגולים ראשונים
          ברמה קלה, 3 ברמה בינונית, ו-3 אחרונים ברמת בגרות מאתגרת.
        </p>

        <div className="bg-indigo-50/50 p-6 rounded-2xl mb-8 text-right space-y-4">
          <h3 className="text-lg font-bold text-gray-800 mb-3">
            כמה דגשים לפני שמתחילים:
          </h3>
          <div className="flex items-start">
            <span className="text-xl text-indigo-500 ml-3 pt-1">🎯</span>
            <p className="text-gray-700">
              <strong>תרגול מותאם אישית:</strong> השאלות נבחרות עבורך על בסיס
              התוצאות מהמבחן הראשוני, ומתמקדות בנושאים בהם נדרש חיזוק.
            </p>
          </div>
          <div className="flex items-start">
            <span className="text-xl text-indigo-500 ml-3 pt-1">💡</span>
            <p className="text-gray-700">
              <strong>עקביות היא המפתח:</strong> מומלץ לבצע תרגול אחד ביום, עד
              שלושה בשבוע.
            </p>
          </div>
          <div className="flex items-start">
            <span className="text-xl text-indigo-500 ml-3 pt-1">🤔</span>
            <p className="text-gray-700">
              <strong>נתקעת?</strong> אין בעיה! מורה ה-AI שלנו זמין לכל שאלה,
              24/7.
            </p>
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-8 rounded-2xl hover:shadow-xl transition-all duration-300 text-xl shadow-lg transform hover:scale-105"
        >
          בואו נתחיל!
        </button>
      </div>
    </div>
  );
}
