
import { db } from '../firebase/config';
import { doc, collection, getDocs, setDoc } from 'firebase/firestore';

/**
 * Retrieves the saved learning path for a user from Firestore.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array|null>} - Returns an array of learning path items if exists, otherwise null.
 */
export async function getSavedLearningPath(userId) {
  const pathRef = collection(db, 'users', userId, 'learningPath');
  const pathSnapshot = await getDocs(pathRef);

  if (!pathSnapshot.empty) {
    return pathSnapshot.docs.map(doc => doc.data());
  }

  return null;
}

/**
 * Retrieves the user's quiz results from Firestore, excluding fully completed topics (grade = 100).
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array>} - An array of quiz result objects in the format { topic, grade }.
 */
export async function getUserQuizResults(userId) {
  const resultsRef = collection(db, 'users', userId, 'results');
  const resultDocs = await getDocs(resultsRef);

  const quizResults = [];
  resultDocs.forEach(docSnap => {
    const data = docSnap.data();
    if (typeof data.grade === 'number' && data.grade < 100) {
      quizResults.push({ topic: docSnap.id, grade: data.grade });
    }
  });

  return quizResults;
}

/**
 * Saves a new learning path to Firestore for a specific user.
 * @param {string} userId - The ID of the user.
 * @param {Array} pathItems - The learning path items to save.
 * @returns {Promise<void>}
 */
export async function saveLearningPath(userId, pathItems) {
  const pathRef = collection(db, 'users', userId, 'learningPath');

  await Promise.all(
    pathItems.map((item, index) =>
      setDoc(doc(pathRef, String(index)), {
        ...item,
        createdAt: new Date()
      })
    )
  );
}
