// uploadQuestions.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// הגדרות Firebase - מקובץ ה-config הקיים
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

// השאלות למבחן ההתאמה
const questions = [
  // סטטיסטיקה וממוצעים
  {
    question: "הציונים של דני בחמישה מבחנים הם: 70, 80, 90, 60, 75. מהו הממוצע?",
    correct_answer: "75",
    incorrect_answers: ["70", "80", "85"],
    subject: "סטטיסטיקה"
  },
  {
    question: "בכיתה יש 20 תלמידים. אם ממוצע הגובה שלהם הוא 160 ס״מ, מהו סכום הגבהים של כל התלמידים?",
    correct_answer: "3,200 ס״מ",
    incorrect_answers: ["160 ס״מ", "1,600 ס״מ", "320 ס״מ"],
    subject: "סטטיסטיקה"
  },
  {
    question: "נתונים המספרים: 2, 4, 6, 8, 10. אם נוסיף את המספר 12, בכמה יגדל הממוצע?",
    correct_answer: "1",
    incorrect_answers: ["2", "6", "12"],
    subject: "סטטיסטיקה"
  },
  {
    question: "ממוצע של 4 מספרים הוא 20. אם נוריד את אחד המספרים שערכו 40, מה יהיה הממוצע החדש?",
    correct_answer: "13.33",
    incorrect_answers: ["10", "15", "18"],
    subject: "סטטיסטיקה"
  },
  {
    question: "בטבלה מופיעים מספר הספרים שקראו 5 תלמידים: 3, 5, 2, 8, 7. מהו החציון?",
    correct_answer: "5",
    incorrect_answers: ["2", "3", "8"],
    subject: "סטטיסטיקה"
  },
  
  // הסתברות
  {
    question: "מטילים קובייה רגילה. מה ההסתברות לקבל מספר זוגי?",
    correct_answer: "1/2",
    incorrect_answers: ["1/6", "1/3", "2/3"],
    subject: "הסתברות"
  },
  {
    question: "בקופסה יש 3 כדורים אדומים ו-2 כחולים. מה ההסתברות להוציא כדור אדום?",
    correct_answer: "3/5",
    incorrect_answers: ["1/5", "2/5", "4/5"],
    subject: "הסתברות"
  },
  {
    question: "מטילים מטבע פעמיים. מה ההסתברות לקבל שני 'עץ'?",
    correct_answer: "1/4",
    incorrect_answers: ["1/2", "3/4", "1"],
    subject: "הסתברות"
  },
  {
    question: "בכיתה יש 12 בנים ו-18 בנות. אם בוחרים תלמיד באקראי, מה ההסתברות שזו בת?",
    correct_answer: "3/5",
    incorrect_answers: ["2/5", "1/2", "2/3"],
    subject: "הסתברות"
  },
  {
    question: "מה ההסתברות לקבל לפחות 5 בהטלת קובייה?",
    correct_answer: "1/3",
    incorrect_answers: ["1/6", "1/2", "2/3"],
    subject: "הסתברות"
  },
  
  // גיאומטריה
  {
    question: "רדיוס של מעגל הוא 7 ס״מ. מהו ההיקף? (π ≈ 3.14)",
    correct_answer: "44 ס״מ",
    incorrect_answers: ["14 ס״מ", "22 ס״מ", "154 ס״מ"],
    subject: "גיאומטריה"
  },
  {
    question: "שטח מעגל הוא 25π סמ״ר. מהו הרדיוס?",
    correct_answer: "5 ס״מ",
    incorrect_answers: ["10 ס״מ", "12.5 ס״מ", "25 ס״מ"],
    subject: "גיאומטריה"
  },
  {
    question: "במלבן, אורך צלע אחת 8 ס״מ והשנייה 6 ס״מ. מהו ההיקף?",
    correct_answer: "28 ס״מ",
    incorrect_answers: ["14 ס״מ", "48 ס״מ", "96 ס״מ"],
    subject: "גיאומטריה"
  },
  {
    question: "היקף מלבן הוא 20 ס״מ ואורך אחת הצלעות 6 ס״מ. מהו אורך הצלע השנייה?",
    correct_answer: "4 ס״מ",
    incorrect_answers: ["8 ס״מ", "10 ס״מ", "14 ס״מ"],
    subject: "גיאומטריה"
  },
  {
    question: "במשולש ישר זווית, הניצבים הם 3 ס״מ ו-4 ס״מ. מהו אורך היתר?",
    correct_answer: "5 ס״מ",
    incorrect_answers: ["7 ס״מ", "12 ס״מ", "25 ס״מ"],
    subject: "גיאומטריה"
  },
  
  // חישובים פיננסיים
  {
    question: "מחיר מוצר הוא 200 ₪. אם יש הנחה של 20%, מה המחיר החדש?",
    correct_answer: "160 ₪",
    incorrect_answers: ["40 ₪", "180 ₪", "220 ₪"],
    subject: "חישובים פיננסיים"
  },
  {
    question: "אם מחיר מוצר עלה מ-50 ₪ ל-60 ₪, בכמה אחוזים עלה המחיר?",
    correct_answer: "20%",
    incorrect_answers: ["10%", "16.67%", "60%"],
    subject: "חישובים פיננסיים"
  },
  {
    question: "חבילת סלולר עולה 100 ₪ לחודש וכוללת 500 דקות. אם חרגת ב-50 דקות ומחיר כל דקה נוספת הוא 0.5 ₪, כמה תשלם?",
    correct_answer: "125 ₪",
    incorrect_answers: ["100 ₪", "150 ₪", "175 ₪"],
    subject: "חישובים פיננסיים"
  },
  {
    question: "בגרף עמודות, עמודה אחת מייצגת 1,000 יחידות. אם יש 3.5 עמודות, כמה יחידות זה מייצג?",
    correct_answer: "3,500",
    incorrect_answers: ["350", "3,000", "35,000"],
    subject: "חישובים פיננסיים"
  },
  {
    question: "אם 30% מהתלמידים בכיתה הם בנים ויש 21 בנות, כמה תלמידים יש בכיתה?",
    correct_answer: "30",
    incorrect_answers: ["27", "35", "70"],
    subject: "חישובים פיננסיים"
  }
];

// פונקציה להעלאת השאלות
async function uploadQuestions() {
  try {
    console.log('מתחיל להעלות שאלות...');
    
    for (let i = 0; i < questions.length; i++) {
      const docRef = await addDoc(collection(db, 'all_questions1'), questions[i]);
      console.log(`שאלה ${i + 1} הועלתה בהצלחה עם ID: ${docRef.id}`);
    }
    
    console.log('כל השאלות הועלו בהצלחה! 🎉');
    console.log(`סה"כ הועלו ${questions.length} שאלות`);
  } catch (error) {
    console.error('שגיאה בהעלאת השאלות:', error);
  }
}

// הרצת הפונקציה
uploadQuestions(); 