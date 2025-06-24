"use client";

import Link from 'next/link';
import TeamSection from '../components/TeamSection';

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background-color)', color: 'var(--text-color)' }}>
      
      {/* Back to Home Button */}
      <div className="p-4">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200 font-medium"
        >
          ← חזרה לעמוד הראשי
        </Link>
      </div>
      
      {/* Hero Section */}
      <section className="pt-4 pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: 'var(--text-color)' }}>
            עלינו
          </h1>
          <div className="w-24 h-1 bg-indigo-600 mx-auto rounded-full"></div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl p-6 shadow-lg border mb-4" style={{ 
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--input-border)'
          }}>
            <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: 'var(--text-color)' }}>
              הפרויקט נולד ממלחמת חרבות ברזל
            </h2>
            <div className="max-w-4xl mx-auto" style={{ color: 'var(--text-color)', direction: 'rtl' }}>
              <p className="text-lg leading-relaxed mb-4" style={{ lineHeight: '1.8', textAlign: 'justify' }}>
                ב-7 באוקטובר 2023, כשהתחילה מלחמת חרבות ברזל, אלפי תלמידים ברחבי ישראל מצאו את עצמם מפונים מבתיהם. פתאום, תלמידי כיתות י&ldquo;א ו-י&ldquo;ב שהיו אמורים להתכונן לבגרויות נותרו ללא מסגרת לימודים קבועה.
              </p>
              <p className="text-lg leading-relaxed mb-4" style={{ lineHeight: '1.8', textAlign: 'justify' }}>
                ראינו את הצורך הדחוף: תלמידים שצריכים להשלים חומר רב לקראת הבגרויות, הורים מודאגים שרוצים לעקוב אחר ההתקדמות, ומורים שצריכים כלים דיגיטליים להמשך הוראה מרחוק.
              </p>
              <p className="text-lg leading-relaxed" style={{ lineHeight: '1.8', textAlign: 'justify' }}>
                כך נולד LearnPath - מתוך רצון אמיתי לעזור לתלמידי ישראל להמשיך ללמוד ולהצליח, גם בזמנים הקשים ביותר 💙
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: 'var(--text-color)' }}>
            ארכיטקטורת הפרויקט
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Frontend */}
            <div className="rounded-2xl p-6 shadow-lg border" style={{ 
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--input-border)'
            }}>
              <div className="text-4xl mb-4 text-center">⚛️</div>
              <h3 className="text-xl font-semibold mb-3 text-center" style={{ color: 'var(--text-color)' }}>
                Frontend
              </h3>
              <ul className="space-y-2 text-center" style={{ color: 'var(--text-color)', opacity: 0.7 }}>
                <li>Next.js 14 - React Framework</li>
                <li>Tailwind CSS - עיצוב מודרני</li>
                <li>CSS Variables - ערכות נושא</li>
                <li>Responsive Design - נגיש מכל מכשיר</li>
              </ul>
            </div>

            {/* Backend */}
            <div className="rounded-2xl p-6 shadow-lg border" style={{ 
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--input-border)'
            }}>
              <div className="text-4xl mb-4 text-center">🔧</div>
              <h3 className="text-xl font-semibold mb-3 text-center" style={{ color: 'var(--text-color)' }}>
                Backend
              </h3>
              <ul className="space-y-2 text-center" style={{ color: 'var(--text-color)', opacity: 0.7 }}>
                <li>Node.js - שרת JavaScript</li>
                <li>WebSocket - צ&apos;אט בזמן אמת</li>
                <li>API Routes - Next.js API</li>
                <li>Firebase - אימות ומסד נתונים</li>
              </ul>
            </div>

            {/* Features */}
            <div className="rounded-2xl p-6 shadow-lg border" style={{ 
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--input-border)'
            }}>
              <div className="text-4xl mb-4 text-center">✨</div>
              <h3 className="text-xl font-semibold mb-3 text-center" style={{ color: 'var(--text-color)' }}>
                תכונות מתקדמות
              </h3>
              <ul className="space-y-2 text-center" style={{ color: 'var(--text-color)', opacity: 0.7 }}>
                <li>מסלולי למידה אישיים</li>
                <li>מעקב התקדמות</li>
                <li>מערכת תגמולים</li>
                <li>ממשק משתמש אינטואיטיבי</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Team Section */}
      <TeamSection />

    </div>
  );
} 