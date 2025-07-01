'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../firebase/config';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

/**
 * Custom Hook for managing the logic of the FirstQuiz component.
 * This hook handles fetching quiz questions, managing user answers, shuffling answer options,
 * submitting results to Firestore, and navigating the quiz. It provides a clean API
 * for the FirstQuiz component to render the quiz interface.
 *
 * @returns {Object} An object containing the state and functions for the quiz:
 * - questions: Array of quiz questions with id, Answer, question, subject, and fakeAnswers.
 * - loading: Boolean indicating whether questions are being fetched.
 * - userAnswers: Object mapping question IDs to user-selected answers.
 * - currentIndex: Number indicating the current question index.
 * - shuffledOptions: Array of answer options for the current question, randomly shuffled.
 * - submitting: Boolean indicating whether results are being submitted.
 * - totalAnswered: Number of questions answered by the user.
 * - totalQuestions: Total number of questions in the quiz.
 * - handleAnswerChange: Function to update user answers.
 * - finishTest: Function to submit quiz results and navigate to the main page.
 * - handleGridClick: Function to navigate to a specific question by index.
 * - handleNextQuestion: Function to navigate to the next question.
 * - handlePreviousQuestion: Function to navigate to the previous question.
 */
export function useFirstQuizLogic() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const userId = typeof window !== 'undefined' ? sessionStorage.getItem('uid') : null;

  // Fetches quiz questions from Firestore when the component mounts.
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'all_questions'));
        const questionsList = querySnapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            Answer: data.correct_answer,
            question: data.question,
            subject: data.subject || 'unknown',
            fakeAnswers: data.incorrect_answers || [],
          };
        });
        setQuestions(questionsList);
        console.log('Fetched questions:', questionsList);
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // Shuffles answer options for the current question whenever the question changes.
  useEffect(() => {
    if (questions.length > 0) {
      const currentQuestion = questions[currentIndex];
      let options = [currentQuestion.Answer, ...currentQuestion.fakeAnswers];
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
      setShuffledOptions(options);
    }
  }, [currentIndex, questions]);

  // Updates the user's answer for a specific question.
  const handleAnswerChange = (questionId, value) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  // Submits quiz results to Firestore and navigates to the main page.
  const finishTest = async () => {
    if (Object.keys(userAnswers).length < questions.length) {
      alert('אנא ענה על כל השאלות לפני סיום המבחן');
      return;
    }

    setSubmitting(true);
    try {
      const results = {};
      questions.forEach((q) => {
        const userAns = userAnswers[q.id];
        const isCorrect = userAns && userAns.trim().toLowerCase() === q.Answer.trim().toLowerCase();
        const subject = q.subject || `question_${q.id}`;
        if (!results[subject]) {
          results[subject] = { total: 0, correct: 0, wrongIds: [] };
        }

        results[subject].total += 1;
        if (isCorrect) {
          results[subject].correct += 1;
        } else {
          results[subject].wrongIds.push(q.id);
        }
      });

      for (const subject in results) {
        const { total, correct, wrongIds } = results[subject];
        const grade = (correct / total) * 100;

        const resultRef = doc(db, 'users', userId, 'results', subject);
        await setDoc(resultRef, { grade });

        const exerciseRef = doc(db, 'users', userId, 'exercises', subject);
        await setDoc(exerciseRef, { wrongQuestions: wrongIds });
      }

      router.push('/Main_Page');
    } catch (error) {
      console.error('Error saving results:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Navigates to a specific question by index.
  const handleGridClick = (index) => {
    setCurrentIndex(index);
  };

  // Navigates to the next question.
  const handleNextQuestion = () => {
    setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
  };

  // Navigates to the previous question.
  const handlePreviousQuestion = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const totalAnswered = Object.keys(userAnswers).length;
  const totalQuestions = questions.length;

  return {
    questions,
    loading,
    userAnswers,
    currentIndex,
    shuffledOptions,
    submitting,
    totalAnswered,
    totalQuestions,
    handleAnswerChange,
    finishTest,
    handleGridClick,
    handleNextQuestion,
    handlePreviousQuestion,
  };
}