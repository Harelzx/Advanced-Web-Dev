'use client';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-700 mt-auto" style={{
      backgroundColor: 'var(--background-color)',
      borderTopColor: 'var(--input-border)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Company information */}
          <div className="text-center md:text-right">
            <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--text-color)' }}>
              LearnPath
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-color)', opacity: 0.7 }}>
              פלטפורמת למידה חכמה המותאמת אישית לתלמידים, הורים ומורים.
              מסלולי למידה מותאמים, ומעקב התקדמות יעיל
            </p>
          </div>

          {/* Important links */}
          <div className="text-center">
            <h4 className="text-md font-semibold mb-3" style={{ color: 'var(--text-color)' }}>
              קישורים חשובים
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-sm transition-colors duration-200 hover:text-indigo-600 dark:hover:text-indigo-400" style={{ color: 'var(--text-color)', opacity: 0.7 }}>
                  עלינו
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-sm transition-colors duration-200 hover:text-indigo-600 dark:hover:text-indigo-400" style={{ color: 'var(--text-color)', opacity: 0.7 }}>
                  מדיניות פרטיות
                </a>
              </li>
              <li>
                <a href="/terms" className="text-sm transition-colors duration-200 hover:text-indigo-600 dark:hover:text-indigo-400" style={{ color: 'var(--text-color)', opacity: 0.7 }}>
                  תנאי שימוש
                </a>
              </li>

            </ul>
          </div>

          {/* Contact information */}
          <div className="text-center md:text-left">
            <h4 className="text-md font-semibold mb-3" style={{ color: 'var(--text-color)' }}>
              יצירת קשר
            </h4>
            <div className="space-y-2">
              <p className="text-sm" style={{ color: 'var(--text-color)', opacity: 0.7 }}>
                📧 info@learnpath.co.il
              </p>
              <p className="text-sm" style={{ color: 'var(--text-color)', opacity: 0.7 }}>
                📞 03-1234567
              </p>
              <p className="text-sm" style={{ color: 'var(--text-color)', opacity: 0.7 }}>
                🕒 ימים א׳-ה׳, 8:00-17:00
              </p>
            </div>
          </div>

        </div>

        {/* Separator and copyright */}
        <div className="border-t border-slate-200 dark:border-slate-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm text-center md:text-right">
              © 2024 LearnPath. כל הזכויות שמורות.
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm text-center md:text-left mt-2 md:mt-0">
            פותח ב❤️ למען תלמידי ישראל
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
} 