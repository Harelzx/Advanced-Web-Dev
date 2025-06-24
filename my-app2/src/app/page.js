"use client";

import Header from "./components/Header";
import TeamSection from "./components/TeamSection";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Additional content sections can be added here */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* How it works section */}
          <section className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold mb-8" style={{ color: 'var(--text-color)' }}>
              ?איך זה עובד
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👤</span>
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-color)' }}>
                  הרשמה פשוטה
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  הרשמה מהירה כהורה, מורה או תלמיד והתחלה מיידית
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-color)' }}>
                  מסלול אישי
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  המערכת יוצרת מסלול למידה מותאם לרמה ולצרכים
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-color)' }}>
                  מעקב והתקדמות
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  מעקב בזמן אמת אחר ההתקדמות ודוחות מפורטים
                </p>
              </div>

            </div>
          </section>

                  {/* Team Section */}
        <TeamSection />

        </div>
      </main>
    </div>
  );
}