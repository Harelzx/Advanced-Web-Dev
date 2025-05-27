'use client'
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
            fakeAnswers = Object.values(fakeAnswersDoc.data()).filter(value => value !== undefined && value !== null);
            console.log(`Fake answers for ${docSnap.id}:`, fakeAnswers); 
          }
          return {
            id: docSnap.id,
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

  const handleAnswerChange = (questionId, value) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    setFeedback(prev => ({
      ...prev,
      [questionId]: null
    }));
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
  };

  const goNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % questions.length);
  };

  const goPrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + questions.length) % questions.length);
  };

  const getShuffledOptions = (correctAnswer, fakeAnswers) => {
    const options = [correctAnswer, ...fakeAnswers];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]]; 
    }
    return options;
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-gray-800 p-6 rounded-xl shadow-2xl text-center">
        <h1 className="text-white text-3xl font-bold mb-6">Questions Quiz</h1>

        {loading ? (
          <div className="text-white animate-pulse">Loading questions...</div>
        ) : questions.length > 0 ? (
          <>
            <h2 className="text-xl text-white font-semibold mb-4">
              {questions[currentIndex].id || `Question ${currentIndex + 1}`}
            </h2>
            
            {getShuffledOptions(questions[currentIndex].Answer, questions[currentIndex].fakeAnswers).map((option, index) => (
              <div key={index} className="mb-2">
                <label className="flex items-center text-white">
                  <input
                    type="radio"
                    name={`question-${questions[currentIndex].id}`}
                    value={option}
                    checked={userAnswers[questions[currentIndex].id] === option}
                    onChange={(e) => handleAnswerChange(questions[currentIndex].id, e.target.value)}
                    className="mr-2"
                  />
                  {option}
                </label>
              </div>
            ))}

            <button
              onClick={() => checkAnswer(
                questions[currentIndex].id,
                userAnswers[questions[currentIndex].id],
                questions[currentIndex].Answer
              )}
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
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