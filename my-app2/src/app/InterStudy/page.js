"use client"; // Ensures this component runs on the client side
import Study from "@/app/components/Study";

// Sample math questions based on Israeli Bagrut material
const mathQuestions = {
  easy: [
    {
      id: 1,
      question: "פתור את המשוואה: 2x + 5 = 13",
      options: ["x = 4", "x = 6", "x = 9", "x = 3"],
      correct: 0,
      explanation: "2x + 5 = 13\n2x = 13 - 5\n2x = 8\nx = 4",
      timeLimit: 30,
    },
    {
      id: 2,
      question: 'מהו שטח המשולש עם בסיס 8 ס"מ וגובה 6 ס"מ?',
      options: ['24 ס"מ²', '48 ס"מ²', '14 ס"מ²', '32 ס"מ²'],
      correct: 0,
      explanation:
        'שטח משולש = (בסיס × גובה) ÷ 2\nשטח = (8 × 6) ÷ 2 = 48 ÷ 2 = 24 ס"מ²',
      timeLimit: 45,
    },
    {
      id: 3,
      question: "חשב: 15% מ-200",
      options: ["30", "25", "35", "20"],
      correct: 0,
      explanation: "15% מ-200 = 0.15 × 200 = 30",
      timeLimit: 25,
    },
    {
      id: 4,
      question: "פתור: √64 =",
      options: ["8", "6", "10", "4"],
      correct: 0,
      explanation: "√64 = 8 כי 8² = 64",
      timeLimit: 20,
    },
    {
      id: 5,
      question: 'מהו היקף עיגול ברדיוס 7 ס"מ? (π ≈ 3.14)',
      options: ['43.96 ס"מ', '153.86 ס"מ', '21.98 ס"מ', '14 ס"מ'],
      correct: 0,
      explanation: 'היקף עיגול = 2πr = 2 × 3.14 × 7 = 43.96 ס"מ',
      timeLimit: 40,
    },
  ],
  moderate: [
    {
      id: 6,
      question: "פתור את מערכת המשוואות:\n2x + y = 7\nx - y = 2",
      options: [
        "x = 3, y = 1",
        "x = 2, y = 3",
        "x = 4, y = -1",
        "x = 1, y = 5",
      ],
      correct: 0,
      explanation:
        "מהמשוואה השנייה: y = x - 2\nהצבה במשוואה הראשונה:\n2x + (x - 2) = 7\n3x - 2 = 7\n3x = 9\nx = 3\ny = 3 - 2 = 1",
      timeLimit: 90,
    },
    {
      id: 7,
      question: "מצא את נקודות החיתוך של הפרבולה y = x² - 4x + 3 עם ציר ה-x",
      options: [
        "x = 1, x = 3",
        "x = -1, x = -3",
        "x = 2, x = 4",
        "x = 0, x = 3",
      ],
      correct: 0,
      explanation:
        "נקודות חיתוך עם ציר x: y = 0\nx² - 4x + 3 = 0\n(x - 1)(x - 3) = 0\nx = 1 או x = 3",
      timeLimit: 120,
    },
    {
      id: 8,
      question: "חשב את הגבול: lim(x→2) (x² - 4)/(x - 2)",
      options: ["4", "2", "0", "לא קיים"],
      correct: 0,
      explanation:
        "פירוק: (x² - 4)/(x - 2) = (x + 2)(x - 2)/(x - 2) = x + 2\nכאשר x → 2: x + 2 → 4",
      timeLimit: 100,
    },
    {
      id: 9,
      question: "מצא את הנגזרת של הפונקציה f(x) = 3x³ - 2x² + x - 5",
      options: [
        "f'(x) = 9x² - 4x + 1",
        "f'(x) = 3x² - 2x + 1",
        "f'(x) = 9x² - 4x",
        "f'(x) = x³ - x²",
      ],
      correct: 0,
      explanation:
        "נגזרת של ax^n היא n·ax^(n-1)\nf'(x) = 3·3x² - 2·2x + 1 = 9x² - 4x + 1",
      timeLimit: 80,
    },
    {
      id: 10,
      question: "במשולש ישר זווית, אם זווית אחת היא 30°, ומהו יחס הצלעות?",
      options: ["1:√3:2", "1:2:√3", "√3:1:2", "2:1:√3"],
      correct: 0,
      explanation:
        "במשולש 30-60-90, יחס הצלעות הוא:\nמול 30°: מול 60°: מול 90° = 1:√3:2",
      timeLimit: 75,
    },
  ],
  hard: [
    {
      id: 11,
      question:
        "נתונה הפונקציה f(x) = ln(x² + 1). חשב את האינטגרל ∫₀¹ f(x)dx באמצעות אינטגרציה בחלקים",
      options: [
        "ln(2) - 1 + π/4",
        "2ln(2) - 1",
        "ln(2) + π/4 - 1",
        "ln(2) - π/4",
      ],
      correct: 0,
      explanation:
        "זהו אינטגרל מורכב הדורש שימוש באינטגרציה בחלקים ובהצבות טריגונומטריות.\nהפתרון המלא כולל מספר שלבים של הצבה ופירוק.",
      timeLimit: null,
    },
    {
      id: 12,
      question: "פתור את המשוואה הדיפרנציאלית: dy/dx - 2y = e^(3x)",
      options: [
        "y = Ce^(2x) + e^(3x)",
        "y = Ce^(2x) - e^(3x)",
        "y = Ce^(2x) + (1/3)e^(3x)",
        "y = Ce^(-2x) + e^(3x)",
      ],
      correct: 0,
      explanation:
        "זוהי משוואה דיפרנציאלית ליניארית מסדר ראשון.\nהפתרון הכללי: y = Ce^(2x) + פתרון פרטי\nעבור הפתרון הפרטי נציב y = Ae^(3x) ונקבל A = 1",
      timeLimit: null,
    },
    {
      id: 13,
      question:
        "מצא את המקסימום והמינימום של הפונקציה f(x,y) = x² + y² - 2x - 4y + 5 בתחום המוגבל על ידי x² + y² ≤ 9",
      options: [
        "מקס: 14, מין: 0",
        "מקס: 18, מין: 2",
        "מקס: 12, מין: 1",
        "מקס: 15, מין: 0",
      ],
      correct: 0,
      explanation:
        "זוהי בעיית אופטימיזציה עם אילוץ.\nצריך למצוא נקודות קריטיות בפנים התחום ועל הגבול באמצעות כופלי לגראנז'.",
      timeLimit: null,
    },
    {
      id: 14,
      question: "הוכח כי הטור ∑(n=1 to ∞) 1/(n²+1) מתכנס ומצא את גבולו",
      options: [
        "מתכנס ל-π/2 - 1",
        "מתכנס ל-π²/6 - 1",
        "מתכנס ל-1",
        "מתכנס ל-π/4",
      ],
      correct: 0,
      explanation:
        "משווים לטור p עם p=2 ומשתמשים במבחן ההשוואה.\nהטור מתכנס אך חישוב הסכום המדויק דורש שיטות מתקדמות.",
      timeLimit: null,
    },
    {
      id: 15,
      question:
        "במרחב התלת-ממדי, מצא את המרחק בין הישר L: (x-1)/2 = (y+1)/(-1) = z/3 למישור P: 2x - y + z = 5",
      options: [
        "המרחק הוא 2/√6",
        "המרחק הוא √6/3",
        "הישר חותך את המישור",
        "המרחק הוא 1/√6",
      ],
      correct: 2,
      explanation:
        "צריך לבדוק אם הישר מקביל למישור או חותך אותו.\nוקטור כיוון הישר: (2,-1,3)\nוקטור נורמל למישור: (2,-1,1)\nמכפלה סקלרית ≠ 0, לכן הישר חותך את המישור.",
      timeLimit: null,
    },
  ],
};

export default function InterStudy() {
  return (
    <Study
      questions={mathQuestions}
      title="חידון מתמטיקה"
      icon="🧮"
      onHome={() => (window.location.href = "/")}
    />
  );
}
