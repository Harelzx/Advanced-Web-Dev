// uploadPracticeQuestions.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// הגדרות Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBKqM0lNqBRjgNwiNKBO3tmwStl1HQO_Is",
  authDomain: "web2025-592b4.firebaseapp.com",
  databaseURL: "https://web2025-592b4-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "web2025-592b4",
  storageBucket: "web2025-592b4.firebasestorage.app",
  messagingSenderId: "635879071437",
  appId: "1:635879071437:web:cd939e0a7198125e3fd384",
  measurementId: "G-04BZQ896E0",
};

// אתחול Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// שאלות התרגול - רמת קושי 3 (קשות)
const practiceQuestions = [
  // סטטיסטיקה - שאלות קשות (8 שאלות)
  {
    subject: "סטטיסטיקה",
    difficulty: 3,
    question: "בסדרת נתונים הממוצע הוא 65 וסטיית התקן 12. לאחר הוספת הציון x, הממוצע עלה ל-67 וסטיית התקן ירדה ל-10. כמה נתונים היו בסדרה המקורית?",
    correct_answer: "9",
    incorrect_answers: ["8", "10", "11"],
    topic: "ממוצע וסטיית תקן"
  },
  {
    subject: "סטטיסטיקה",
    difficulty: 3,
    question: "ממוצע הגבהים בכיתה הוא 165 ס״מ. אם נוריד את 5 התלמידים הגבוהים ביותר, הממוצע יורד ל-160 ס״מ. אם נוריד את 5 הנמוכים ביותר, הממוצע עולה ל-170 ס״מ. כמה תלמידים בכיתה?",
    correct_answer: "25",
    incorrect_answers: ["20", "30", "35"],
    topic: "ממוצעים חלקיים"
  },
  {
    subject: "סטטיסטיקה",
    difficulty: 3,
    question: "בהתפלגות נורמלית עם ממוצע 100 וסטיית תקן 15, מהו האחוזון של הציון 130?",
    correct_answer: "97.7%",
    incorrect_answers: ["95%", "84%", "99%"],
    topic: "התפלגות נורמלית"
  },
  {
    subject: "סטטיסטיקה",
    difficulty: 3,
    question: "בסדרה של n מספרים, הממוצע הוא m והשונות היא s². אם כופלים כל איבר ב-a ומוסיפים b, מהי השונות החדשה?",
    correct_answer: "a²s²",
    incorrect_answers: ["as²", "a²s²+b", "s²+ab"],
    topic: "טרנספורמציות של שונות"
  },
  {
    subject: "סטטיסטיקה",
    difficulty: 3,
    question: "מקדם המתאם בין גובה ומשקל הוא 0.8. אם סטיית התקן של הגובה היא 10 ושל המשקל היא 15, מהו שיפוע קו הרגרסיה של משקל על גובה?",
    correct_answer: "1.2",
    incorrect_answers: ["0.8", "1.5", "0.53"],
    topic: "רגרסיה ומתאם"
  },
  {
    subject: "סטטיסטיקה",
    difficulty: 3,
    question: "בסדרה: x, x+2, x+4, ..., x+20 (11 איברים), החציון הוא 25. מהו הממוצע?",
    correct_answer: "25",
    incorrect_answers: ["20", "30", "27.5"],
    topic: "סדרות חשבוניות וסטטיסטיקה"
  },
  {
    subject: "סטטיסטיקה",
    difficulty: 3,
    question: "20% מהתלמידים קיבלו ציון מעל 90. הציון הממוצע של קבוצה זו הוא 94. הציון הממוצע של השאר הוא 72. מהו הממוצע הכללי?",
    correct_answer: "76.4",
    incorrect_answers: ["83", "78", "80.5"],
    topic: "ממוצע משוקלל מורכב"
  },
  {
    subject: "סטטיסטיקה",
    difficulty: 3,
    question: "בבחינה עם 50 שאלות, ההסתברות לענות נכון על שאלה היא 0.7. מהו הסיכוי לקבל ציון של לפחות 80 (40 תשובות נכונות)?",
    correct_answer: "0.048",
    incorrect_answers: ["0.12", "0.24", "0.008"],
    topic: "התפלגות בינומית"
  },

  // הסתברות - שאלות קשות (8 שאלות)
  {
    subject: "הסתברות",
    difficulty: 3,
    question: "בקופסה 10 כדורים: 4 אדומים, 3 כחולים, 3 ירוקים. מוציאים 3 כדורים ללא החזרה. מה ההסתברות שיהיו משלושת הצבעים?",
    correct_answer: "3/10",
    incorrect_answers: ["1/10", "1/5", "2/5"],
    topic: "הסתברות קומבינטורית"
  },
  {
    subject: "הסתברות",
    difficulty: 3,
    question: "שלושה קלעים יורים למטרה. ההסתברויות לפגוע הן: 0.7, 0.8, 0.9. מה ההסתברות שבדיוק שניים יפגעו?",
    correct_answer: "0.398",
    incorrect_answers: ["0.504", "0.126", "0.252"],
    topic: "הסתברות מורכבת"
  },
  {
    subject: "הסתברות",
    difficulty: 3,
    question: "במשחק יש להטיל קובייה עד שמקבלים 6. מה ההסתברות שיידרשו בדיוק 4 הטלות?",
    correct_answer: "125/1296",
    incorrect_answers: ["1/6", "625/1296", "5/1296"],
    topic: "התפלגות גיאומטרית"
  },
  {
    subject: "הסתברות",
    difficulty: 3,
    question: "במפעל, 3% מהמוצרים פגומים. בבדיקה מדגמית של 100 מוצרים, מה ההסתברות למצוא לכל היותר 2 פגומים?",
    correct_answer: "0.42",
    incorrect_answers: ["0.58", "0.27", "0.73"],
    topic: "התפלגות פואסון"
  },
  {
    subject: "הסתברות",
    difficulty: 3,
    question: "כד A מכיל 3 אדומים ו-2 לבנים. כד B מכיל 2 אדומים ו-3 לבנים. בוחרים כד באקראי ומוציאים כדור. אם הוא אדום, מה ההסתברות שהגיע מכד A?",
    correct_answer: "3/5",
    incorrect_answers: ["1/2", "3/7", "2/5"],
    topic: "משפט בייס"
  },
  {
    subject: "הסתברות",
    difficulty: 3,
    question: "מטילים 3 קוביות. מה ההסתברות שסכום התוצאות יהיה 10?",
    correct_answer: "1/8",
    incorrect_answers: ["1/6", "27/216", "25/216"],
    topic: "הסתברות בשלוש קוביות"
  },
  {
    subject: "הסתברות",
    difficulty: 3,
    question: "5 אנשים נכנסים למעלית בבניין של 10 קומות. מה ההסתברות שכולם ירדו בקומות שונות?",
    correct_answer: "0.3024",
    incorrect_answers: ["0.5", "0.1", "0.05"],
    topic: "בעיית ימי הולדת"
  },
  {
    subject: "הסתברות",
    difficulty: 3,
    question: "בקלפים, מחלקים 13 קלפים. מה ההסתברות לקבל בדיוק 5 קלפים אדומים?",
    correct_answer: "0.1222",
    incorrect_answers: ["0.0444", "0.2444", "0.5"],
    topic: "התפלגות היפרגיאומטרית"
  },

  // גיאומטריה - שאלות קשות (8 שאלות)
  {
    subject: "גיאומטריה",
    difficulty: 3,
    question: "במשולש ABC, AD הוא תיכון לצלע BC. אם AB=13, AC=15, BC=14, מהו אורך התיכון AD?",
    correct_answer: "12",
    incorrect_answers: ["10", "11", "13"],
    topic: "תיכונים במשולש"
  },
  {
    subject: "גיאומטריה",
    difficulty: 3,
    question: "מעגל שמרכזו בנקודה (2,3) משיק לישר 3x+4y-26=0. מהו רדיוס המעגל?",
    correct_answer: "2",
    incorrect_answers: ["3", "4", "5"],
    topic: "מעגל וישר משיק"
  },
  {
    subject: "גיאומטריה",
    difficulty: 3,
    question: "בפירמידה ישרה שבסיסה ריבוע בעל צלע 6 ס״מ, המקצוע הצדדי יוצר זווית של 60° עם הבסיס. מהו נפח הפירמידה?",
    correct_answer: "36√3",
    incorrect_answers: ["72", "36", "18√3"],
    topic: "גופים במרחב"
  },
  {
    subject: "גיאומטריה",
    difficulty: 3,
    question: "במעגל שרדיוסו R, חסום משושה משוכלל. מהו היחס בין שטח המשושה לשטח המעגל?",
    correct_answer: "3√3/(2π)",
    incorrect_answers: ["√3/π", "3/π", "2√3/π"],
    topic: "מצולעים חסומים"
  },
  {
    subject: "גיאומטריה",
    difficulty: 3,
    question: "נקודה P נמצאת על האליפסה x²/16 + y²/9 = 1. מהו המרחק המקסימלי של P מהנקודה (0,0)?",
    correct_answer: "4",
    incorrect_answers: ["3", "5", "√7"],
    topic: "חתכי חרוט"
  },
  {
    subject: "גיאומטריה",
    difficulty: 3,
    question: "בטרפז ABCD (AB||CD), האלכסונים נפגשים בנקודה E. אם AB=12, CD=8, מהו היחס AE:EC?",
    correct_answer: "3:2",
    incorrect_answers: ["2:3", "4:3", "5:4"],
    topic: "דמיון משולשים"
  },
  {
    subject: "גיאומטריה",
    difficulty: 3,
    question: "במשולש חד זווית ABC, הגבהים נפגשים בנקודה H. אם זווית BAC=60°, מהי זווית BHC?",
    correct_answer: "120°",
    incorrect_answers: ["60°", "90°", "150°"],
    topic: "נקודות מיוחדות במשולש"
  },
  {
    subject: "גיאומטריה",
    difficulty: 3,
    question: "גליל שרדיוס בסיסו 3 ס״מ חסום בכדור שרדיוסו 5 ס״מ. מהו גובה הגליל?",
    correct_answer: "8 ס״מ",
    incorrect_answers: ["6 ס״מ", "10 ס״מ", "4 ס״מ"],
    topic: "גופים חסומים"
  },

  // חישובים פיננסיים - שאלות קשות (8 שאלות)
  {
    subject: "חישובים פיננסיים",
    difficulty: 3,
    question: "הלוואה של 100,000 ₪ בריבית משתנה: 3% בשנתיים הראשונות, 4% בשנתיים הבאות, 5% בשנה החמישית. מהו הסכום לתשלום אחרי 5 שנים?",
    correct_answer: "119,684 ₪",
    incorrect_answers: ["120,000 ₪", "118,500 ₪", "121,000 ₪"],
    topic: "ריבית משתנה"
  },
  {
    subject: "חישובים פיננסיים",
    difficulty: 3,
    question: "השקעה חודשית של 1,000 ₪ בתשואה שנתית של 6%. אחרי כמה שנים יגיע הסכום הצבור ל-500,000 ₪?",
    correct_answer: "23.8 שנים",
    incorrect_answers: ["20 שנים", "25 שנים", "30 שנים"],
    topic: "חישובי השקעה"
  },
  {
    subject: "חישובים פיננסיים",
    difficulty: 3,
    question: "חברה קנתה ציוד ב-200,000 ₪. הפחת השנתי הוא 20% משווי הנכס בתחילת השנה. מהו השווי אחרי 4 שנים?",
    correct_answer: "81,920 ₪",
    incorrect_answers: ["80,000 ₪", "64,000 ₪", "90,000 ₪"],
    topic: "פחת מואץ"
  },
  {
    subject: "חישובים פיננסיים",
    difficulty: 3,
    question: "משקיע קנה מניה ב-100 ₪. אחרי שנה קיבל דיבידנד של 5 ₪ ומכר ב-112 ₪. מהי התשואה הכוללת?",
    correct_answer: "17%",
    incorrect_answers: ["12%", "5%", "15%"],
    topic: "תשואה על השקעה"
  },
  {
    subject: "חישובים פיננסיים",
    difficulty: 3,
    question: "הלוואה של 300,000 ₪ ל-15 שנה בריבית 4.5% עם החזר חודשי. כמה ריבית ישולם בסך הכל?",
    correct_answer: "113,685 ₪",
    incorrect_answers: ["135,000 ₪", "90,000 ₪", "150,000 ₪"],
    topic: "חישובי משכנתא"
  },
  {
    subject: "חישובים פיננסיים",
    difficulty: 3,
    question: "קרן השתלמות: הפקדה שנתית 10,000 ₪, תשואה 7% בשנה. מס רווחי הון 25% על הרווחים. מהו הסכום נטו אחרי 6 שנים?",
    correct_answer: "67,800 ₪",
    incorrect_answers: ["71,500 ₪", "60,000 ₪", "65,000 ₪"],
    topic: "חישובי מס"
  },
  {
    subject: "חישובים פיננסיים",
    difficulty: 3,
    question: "שער החליפין: 1$=3.5₪. הדולר התחזק ב-5% והאינפלציה בישראל היתה 3%. מהו השינוי הריאלי בכוח הקנייה של הדולר?",
    correct_answer: "1.94%",
    incorrect_answers: ["2%", "5%", "8%"],
    topic: "שערי חליפין ואינפלציה"
  },
  {
    subject: "חישובים פיננסיים",
    difficulty: 3,
    question: "חברה מציעה אג״ח ל-5 שנים: ערך נקוב 1,000 ₪, ריבית 6% בשנה. אם תשואת השוק 8%, מהו מחיר האג״ח?",
    correct_answer: "920 ₪",
    incorrect_answers: ["1,000 ₪", "880 ₪", "960 ₪"],
    topic: "הערכת אגרות חוב"
  }
];

// פונקציה להעלאת השאלות
async function uploadPracticeQuestions() {
  try {
    console.log('מתחיל להעלות שאלות תרגול...');
    
    for (let i = 0; i < practiceQuestions.length; i++) {
      const docRef = await addDoc(collection(db, 'practice_questions'), practiceQuestions[i]);
      console.log(`שאלה ${i + 1} הועלתה בהצלחה עם ID: ${docRef.id}`);
    }
    
    console.log('כל שאלות התרגול הועלו בהצלחה! 🎉');
    console.log(`סה"כ הועלו ${practiceQuestions.length} שאלות`);
  } catch (error) {
    console.error('שגיאה בהעלאת שאלות התרגול:', error);
  }
}

// הרצת הפונקציה
uploadPracticeQuestions(); 