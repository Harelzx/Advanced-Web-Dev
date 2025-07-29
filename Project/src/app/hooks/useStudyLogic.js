"use client";
import { useState, useEffect } from "react";

/**
 * A custom hook to manage the state and logic of a practice session.
 * This hook encapsulates all the business logic for the quiz,
 * making the UI components cleaner and focused on presentation.
 * @param {object} practiceSets - The sets of questions, organized by difficulty.
 * @param {function} onQuizComplete - Callback function to execute when the quiz is finished.
 * @param {number} sessionNumber - The current session number.
 * @returns {object} - An object containing state and functions for the UI to use.
 */
export function useStudyLogic(practiceSets, onQuizComplete, sessionNumber) {
  // State for managing the quiz flow and data
  const [difficulty, setDifficulty] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [startTime, setStartTime] = useState(null);

  // Effect to initialize or reset the quiz state when new practice sets are provided.
  useEffect(() => {
    if (practiceSets && typeof practiceSets === "object") {
      // Determine the difficulty level for the current session.
      const difficultyLevel = Object.keys(practiceSets).find(
        (key) => practiceSets[key] && practiceSets[key].length > 0
      );

      if (difficultyLevel) {
        const questions = practiceSets[difficultyLevel];
        setDifficulty(difficultyLevel);
        setSelectedQuestions(questions);
        // Reset answers and score for the new session.
        setUserAnswers(new Array(questions.length).fill(null));
        setScore(0);
        setCurrentQuestion(0);
        setIsAnswered(false);
        setQuizCompleted(false);
        setIsLoading(false);
        setStartTime(Date.now()); // Mark the start time for the session.
      }
    }
  }, [practiceSets]);

  // Effect to handle the completion of the quiz.
  // This triggers the onQuizComplete callback with the final results.
  useEffect(() => {
    if (quizCompleted && onQuizComplete) {
      const timeSpent = startTime
        ? Math.ceil((Date.now() - startTime) / (1000 * 60))
        : 0; // in minutes
      const results = {
        score: score,
        totalQuestions: selectedQuestions.length,
        answers: userAnswers.map((answer, index) => {
          const question = selectedQuestions[index];
          // For bagrut questions (sections), answer is an array of booleans
          if (Array.isArray(answer)) {
            const correctCount = answer.filter(Boolean).length;
            const totalSections = answer.length;
            return {
              questionId: question.id,
              userAnswer: answer,
              correct: question.sections ? question.sections.map(s => s.correct_answer) : null,
              isCorrect: correctCount === totalSections,
            };
          }
          // For regular questions
          return {
            questionId: question.id,
            userAnswer: answer,
            correct: question.correct,
            isCorrect: answer === question.correct,
          };
        }),
        difficulty: difficulty,
        timeSpent: timeSpent,
        sessionNumber: sessionNumber,
      };
      onQuizComplete(results);
    }
  }, [
    quizCompleted,
    onQuizComplete,
    score,
    selectedQuestions,
    userAnswers,
    difficulty,
    startTime,
    sessionNumber,
  ]);

  /**
   * Handles the user's answer submission for the current question.
   * It records the answer, updates the score, and prevents further answers.
   * @param {number} answerIndex - The index of the selected answer.
   */
  const handleAnswer = (answerIndex) => {
    if (isAnswered && answerIndex !== -1 && !Array.isArray(answerIndex)) return;

    // Hard question: answerIndex is an array of booleans (sectionResults)
    if (Array.isArray(answerIndex)) {
      // Store the section results in userAnswers
      const newAnswers = [...userAnswers];
      newAnswers[currentQuestion] = answerIndex;
      setUserAnswers(newAnswers);
      
      // Each hard question is worth 20 points
      const correctCount = answerIndex.filter(Boolean).length;
      const totalSections = answerIndex.length;
      const questionScore = Math.round((correctCount / totalSections) * 20);
      setScore(score + questionScore);
      nextQuestion();
      return;
    }

    // Special case for hard questions: -1 means just go to next question (legacy, can be removed if not used)
    if (answerIndex === -1) {
      nextQuestion();
      return;
    }

    // Classic question logic
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setUserAnswers(newAnswers);
    setIsAnswered(true);

    if (answerIndex === selectedQuestions[currentQuestion].correct) {
      setScore(score + 20); // Each classic question is also worth 20
    }
  };

  /**
   * Moves to the next question or marks the quiz as completed if it's the last question.
   */
  const nextQuestion = () => {
    if (currentQuestion < selectedQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setIsAnswered(false);
    } else {
      setQuizCompleted(true);
    }
  };

  // Derived state: these values are calculated on each render based on the core state.
  const question =
    selectedQuestions.length > 0 ? selectedQuestions[currentQuestion] : null;
  const userAnswer =
    userAnswers.length > 0 ? userAnswers[currentQuestion] : null;

  // The public API of the hook, returned for the component to use.
  return {
    isLoading,
    quizCompleted,
    score,
    totalQuestions: selectedQuestions.length,
    difficulty,
    currentQuestion,
    question,
    isAnswered,
    userAnswer,
    handleAnswer,
    nextQuestion,
  };
}
