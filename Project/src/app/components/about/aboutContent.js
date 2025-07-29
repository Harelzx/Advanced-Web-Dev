/**
 * About Page Content Configuration
 * This file contains all text content and data for the About page
 * to separate content from component logic for better maintainability
 */

export const aboutContent = {
  // Page title and navigation
  title: "עלינו",
  
  // Navigation
  navigation: {
    backToHome: {
      text: "← חזרה לעמוד הראשי",
      href: "/"
    }
  },
  
  // Hero section
  hero: {
    title: "עלינו",
    subtitle: null // Can be added later if needed
  },

  // Story section content
  story: {
    title: "הפרויקט נולד ממלחמת חרבות ברזל",
    paragraphs: [
      "ב-7 באוקטובר 2023, כשהתחילה מלחמת חרבות ברזל, אלפי תלמידים ברחבי ישראל מצאו את עצמם מפונים מבתיהם. פתאום, תלמידי כיתות י\"א ו-י\"ב שהיו אמורים להתכונן לבגרויות נותרו ללא מסגרת לימודים קבועה.",
      "ראינו את הצורך הדחוף: תלמידים שצריכים להשלים חומר רב לקראת הבגרויות, הורים מודאגים שרוצים לעקוב אחר ההתקדמות, ומורים שצריכים כלים דיגיטליים להמשך הוראה מרחוק.",
      "כך נולד LearnPath - מתוך רצון אמיתי לעזור לתלמידי ישראל להמשיך ללמוד ולהצליח, גם בזמנים הקשים ביותר 💙"
    ]
  },

  // Architecture section content
  architecture: {
    title: "ארכיטקטורת הפרויקט",
    cards: [
      {
        id: "frontend",
        icon: "⚛️",
        title: "Frontend",
        features: [
          "Next.js 14 - React Framework",
          "Tailwind CSS - עיצוב מודרני",
          "Responsive Design - נגיש מכל מכשיר"
        ]
      },
      {
        id: "backend",
        icon: "🔧",
        title: "Backend",
        features: [
          "Node.js - שרת JavaScript",
          "WebSocket - צ'אט בזמן אמת",
          "API Routes - Next.js API",
          "Firebase - אימות ומסד נתונים"
        ]
      },
      {
        id: "features",
        icon: "✨",
        title: "תכונות מתקדמות",
        features: [
          "מסלולי למידה אישיים",
          "מעקב התקדמות",
          "מערכת תגמולים",
          "ממשק משתמש אינטואיטיבי"
        ]
      }
    ]
  }
};

 