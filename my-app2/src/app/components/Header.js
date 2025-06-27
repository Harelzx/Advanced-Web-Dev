'use client';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700"></div>
      
      {/* Background pattern overlay */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center">
          
          {/* Logo and brand */}
          <div className="mb-8">
            <h1 className="header-title text-5xl lg:text-7xl font-bold text-white mb-4 tracking-tight">
              LearnPath
            </h1>
            <div className="w-24 h-1 bg-yellow-400 mx-auto rounded-full"></div>
          </div>

          {/* Main headline */}
          <h2 className="header-subtitle text-2xl lg:text-4xl font-semibold text-white mb-6 leading-tight">
            פלטפורמת הלמידה החכמה
            <br />
            <span className="header-span text-yellow-300">לתלמידים, הורים ומורים</span>
          </h2>

          {/* Subtitle */}
          <p className="header-text text-xl lg:text-2xl text-white mb-10 max-w-2xl mx-auto leading-relaxed" style={{ textAlign: 'center', direction: 'rtl' }}>
            מסלולי למידה מותאמים אישית, מעקב התקדמות בזמן אמת, ותקשורת יעילה 
            בין כל הגורמים החינוכיים. הכל במקום אחד.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link 
              href="/sign-up" 
              className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              !הירשם עכשיו
            </Link>
            
            <Link 
              href="/login" 
              className="bg-white/20 hover:bg-white/30 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-300 border-2 border-white/30 hover:border-white/50 backdrop-blur-sm"
            >
              🔑 התחבר לחשבון
            </Link>
          </div>

          {/* Features highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto" dir="rtl">
            
            {/* Feature 1 - now diagnostic test */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-4xl mb-4">🌟</div>
              <h3 className="header-feature-title text-xl font-bold text-white mb-3">מבחן אבחון ומסלול אישי</h3>
              <p className="header-text text-white text-lg leading-relaxed">
                הרשמה פשוטה + מבחן חכם שמזהה חוזקות וחולשות ויוצר מסלול למידה מדויק במתמטיקה
              </p>
            </div>

            {/* Feature 2 - stays in middle */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="header-feature-title text-xl font-bold text-white mb-3">תרגולים מתקדמים עם AI</h3>
              <p className="header-text text-white text-lg leading-relaxed">
                9 שלבי אימון מדורגים, שאלות בגרות אמיתיות, ומורה בינה מלאכותית שעוזר בכל שאלה
              </p>
            </div>

            {/* Feature 3 - now tracking */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="header-feature-title text-xl font-bold text-white mb-3">מעקב ותקשורת מתקדמים</h3>
              <p className="header-text text-white text-lg leading-relaxed">
                תלמידים מתרגלים, הורים ומורים עוקבים - הכל במקום אחד עם תקשורת ישירה
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-12 fill-current text-white" style={{ color: 'var(--background-color)' }} viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
        </svg>
      </div>

    </header>
  );
} 