'use client' // Marks this component as a Client Component in Next.js, indicating it runs on the client side
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../firebase/config';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

const FirstQuiz = () => {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [answeredQuestions, setAnsweredQuestions] = useState({}); // Track answered questions

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Question"));
        const questionsList = await Promise.all(querySnapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const fakeAnswersRef = doc(db, `Question/${docSnap.id}/Fake Answers/Fake`);
          const fakeAnswersDoc = await getDoc(fakeAnswersRef);
          let fakeAnswers = [];
          if (fakeAnswersDoc.exists()) {
            fakeAnswers = Object.values(fakeAnswersDoc.data())
              .filter(value => value !== undefined && value !== null && value !== data.Answer);
            console.log(`Fake answers for ${docSnap.id}:`, fakeAnswers);
          }
          // Debug log to confirm the correct answer is pulled
          console.log(`Correct answer for question ${docSnap.id}:`, data.Answer);
          return {
            id: docSnap.id,
            Answer: data.Answer, // Explicitly save the correct answer
            ...data,
            fakeAnswers: fakeAnswers
          };
        }));
        setQuestions(questionsList);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [router]);

  useEffect(() => {
    if (questions.length > 0) {
      const currentQuestion = questions[currentIndex];
      // Include the correct answer in the options along with fake answers
      let options = [currentQuestion.Answer, ...currentQuestion.fakeAnswers];
      // Ensure we have exactly 4 options by trimming or padding
      if (options.length > 4) {
        options = options.slice(0, 4);
      } else if (options.length < 4) {
        const dummyOptions = ["0", "5", "10"].filter(opt => !options.includes(opt));
        while (options.length < 4 && dummyOptions.length > 0) {
          options.push(dummyOptions.shift());
        }
      }
      // Shuffle the options
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
      setShuffledOptions(options);
    }
  }, [currentIndex, questions]);

  const handleAnswerChange = (questionId, value) => {
    if (!answeredQuestions[questionId]) { // Only allow change if not already answered
      setUserAnswers(prev => ({
        ...prev,
        [questionId]: value
      }));
      setFeedback(prev => ({
        ...prev,
        [questionId]: null
      }));
    }
  };

  const checkAnswer = (questionId, userAnswer, correctAnswer) => {
    if (!userAnswer) {
      setFeedback(prev => ({
        ...prev,
        [questionId]: "Please select an answer."
      }));
      return;
    }

    const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    setFeedback(prev => ({
      ...prev,
      [questionId]: isCorrect ? "Yay!" : "Nay!"
    }));
    setAnsweredQuestions(prev => ({
      ...prev,
      [questionId]: true // Mark question as answered
    }));
  };

  const goNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % questions.length);
  };

  const goPrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + questions.length) % questions.length);
  };

  return (
    <div className="min-h-screen bg-white-900 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-gray-800 p-6 rounded-xl shadow-2xl text-center">
        <h1 className="text-white text-3xl font-bold mb-6">Questions Quiz</h1>

        {loading ? (
          <div className="text-white animate-pulse">Loading questions...</div>
        ) : questions.length > 0 ? (
          <>
            <h2 className="text-xl text-white font-semibold mb-4">
              {questions[currentIndex].id || `Question ${currentIndex + 1}`}
            </h2>
              
            <div className="grid gap-4">
              {shuffledOptions.map((option, index) => (
                <button
                  key={index}
                  className={`group w-full p-5 text-right rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] bg-gray-50 border-gray-200 text-gray-500 opacity-60 ${
                    userAnswers[questions[currentIndex].id] === option ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : ''
                  } ${answeredQuestions[questions[currentIndex].id] ? 'cursor-not-allowed opacity-50' : ''}`}
                  onClick={() => handleAnswerChange(questions[currentIndex].id, option)}
                  disabled={answeredQuestions[questions[currentIndex].id]} // Disable button after answer is checked
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center"></div>
                    <span className="text-lg font-medium group-hover:font-semibold transition-all duration-200">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => checkAnswer(
                questions[currentIndex].id,
                userAnswers[questions[currentIndex].id],
                questions[currentIndex].Answer
              )}
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
              disabled={answeredQuestions[questions[currentIndex].id]} // Disable check button after answer is checked
            >
              Check Answer
            </button>
            {feedback[questions[currentIndex].id] && (
              <p className={`mt-3 text-lg ${feedback[questions[currentIndex].id] === "Yay!" ? 'text-green-400' : 'text-red-400'}`}>
                {feedback[questions[currentIndex].id]}
              </p>
            )}

            <div className="flex justify-between items-center mt-6">
              <button
                onClick={goPrev}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                ← Previous
              </button>
              <button
                onClick={goNext}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Next →
              </button>
            </div>
          </>
        ) : (
          <p className="text-white">No questions found.</p>
        )}
      </div>
    </div>
  );
};

export default FirstQuiz;