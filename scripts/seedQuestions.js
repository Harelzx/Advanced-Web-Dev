import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Updated subject mapping to match your folder structure
const subjectMapping = {
  algebra: "algebra",
  calculus: "calculus",
  geometry: "geometry",
  statistics: "prob&stat",
  trigonometry: "trig",
};

const sampleQuestions = {
  easy: [
    {
      subject: "algebra",
      text: "פתור את המשוואה: 2x + 5 = 13",
      options: ["x = 4", "x = 5", "x = 3", "x = 6"],
      correctAnswer: "x = 4",
      level: "easy",
    },
    {
      subject: "geometry",
      text: "מה שטח המשולש שאורכי צלעותיו 3, 4, 5?",
      options: [
        "6 יחידות שטח",
        "10 יחידות שטח",
        "12 יחידות שטח",
        "15 יחידות שטח",
      ],
      correctAnswer: "6 יחידות שטח",
      level: "easy",
    },
    {
      subject: "trigonometry",
      text: "מה ערך הסינוס של 30 מעלות?",
      options: ["0.5", "0.866", "1", "0"],
      correctAnswer: "0.5",
      level: "easy",
    },
    {
      subject: "calculus",
      text: "מה הנגזרת של x²?",
      options: ["2x", "x", "2", "x²"],
      correctAnswer: "2x",
      level: "easy",
    },
    {
      subject: "statistics",
      text: "מהו החציון של המספרים: 1, 3, 3, 6, 7?",
      options: ["3", "4", "5", "6"],
      correctAnswer: "3",
      level: "easy",
    },
  ],
  medium: [
    {
      subject: "algebra",
      text: "פתור את המשוואה: x² - 5x + 6 = 0",
      options: [
        "x = 2, x = 3",
        "x = 1, x = 4",
        "x = -2, x = 3",
        "x = 2, x = 4",
      ],
      correctAnswer: "x = 2, x = 3",
      level: "medium",
    },
    {
      subject: "geometry",
      text: 'במעגל שרדיוסו 5 ס"מ, מה אורך המיתר שמרחקו מהמרכז 3 ס"מ?',
      options: ['6 ס"מ', '8 ס"מ', '7 ס"מ', '8 ס"מ'],
      correctAnswer: '8 ס"מ',
      level: "medium",
    },
    {
      subject: "trigonometry",
      text: "במשולש ישר זווית, אם sin(α) = 0.6, מה ערך cos(α)?",
      options: ["0.6", "0.8", "0.5", "0.4"],
      correctAnswer: "0.8",
      level: "medium",
    },
    {
      subject: "calculus",
      text: "מצא את האינטגרל של 2x + 3",
      options: ["x² + 3x", "x² + 3x + C", "2x² + 3x", "x² + 3x - 2"],
      correctAnswer: "x² + 3x + C",
      level: "medium",
    },
    {
      subject: "statistics",
      text: "בקבוצת נתונים, הממוצע הוא 70 וסטיית התקן היא 10. מה ערך ה-z של תצפית שערכה 85?",
      options: ["1.5", "2.0", "1.0", "2.5"],
      correctAnswer: "1.5",
      level: "medium",
    },
  ],
  hard: [
    {
      subject: "algebra",
      imageRef: `${subjectMapping.algebra}/algebra_801_s25_q1.png`,
      options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
      correctAnswer: "תשובה ב",
      level: "hard",
    },
    {
      subject: "algebra",
      imageRef: `${subjectMapping.algebra}/algebra_801_s25_q2.png`,
      options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
      correctAnswer: "תשובה ב",
      level: "hard",
    },
    {
      subject: "algebra",
      imageRef: `${subjectMapping.algebra}/algebra_801_s25_q3.png`,
      options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
      correctAnswer: "תשובה ב",
      level: "hard",
    },
    {
      subject: "algebra",
      imageRef: `${subjectMapping.algebra}/algebra_802_s25_q1.png`,
      options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
      correctAnswer: "תשובה ב",
      level: "hard",
    },
    {
      subject: "algebra",
      imageRef: `${subjectMapping.algebra}/algebra_802_s25_q2.png`,
      options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
      correctAnswer: "תשובה ב",
      level: "hard",
    },
    {
      subject: "geometry",
      imageRef: `${subjectMapping.geometry}/geometry_801_s25_q1.png`,
      options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
      correctAnswer: "תשובה א",
      level: "hard",
    },
    {
      subject: "geometry",
      imageRef: `${subjectMapping.geometry}/geometry_801_w25_q1.png`,
      options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
      correctAnswer: "תשובה א",
      level: "hard",
    },
    {
      subject: "geometry",
      imageRef: `${subjectMapping.geometry}/geometry_802_w25_q1.png`,
      options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
      correctAnswer: "תשובה א",
      level: "hard",
    },
    {
      subject: "geometry",
      imageRef: `${subjectMapping.geometry}/geometry_802_w25_q2.png`,
      options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
      correctAnswer: "תשובה א",
      level: "hard",
    },
    {
      subject: "geometry",
      imageRef: `${subjectMapping.geometry}/geometry_803_s25_q1.png`,
      options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
      correctAnswer: "תשובה א",
      level: "hard",
    },
    {
      subject: "trigonometry",
      imageRef: `${subjectMapping.trigonometry}/trig_801_s24_q1.png`,
      options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
      correctAnswer: "תשובה ג",
      level: "hard",
    },
    {
      subject: "trigonometry",
      imageRef: `${subjectMapping.trigonometry}/trig_801_s25_q1.png`,
      options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
      correctAnswer: "תשובה ג",
      level: "hard",
    },
    {
      subject: "trigonometry",
      imageRef: `${subjectMapping.trigonometry}/trig_801_w25_q1.png`,
      options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
      correctAnswer: "תשובה ג",
      level: "hard",
    },
    {
      subject: "trigonometry",
      imageRef: `${subjectMapping.trigonometry}/trig_802_s25_q1.png`,
      options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
      correctAnswer: "תשובה ג",
      level: "hard",
    },
    {
      subject: "trigonometry",
      imageRef: `${subjectMapping.trigonometry}/trig_802_w25_q1.png`,
      options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
      correctAnswer: "תשובה ג",
      level: "hard",
    },
    {
      subject: "calculus",
      imageRef: `${subjectMapping.calculus}/calculus_803_w25_q1.png`,
      options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
      correctAnswer: "תשובה א",
      level: "hard",
    },
    {
      subject: "calculus",
      imageRef: `${subjectMapping.calculus}/calculus_802_w25_q2.png`,
      options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
      correctAnswer: "תשובה א",
      level: "hard",
    },
    {
      subject: "calculus",
      imageRef: `${subjectMapping.calculus}/calculus_803_s25_q1.png`,
      options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
      correctAnswer: "תשובה א",
      level: "hard",
    },
    {
      subject: "calculus",
      imageRef: `${subjectMapping.calculus}/calculus_803_s25_q2.png`,
      options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
      correctAnswer: "תשובה א",
      level: "hard",
    },
    {
      subject: "calculus",
      imageRef: `${subjectMapping.calculus}/calculus_803_s25_q3.png`,
      options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
      correctAnswer: "תשובה א",
      level: "hard",
    },
    {
      subject: "statistics",
      imageRef: `${subjectMapping.statistics}/prob&stat_801_s25_q1.png`,
      options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
      correctAnswer: "תשובה ד",
      level: "hard",
    },
    {
      subject: "statistics",
      imageRef: `${subjectMapping.statistics}/prob&stat_801_w25_q1.png`,
      options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
      correctAnswer: "תשובה ד",
      level: "hard",
    },
    {
      subject: "statistics",
      imageRef: `${subjectMapping.statistics}/prob&stat_802_s25_q1.png`,
      options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
      correctAnswer: "תשובה ד",
      level: "hard",
    },
    {
      subject: "statistics",
      imageRef: `${subjectMapping.statistics}/prob&stat_802_s25_q2.png`,
      options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
      correctAnswer: "תשובה ד",
      level: "hard",
    },
    {
      subject: "statistics",
      imageRef: `${subjectMapping.statistics}/prob&stat_802_w25_q1.png`,
      options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
      correctAnswer: "תשובה ד",
      level: "hard",
    },
  ],
};

const seedQuestions = async () => {
  try {
    const questionsRef = collection(db, "questions");

    // Add questions for each level
    for (const level of Object.keys(sampleQuestions)) {
      for (const question of sampleQuestions[level]) {
        await addDoc(questionsRef, question);
        console.log(`Added ${level} question for ${question.subject}`);
      }
    }

    console.log("Successfully seeded all questions!");
  } catch (error) {
    console.error("Error seeding questions:", error);
  }
};

seedQuestions();
