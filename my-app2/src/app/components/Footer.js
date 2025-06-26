'use client';

export default function Footer() {
  return (
    <footer className="footer-custom w-full border-t border-slate-200 dark:border-slate-700 mt-auto bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Company information */}
          <div className="text-center md:text-right">
            <h3 className="text-lg font-bold mb-2">
              LearnPath
            </h3>
            <p className="text-sm leading-relaxed">
              פלטפורמת למידה חכמה המותאמת אישית לתלמידים, הורים ומורים.
              מסלולי למידה מותאמים, ומעקב התקדמות יעיל
            </p>
          </div>

          {/* Important links */}
          <div className="text-center">
            <h4 className="text-md font-semibold mb-2">
              קישורים חשובים
            </h4>
            <ul className="space-y-1">
              <li>
                <a href="/about" className="text-sm transition-colors duration-200 hover:text-indigo-600 dark:hover:text-indigo-400">
                  עלינו
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-sm transition-colors duration-200 hover:text-indigo-600 dark:hover:text-indigo-400">
                  מדיניות פרטיות
                </a>
              </li>
              <li>
                <a href="/terms" className="text-sm transition-colors duration-200 hover:text-indigo-600 dark:hover:text-indigo-400">
                  תנאי שימוש
                </a>
              </li>

            </ul>
          </div>

          {/* Contact information */}
          <div className="text-center">
            <h4 className="text-md font-semibold mb-2">
              יצירת קשר
            </h4>
            <div className="space-y-2">
              <p className="text-sm">
                📧 info@learnpath.co.il
              </p>
              <p className="text-sm">
                📞 03-1234567
              </p>
              <p className="text-sm">
                🕒 ימים א׳-ה׳, 8:00-17:00
              </p>
            </div>
          </div>

        </div>


      </div>
    </footer>
  );
} 