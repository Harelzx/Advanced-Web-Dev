import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBKqM0lNqBRjgNwiNKBO3tmwStl1HQO_Is",
  authDomain: "web2025-592b4.firebaseapp.com",
  databaseURL:
    "https://web2025-592b4-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "web2025-592b4",
  storageBucket: "web2025-592b4.firebasestorage.app",
  messagingSenderId: "635879071437",
  appId: "1:635879071437:web:cd939e0a7198125e3fd384",
  measurementId: "G-04BZQ896E0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const easyQuestions = [
  // Algebra Questions (5)
  {
    id: "algebra_1",
    subject: "algebra",
    level: "easy",
    text: "פתור את המשוואה: 2x + 5 = 13",
    correct_answer: "x = 4",
    incorrect_answers: ["x = 3", "x = 5", "x = 6"],
    explanation: "נחסר 5 משני האגפים: 2x = 8, נחלק ב-2: x = 4",
    timeLimit: 30,
  },
  {
    id: "algebra_2",
    subject: "algebra",
    level: "easy",
    text: "מצא את x: 3(x - 2) = 15",
    correct_answer: "x = 7",
    incorrect_answers: ["x = 5", "x = 6", "x = 8"],
    explanation:
      "נפתח סוגריים: 3x - 6 = 15, נוסיף 6 לשני האגפים: 3x = 21, נחלק ב-3: x = 7",
    timeLimit: 30,
  },
  {
    id: "algebra_3",
    subject: "algebra",
    level: "easy",
    text: "פתור: -2x = 8",
    correct_answer: "x = -4",
    incorrect_answers: ["x = 4", "x = -8", "x = 8"],
    explanation: "נחלק את שני האגפים ב-(-2): x = -4",
    timeLimit: 30,
  },
  {
    id: "algebra_4",
    subject: "algebra",
    level: "easy",
    text: "מצא את x: x/3 = 4",
    correct_answer: "x = 12",
    incorrect_answers: ["x = 7", "x = 9", "x = 15"],
    explanation: "נכפול את שני האגפים ב-3: x = 12",
    timeLimit: 30,
  },
  {
    id: "algebra_5",
    subject: "algebra",
    level: "easy",
    text: "פתור את המשוואה: 5x - 10 = 15",
    correct_answer: "x = 5",
    incorrect_answers: ["x = 3", "x = 4", "x = 6"],
    explanation: "נוסיף 10 לשני האגפים: 5x = 25, נחלק ב-5: x = 5",
    timeLimit: 30,
  },

  // Geometry Questions (5)
  {
    id: "geometry_1",
    subject: "geometry",
    level: "easy",
    text: 'מה שטח המלבן שאורכו 5 ס"מ ורוחבו 3 ס"מ?',
    correct_answer: '15 סמ"ר',
    incorrect_answers: ['8 סמ"ר', '12 סמ"ר', '16 סמ"ר'],
    explanation: 'שטח מלבן = אורך × רוחב = 5 × 3 = 15 סמ"ר',
    timeLimit: 30,
  },
  {
    id: "geometry_2",
    subject: "geometry",
    level: "easy",
    text: 'מה היקף ריבוע שאורך צלעו 4 ס"מ?',
    correct_answer: '16 ס"מ',
    incorrect_answers: ['8 ס"מ', '12 ס"מ', '20 ס"מ'],
    explanation: 'היקף ריבוע = 4 × צלע = 4 × 4 = 16 ס"מ',
    timeLimit: 30,
  },
  {
    id: "geometry_3",
    subject: "geometry",
    level: "easy",
    text: 'מה שטח משולש שבסיסו 6 ס"מ וגובהו 4 ס"מ?',
    correct_answer: '12 סמ"ר',
    incorrect_answers: ['10 סמ"ר', '14 סמ"ר', '16 סמ"ר'],
    explanation: 'שטח משולש = (בסיס × גובה) ÷ 2 = (6 × 4) ÷ 2 = 12 סמ"ר',
    timeLimit: 30,
  },
  {
    id: "geometry_4",
    subject: "geometry",
    level: "easy",
    text: "במשולש ישר זווית, אחת הזוויות היא 30°. מה הזווית השנייה?",
    correct_answer: "60°",
    incorrect_answers: ["45°", "50°", "70°"],
    explanation:
      "סכום זוויות במשולש הוא 180°. במשולש ישר זווית יש זווית של 90°. לכן: 180° - 90° - 30° = 60°",
    timeLimit: 30,
  },
  {
    id: "geometry_5",
    subject: "geometry",
    level: "easy",
    text: 'מה היקף משולש שווה צלעות שאורך צלעו 5 ס"מ?',
    correct_answer: '15 ס"מ',
    incorrect_answers: ['10 ס"מ', '12 ס"מ', '20 ס"מ'],
    explanation: 'היקף משולש שווה צלעות = 3 × צלע = 3 × 5 = 15 ס"מ',
    timeLimit: 30,
  },

  // Trigonometry Questions (5)
  {
    id: "trigonometry_1",
    subject: "trigonometry",
    level: "easy",
    text: "במשולש ישר זווית, sin 30° שווה ל:",
    correct_answer: "0.5",
    incorrect_answers: ["1", "0.866", "0.707"],
    explanation: "sin 30° = 1/2 = 0.5 הוא ערך בסיסי שכדאי לזכור",
    timeLimit: 30,
  },
  {
    id: "trigonometry_2",
    subject: "trigonometry",
    level: "easy",
    text: "במשולש ישר זווית, cos 60° שווה ל:",
    correct_answer: "0.5",
    incorrect_answers: ["0.866", "1", "0.707"],
    explanation: "cos 60° = 1/2 = 0.5 הוא ערך בסיסי שכדאי לזכור",
    timeLimit: 30,
  },
  {
    id: "trigonometry_3",
    subject: "trigonometry",
    level: "easy",
    text: "במשולש ישר זווית, tan 45° שווה ל:",
    correct_answer: "1",
    incorrect_answers: ["0.5", "0.866", "2"],
    explanation:
      "tan 45° = 1 כי במשולש ישר זווית עם זווית של 45°, שני הניצבים שווים",
    timeLimit: 30,
  },
  {
    id: "trigonometry_4",
    subject: "trigonometry",
    level: "easy",
    text: "במשולש ישר זווית, sin 90° שווה ל:",
    correct_answer: "1",
    incorrect_answers: ["0", "0.5", "0.866"],
    explanation: "sin 90° = 1 הוא ערך בסיסי שכדאי לזכור",
    timeLimit: 30,
  },
  {
    id: "trigonometry_5",
    subject: "trigonometry",
    level: "easy",
    text: "במשולש ישר זווית, cos 0° שווה ל:",
    correct_answer: "1",
    incorrect_answers: ["0", "0.5", "0.866"],
    explanation: "cos 0° = 1 הוא ערך בסיסי שכדאי לזכור",
    timeLimit: 30,
  },

  // Statistics Questions (5)
  {
    id: "statistics_1",
    subject: "statistics",
    level: "easy",
    text: "מהו החציון של הסדרה: 2, 4, 6, 8, 10?",
    correct_answer: "6",
    incorrect_answers: ["5", "7", "8"],
    explanation:
      "בסדרה עם מספר אי-זוגי של איברים, החציון הוא האיבר האמצעי. במקרה זה - 6",
    timeLimit: 30,
  },
  {
    id: "statistics_2",
    subject: "statistics",
    level: "easy",
    text: "מהו הממוצע של המספרים: 2, 4, 6, 8?",
    correct_answer: "5",
    incorrect_answers: ["4", "6", "7"],
    explanation: "ממוצע = סכום האיברים חלקי מספרם = (2+4+6+8)/4 = 20/4 = 5",
    timeLimit: 30,
  },
  {
    id: "statistics_3",
    subject: "statistics",
    level: "easy",
    text: "מהי השכיחות של המספר 3 בסדרה: 1, 3, 3, 5, 3, 7?",
    correct_answer: "3",
    incorrect_answers: ["2", "4", "5"],
    explanation: "המספר 3 מופיע בסדרה 3 פעמים",
    timeLimit: 30,
  },
  {
    id: "statistics_4",
    subject: "statistics",
    level: "easy",
    text: "מהו הטווח של הסדרה: 2, 5, 8, 11, 14?",
    correct_answer: "12",
    incorrect_answers: ["10", "11", "13"],
    explanation: "טווח = ערך מקסימלי פחות ערך מינימלי = 14 - 2 = 12",
    timeLimit: 30,
  },
  {
    id: "statistics_5",
    subject: "statistics",
    level: "easy",
    text: "מהו השכיח בסדרה: 1, 2, 2, 3, 2, 4, 5?",
    correct_answer: "2",
    incorrect_answers: ["1", "3", "4"],
    explanation: "המספר 2 מופיע הכי הרבה פעמים (3 פעמים)",
    timeLimit: 30,
  },

  // Calculus Questions (5)
  {
    id: "calculus_1",
    subject: "calculus",
    level: "easy",
    text: "מה הנגזרת של x²?",
    correct_answer: "2x",
    incorrect_answers: ["x", "x³", "2"],
    explanation:
      "נגזרת של x בחזקת n היא n כפול x בחזקת (n-1). במקרה זה n=2, לכן התוצאה היא 2x",
    timeLimit: 30,
  },
  {
    id: "calculus_2",
    subject: "calculus",
    level: "easy",
    text: "מה הנגזרת של 3x?",
    correct_answer: "3",
    incorrect_answers: ["x", "3x", "0"],
    explanation: "נגזרת של פונקציה לינארית mx היא m. במקרה זה m=3",
    timeLimit: 30,
  },
  {
    id: "calculus_3",
    subject: "calculus",
    level: "easy",
    text: "מה הנגזרת של קבוע (למשל 5)?",
    correct_answer: "0",
    incorrect_answers: ["1", "5", "∞"],
    explanation: "נגזרת של קבוע היא תמיד 0",
    timeLimit: 30,
  },
  {
    id: "calculus_4",
    subject: "calculus",
    level: "easy",
    text: "מה הנגזרת של x³?",
    correct_answer: "3x²",
    incorrect_answers: ["x²", "2x³", "3x"],
    explanation:
      "נגזרת של x בחזקת n היא n כפול x בחזקת (n-1). במקרה זה n=3, לכן התוצאה היא 3x²",
    timeLimit: 30,
  },
  {
    id: "calculus_5",
    subject: "calculus",
    level: "easy",
    text: "מה הנגזרת של 2x + 3?",
    correct_answer: "2",
    incorrect_answers: ["3", "5", "2x"],
    explanation: "נגזרת של פונקציה לינארית mx + b היא m. במקרה זה m=2",
    timeLimit: 30,
  },
];

// Function to upload questions to Firebase
async function uploadQuestions() {
  try {
    console.log("Starting to upload questions...");
    const questionsRef = collection(db, "questions");

    for (const question of easyQuestions) {
      try {
        const docRef = await addDoc(questionsRef, question);
        console.log(
          `Successfully added question ${question.id} with document ID: ${docRef.id}`
        );
      } catch (error) {
        console.error(`Error adding question ${question.id}:`, error);
      }
    }

    console.log("Finished uploading questions");
  } catch (error) {
    console.error("Error in uploadQuestions:", error);
  }
}

// Run the upload function
uploadQuestions();
