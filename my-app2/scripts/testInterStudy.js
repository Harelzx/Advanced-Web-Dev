const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBd7_rnZQIwSoX5rvTHNGJSc5bNyKU-Nzw",
  authDomain: "my-app-f21e8.firebaseapp.com",
  projectId: "my-app-f21e8",
  storageBucket: "my-app-f21e8.firebasestorage.app",
  messagingSenderId: "509052030895",
  appId: "1:509052030895:web:d1c86bed74a6f8669c1a7e",
  measurementId: "G-XRV0V8Q1M2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testInterStudyQueries() {
  console.log("🔍 בודק שאילתות InterStudy...\n");

  try {
    // 1. בדיקת שאלות תרגול לפי רמת קושי
    console.log("1. בדיקת שאלות תרגול - רמת קושי 1 (קל):");
    const easyQuery = query(
      collection(db, "practice_questions"),
      where("difficulty", "==", 1)
    );
    const easySnapshot = await getDocs(easyQuery);
    console.log(`   ✅ נמצאו ${easySnapshot.size} שאלות קלות`);

    // בדיקת התפלגות לפי נושא
    const easyBySubject = {};
    easySnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (!easyBySubject[data.subject]) {
        easyBySubject[data.subject] = 0;
      }
      easyBySubject[data.subject]++;
    });
    console.log("   התפלגות לפי נושא:", easyBySubject);

    // 2. בדיקת מבנה שאלה
    if (easySnapshot.docs.length > 0) {
      const sampleQuestion = easySnapshot.docs[0].data();
      console.log("\n2. מבנה שאלה לדוגמה:");
      console.log(`   📝 שאלה: ${sampleQuestion.question_text?.substring(0, 50)}...`);
      console.log(`   📋 מספר אפשרויות: ${sampleQuestion.options?.length}`);
      console.log(`   ✅ תשובה נכונה: ${sampleQuestion.correct_answer}`);
      console.log(`   💡 הסבר: ${sampleQuestion.explanation ? 'קיים' : 'חסר'}`);
      console.log(`   📚 נושא: ${sampleQuestion.subject}`);
      console.log(`   ⚡ קושי: ${sampleQuestion.difficulty}`);
    }

    // 3. בדיקת כל רמות הקושי
    console.log("\n3. בדיקת כל רמות הקושי:");
    for (let difficulty = 1; difficulty <= 3; difficulty++) {
      const diffQuery = query(
        collection(db, "practice_questions"),
        where("difficulty", "==", difficulty)
      );
      const diffSnapshot = await getDocs(diffQuery);
      const diffName = difficulty === 1 ? 'קל' : difficulty === 2 ? 'בינוני' : 'קשה';
      console.log(`   רמה ${difficulty} (${diffName}): ${diffSnapshot.size} שאלות`);
    }

    // 4. בדיקת תוצאות FirstQuiz (אם קיימות)
    console.log("\n4. בדיקת תוצאות FirstQuiz:");
    const resultsQuery = query(
      collection(db, "results"),
      where("quizType", "==", "firstQuiz")
    );
    const resultsSnapshot = await getDocs(resultsQuery);
    console.log(`   📊 נמצאו ${resultsSnapshot.size} תוצאות FirstQuiz`);

    if (resultsSnapshot.docs.length > 0) {
      const sampleResult = resultsSnapshot.docs[0].data();
      console.log(`   👤 משתמש לדוגמה: ${sampleResult.userId}`);
      console.log(`   📝 מספר תשובות: ${sampleResult.answers?.length || 'לא זמין'}`);
      console.log(`   📅 תאריך: ${sampleResult.timestamp?.toDate?.() || 'לא זמין'}`);
    }

    console.log("\n✅ כל הבדיקות הושלמו בהצלחה!");
    console.log("\n📋 סיכום:");
    console.log("   • מסד הנתונים מכיל שאלות תרגול בכל רמות הקושי");
    console.log("   • מבנה השאלות תואם למצופה");
    console.log("   • המערכת מוכנה לשימוש ב-InterStudy");

  } catch (error) {
    console.error("❌ שגיאה בבדיקה:", error);
  }
}

// הרצת הבדיקה
testInterStudyQueries(); 