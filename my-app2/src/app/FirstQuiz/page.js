'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../firebase/config';
import {collection, getDocs, doc, setDoc,} from 'firebase/firestore';

const FirstQuiz = () => {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const userId = sessionStorage.getItem('uid'); 

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
            subject: data.subject,
            fakeAnswers: data.incorrect_answers || []
          };
        });
        setQuestions(questionsList);
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

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

  const handleAnswerChange = (questionId, value) => {
    if (!answeredQuestions[questionId]) {
      setUserAnswers(prev => ({ ...prev, [questionId]: value }));
      setFeedback(prev => ({ ...prev, [questionId]: null }));
    }
  };

  const checkAnswer = (questionId, userAnswer, correctAnswer) => {
    if (!userAnswer) {
      setFeedback(prev => ({
        ...prev,
        [questionId]: { isCorrect: false }
      }));
      return;
    }

    const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    setFeedback(prev => ({
      ...prev,
      [questionId]: { isCorrect, correctAnswer }
    }));
    setAnsweredQuestions(prev => ({
      ...prev,
      [questionId]: true
    }));
  };

  const goNext = () => {
    setCurrentIndex(prev => (prev + 1) % questions.length);
  };

  const goPrev = () => {
    setCurrentIndex(prev => (prev - 1 + questions.length) % questions.length);
  };

  const finishTest = async () => {
    setSubmitting(true);
    try {
      const results = {};
      questions.forEach((q) => {
        const userAns = userAnswers[q.id];
        const isCorrect = userAns && userAns.trim().toLowerCase() === q.Answer.trim().toLowerCase();
        if (!results[q.subject]) {
          results[q.subject] = { total: 0, correct: 0, wrongIds: [] };
        }

        results[q.subject].total += 1;
        if (isCorrect) {
          results[q.subject].correct += 1;
        } else {
          results[q.subject].wrongIds.push(q.id);
        }
      });

      for (const subject in results) {
        const { total, correct, wrongIds } = results[subject];
        const grade = (correct / total) * 100;

        // Save grade
        const resultRef = doc(db, 'users', userId, 'results', subject);
        await setDoc(resultRef, { grade });

        // Save wrong question IDs
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

  const totalAnswered = Object.keys(answeredQuestions).length;
  const totalQuestions = questions.length;

  return (
    <div className="min-h-screen bg-white-900 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-gray-800 p-6 rounded-xl shadow-2xl text-center">
        <div className="flex justify-between items-center mb-4">
          <div className="text-white font-medium text-sm">
            ענית על {totalAnswered} מתוך {totalQuestions} שאלות
          </div>
        </div>

        <h1 className="text-white text-3xl font-bold mb-6" style={{ direction: 'rtl', textAlign: 'right' }}>
          חידון שאלות
        </h1>

        {loading || submitting ? (
          <div className="text-white text-lg animate-pulse" style={{ direction: 'rtl', textAlign: 'right' }}>
            {submitting ? 'שומר תוצאות...' : 'טוען שאלות...'}
          </div>
        ) : questions.length > 0 ? (
          <>
            <h2 className="text-xl text-white font-semibold mb-4" style={{ direction: 'rtl', textAlign: 'right' }}>
              {questions[currentIndex].question || `שאלה ${currentIndex + 1}`}
            </h2>

            <div className="grid gap-4">
              {shuffledOptions.map((option, index) => {
                const qId = questions[currentIndex].id;
                const isSelected = userAnswers[qId] === option;
                const isCorrectAnswer = questions[currentIndex].Answer === option;
                const isAnswered = answeredQuestions[qId];

                let buttonStyles = 'group w-full p-5 rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] bg-gray-50 border-gray-200 text-gray-500 opacity-60';
                if (isAnswered) {
                  if (isSelected && !feedback[qId]?.isCorrect) {
                    buttonStyles = 'group w-full p-5 rounded-2xl border-2 bg-red-500 border-red-600 text-white shadow-lg shadow-red-500/50 cursor-not-allowed opacity-50';
                  } else if (isCorrectAnswer) {
                    buttonStyles = 'group w-full p-5 rounded-2xl border-2 bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-500/50 cursor-not-allowed';
                  } else {
                    buttonStyles += ' cursor-not-allowed opacity-50';
                  }
                } else if (isSelected) {
                  buttonStyles = 'group w-full p-5 rounded-2xl border-2 bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-500/50';
                } else {
                  buttonStyles += ' hover:bg-emerald-100 hover:border-emerald-400 hover:text-emerald-800';
                }

                return (
                  <button
                    key={index}
                    className={buttonStyles}
                    onClick={() => handleAnswerChange(qId, option)}
                    disabled={isAnswered}
                    style={{ direction: 'ltr', textAlign: 'left' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => checkAnswer(
                questions[currentIndex].id,
                userAnswers[questions[currentIndex].id],
                questions[currentIndex].Answer,
                questions[currentIndex].subject
              )}
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
              disabled={answeredQuestions[questions[currentIndex].id]}
              style={{ direction: 'rtl' }}
            >
              בדוק תשובה
            </button>

            <div className="flex justify-between items-center mt-6">
              <button
                onClick={goPrev}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                style={{ direction: 'rtl' }}
              >
                 הבא←
              </button>
              <button
                onClick={goNext}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                style={{ direction: 'rtl' }}
              >
                 →קודם
              </button>
            </div>

            <button
              onClick={finishTest}
              className="mt-6 w-full bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
              disabled={submitting}
            >
              סיים מבחן
            </button>
          </>
        ) : (
          <p className="text-white" style={{ direction: 'rtl', textAlign: 'right' }}>
            לא נמצאו שאלות.
          </p>
        )}
      </div>
    </div>
  );
};

export default FirstQuiz;
