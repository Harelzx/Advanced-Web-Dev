// This file will centralize all Firestore interactions for the training program.
// We will move functions like getFirstQuizScores, getPracticeQuestions, etc., here.

import { db } from "./config";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { storage } from "./config";
import { getDownloadURL, ref } from "firebase/storage";

/**
 * Fetches the initial quiz scores for a user from the 'results' sub-collection.
 * These scores are used to determine the user's weak points.
 */
export async function getFirstQuizScores(userId) {
  const scores = {};
  const resultsCollectionRef = collection(db, "users", userId, "results");
  const querySnapshot = await getDocs(resultsCollectionRef);

  if (querySnapshot.empty) {
    console.warn(`No result documents found for user ${userId}`);
    return {};
  }

  querySnapshot.forEach((docSnap) => {
    const subject = docSnap.id;
    const data = docSnap.data();
    if (data && typeof data.grade !== "undefined") {
      scores[subject] = data.grade;
    }
  });

  return scores;
}

/**
 * Fetches all available practice questions from the 'practice_questions' collection.
 * It also shuffles the answer options for each question.
 */
export async function getPracticeQuestions() {
  const questionsCollection = collection(db, "practice_questions");
  const querySnapshot = await getDocs(questionsCollection);
  const questions = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const {
      question_text,
      question,
      questionText,
      correct_answer,
      incorrect_answers,
      ...rest
    } = data;

    const text =
      question_text || question || questionText || "No question text found";
    const correctAnswer = correct_answer;
    const allOptions = [correctAnswer, ...incorrect_answers];

    // Shuffle the answer options so the correct answer isn't always in the same place.
    for (let i = allOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
    }

    // Find the new index of the correct answer after shuffling.
    const correctIndex = allOptions.findIndex((opt) => opt === correctAnswer);

    questions.push({
      id: doc.id,
      question: text,
      options: allOptions,
      correct: correctIndex,
      ...rest,
    });
  });
  return questions;
}

/**
 * Builds a personalized 10-question practice session for the user.
 * It prioritizes questions from the user's weakest subjects.
 */
export function buildPracticeSession(
  trainingProgress,
  firstQuizScores,
  allQuestions,
  difficultyNumber
) {


  // First, filter all questions by the required difficulty number.
  const questionsOfDifficulty = allQuestions.filter(
    (q) => q.difficulty === difficultyNumber
  );

  if (questionsOfDifficulty.length === 0) {
    return [];
  }

  // Special logic for hard sessions (bagrut)
  if (difficultyNumber === 3) {
    // Subjects to cover
    const subjects = ["algebra", "calculus", "geometry", "prob&stat", "trig"];
    const selectedQuestions = [];
    subjects.forEach((subject) => {
      const subjectQuestions = questionsOfDifficulty.filter(
        (q) => q.subject === subject
      );
      if (subjectQuestions.length > 0) {
        // Pick one at random
        const randomIdx = Math.floor(Math.random() * subjectQuestions.length);
        selectedQuestions.push(subjectQuestions[randomIdx]);
      }
    });
    return selectedQuestions;
  }

  const sessionQuestions = [];
  // Sort subjects from weakest to strongest based on initial quiz scores.
  const subjectsByWeakness = Object.entries(firstQuizScores)
    .sort(([, scoreA], [, scoreB]) => scoreA - scoreB)
    .map(([subject]) => subject);

  const questionDistribution = [4, 3, 2, 1];
  let questionCount = 0;

  for (let i = 0; i < subjectsByWeakness.length && questionCount < 10; i++) {
    const subject = subjectsByWeakness[i];
    const numQuestions = questionDistribution[i] || 1;

    // Now, filter the already difficulty-filtered questions by subject.
    const filteredQuestions = questionsOfDifficulty.filter(
      (q) =>
        q.subject === subject && !sessionQuestions.some((sq) => sq.id === q.id)
    );
    const questionsToAdd = filteredQuestions.slice(0, numQuestions);



    sessionQuestions.push(...questionsToAdd);
    questionCount += questionsToAdd.length;
  }

  // If we still don't have 10 questions, fill with any remaining questions of the correct difficulty.
  if (sessionQuestions.length < 10) {
    const remainingNeeded = 10 - sessionQuestions.length;
    const remainingQuestions = questionsOfDifficulty.filter(
      (q) => !sessionQuestions.some((sq) => sq.id === q.id)
    );

    const questionsToAdd = remainingQuestions.slice(0, remainingNeeded);
    sessionQuestions.push(...questionsToAdd);
  }

  return sessionQuestions.slice(0, 10);
}

/**
 * Saves the results of a practice session to a user's sub-collection
 * and updates their overall training progress.
 */
export async function saveSessionResults(
  userId,
  currentSession,
  results,
  practiceSets
) {
  const difficulty = results.difficulty;
  const subjectBreakdown = {};
  const mistakes = [];

  // Analyze the user's answers to build a summary.
  results.answers.forEach((answer) => {
    const question = practiceSets[difficulty].find(
      (q) => q.id === answer.questionId
    );
    if (!question) return;

    const subject = question.subject;
    if (!subjectBreakdown[subject]) {
      subjectBreakdown[subject] = { questions: 0, correct: 0 };
    }
    subjectBreakdown[subject].questions++;

    if (answer.isCorrect) {
      subjectBreakdown[subject].correct++;
    } else {
      mistakes.push({
        questionId: answer.questionId,
        userAnswer: answer.userAnswer,
      });
    }
  });

  // Prepare the data object for the session document.
  const sessionData = {
    timeSpent: results.timeSpent || 0,
    subjectBreakdown,
    mistakes,
    completedAt: serverTimestamp(),
  };

  // Save the session data to a sub-collection within the user's document.
  const practiceDocRef = doc(
    db,
    "users",
    userId,
    "interstudy_sessions",
    `session_${currentSession}`
  );
  await setDoc(practiceDocRef, sessionData);

  // Prepare the progress update.
  const updatedProgress = {
    currentSession: currentSession + 1,
    completedSessions: currentSession,
    status: currentSession + 1 > 9 ? "completed" : "in_progress",
    lastActivity: serverTimestamp(),
  };

  // Update the user's main training progress document.
  const progressRef = doc(db, "users", userId, "training_progress", "plan_1");
  await updateDoc(progressRef, updatedProgress);

  return updatedProgress;
}

/**
 * Fetches the download URL for a question image from Firebase Storage.
 * @param {string} subject - The subject/folder name (e.g., 'algebra').
 * @param {string} imageRef - The image file name (e.g., '12345.png').
 * @returns {Promise<string>} - The download URL for the image.
 */
export async function getQuestionImageUrl(subject, imageRef) {
  if (!subject || !imageRef) return null;
  const path = `${subject}/${imageRef}`;
  const imageRefInStorage = ref(storage, path);
  return await getDownloadURL(imageRefInStorage);
}

/**
 * Fetches all available bagrut questions from the 'bagrut_questions' collection.
 */
export async function getBagrutQuestions() {
  const questionsCollection = collection(db, "bagrut_questions");
  const querySnapshot = await getDocs(questionsCollection);
  const questions = [];
  querySnapshot.forEach((doc) => {
    questions.push({ id: doc.id, ...doc.data() });
  });
  return questions;
}
