import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./config";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "./config";

// Process a regular question (easy/medium)
function processRegularQuestion(doc, data, difficulty) {
  if (
    !data.text ||
    !data.correct_answer ||
    !Array.isArray(data.incorrect_answers)
  ) {
    console.warn(`Invalid question data for ID ${doc.id}:`, data);
    return null;
  }

  // Create options array with correct answer first
  const options = [data.correct_answer, ...data.incorrect_answers];

  return {
    id: doc.id,
    text: data.text,
    type: "regular",
    level: data.level || difficulty,
    subject: data.subject || "",
    correct_answer: data.correct_answer,
    incorrect_answers: data.incorrect_answers,
    explanation: data.explanation || "אין הסבר זמין",
    timeLimit: data.timeLimit || (difficulty === "easy" ? 30 : 45),
    score: 20, // Each question is worth 20 points
  };
}

// Process a sectioned question (hard)
async function processSectionedQuestion(doc, data) {
  // Check if we have valid data
  if (!data || !data.subject || !Array.isArray(data.sections)) {
    console.warn(`Invalid bagrut question data for ID ${doc.id}:`, data);
    return null;
  }

  // Map subject names to standardized format
  const subjectMapping = {
    algebra: "algebra",
    calculus: "calculus",
    geometry: "geometry",
    "prob&stat": "statistics",
    statistics: "statistics",
    trig: "trigonometry",
  };

  const normalizedSubject = subjectMapping[data.subject] || data.subject;

  // Handle image reference if it exists
  let imageUrl = null;
  if (data.imageRef) {
    try {
      // Clean up the image reference path
      const cleanImageRef = data.imageRef.replace(/^\/+/, "").trim();

      // Use original subject for storage path
      const storageSubject = data.subject.toLowerCase().trim();

      // Try with subject folder first
      const imagePath = `${storageSubject}/${cleanImageRef}`;
      let storageRef = ref(storage, imagePath);

      try {
        imageUrl = await getDownloadURL(storageRef);
      } catch (firstError) {
        // Try without subject folder
        storageRef = ref(storage, cleanImageRef);
        try {
          imageUrl = await getDownloadURL(storageRef);
        } catch (secondError) {
          console.error("Failed to load image for question:", {
            id: doc.id,
            imageRef: cleanImageRef,
            error: secondError.message,
          });
        }
      }
    } catch (error) {
      console.error("Error processing image reference:", error);
    }
  }

  // Process all sections
  let processedSections = [];
  if (Array.isArray(data.sections) && data.sections.length > 0) {
    processedSections = data.sections
      .map((section, index) => {
        // Validate required fields
        if (
          !section.correct_answer ||
          !Array.isArray(section.incorrect_answers)
        ) {
          console.warn(
            `Invalid section data in question ${doc.id}, section ${index + 1}`
          );
          return null;
        }

        return {
          id: section.id || `section_${index + 1}`,
          text: section.text || `חלק ${index + 1}`, // Default text if none provided
          correct_answer: section.correct_answer,
          incorrect_answers: section.incorrect_answers || [],
          explanation: section.explanation || "",
          score: section.score || Math.floor(100 / data.sections.length),
        };
      })
      .filter(Boolean); // Remove any null sections
  }

  // If no valid sections, try to create one from the main question data
  if (processedSections.length === 0 && data.correct_answer) {
    processedSections = [
      {
        id: "section_1",
        text: data.text || "שאלת בגרות", // Default text if none provided
        correct_answer: data.correct_answer,
        incorrect_answers: data.incorrect_answers || [],
        explanation: data.explanation || "",
        score: 100,
      },
    ];
  }

  // Ensure we have at least one valid section
  if (processedSections.length === 0) {
    console.warn(`No valid sections found for bagrut question ${doc.id}`);
    return null;
  }

  return {
    id: doc.id,
    subject: normalizedSubject,
    level: "hard",
    type: "sectioned",
    imageUrl: imageUrl,
    sections: processedSections,
    currentSection: 0, // Track which section we're on
    totalSections: processedSections.length,
  };
}

// Fetch questions by difficulty level
export async function fetchQuestionsByDifficulty(difficulty) {
  try {
    console.log(`Starting to fetch questions for difficulty: ${difficulty}`);
    let questions = [];
    let questionsRef;
    let querySnapshot;

    if (difficulty === "hard") {
      // Fetch from bagrut questions collection
      console.log("Fetching from 'bagrut questions' collection");
      questionsRef = collection(db, "bagrut questions");
      querySnapshot = await getDocs(questionsRef);
      console.log(`Found ${querySnapshot.size} documents in bagrut collection`);

      // Process all documents in parallel
      const processedQuestions = await Promise.all(
        querySnapshot.docs.map((doc) =>
          processSectionedQuestion(doc, doc.data())
        )
      );

      // Filter out null results and add to questions array
      questions = processedQuestions.filter((q) => q !== null);
    } else {
      // Fetch from regular questions collection
      console.log(
        `Fetching from 'questions' collection with level=${difficulty}`
      );
      questionsRef = collection(db, "questions");
      const q = query(questionsRef, where("level", "==", difficulty));
      querySnapshot = await getDocs(q);
      console.log(
        `Found ${querySnapshot.size} documents in questions collection`
      );

      // Group questions by subject
      const questionsBySubject = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const processedQuestion = processRegularQuestion(doc, data, difficulty);
        if (processedQuestion) {
          const subject = processedQuestion.subject;
          if (!questionsBySubject[subject]) {
            questionsBySubject[subject] = [];
          }
          questionsBySubject[subject].push(processedQuestion);
        } else {
          console.warn(`Skipping malformed question with ID: ${doc.id}`);
        }
      });

      // Select one random question from each subject
      Object.values(questionsBySubject).forEach((subjectQuestions) => {
        if (subjectQuestions.length > 0) {
          const randomIndex = Math.floor(
            Math.random() * subjectQuestions.length
          );
          questions.push(subjectQuestions[randomIndex]);
        }
      });
    }

    console.log(`Total valid questions found: ${questions.length}`);

    if (questions.length === 0) {
      console.warn(`No valid questions found for difficulty: ${difficulty}`);
      return [];
    }

    // Shuffle the questions
    const shuffled = questions.sort(() => 0.5 - Math.random());
    console.log(`Returning ${shuffled.length} shuffled questions`);
    return shuffled;
  } catch (error) {
    console.error("Error fetching questions:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    return [];
  }
}

// Fetch questions for multiple difficulties
export async function fetchQuestionsByDifficulties(difficulties) {
  try {
    const questionsByDifficulty = {};

    for (const difficulty of difficulties) {
      const questions = await fetchQuestionsByDifficulty(difficulty);
      questionsByDifficulty[difficulty] = questions;
    }

    return questionsByDifficulty;
  } catch (error) {
    console.error("Error fetching questions for difficulties:", error);
    return {};
  }
}
