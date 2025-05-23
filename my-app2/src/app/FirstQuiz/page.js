'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

const FirstQuiz = () => {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState({}); // Track user input for each question
  const [feedback, setFeedback] = useState({}); // Track feedback for each question

  useEffect(() => { 
    // Fetch questions from Firestore
    const fetchQuestions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Question"));
        const questionsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log("Fetched Questions:", questionsList); // Log all fetched data
        setQuestions(questionsList);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [router]);

  // Handle user input change for a specific question
  const handleAnswerChange = (questionId, value) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    // Clear feedback when user types a new answer
    setFeedback(prev => ({
      ...prev,
      [questionId]: null
    }));
  };

  // Check user answer against Firestore Answer for a specific question
  const checkAnswer = (questionId, userAnswer, Answer) => {
    // Log the comparison for debugging
    console.log(`Comparing for Question ID: ${questionId}`);
    console.log(`User Answer: "${userAnswer}"`);
    console.log(`Firestore Answer: "${Answer}"`);

    // Check if userAnswer is empty after trimming whitespace
    if (!userAnswer.trim()) {
      setFeedback(prev => ({
        ...prev,
        [questionId]: "Please enter an answer."
      }));
      return;
    }

    // Check if Answer from Firestore is missing
    if (!Answer) {
      setFeedback(prev => ({
        ...prev,
        [questionId]: "Correct answer not available in database."
      }));
      console.log(`Full Question Object for ID ${questionId}:`, questions.find(q => q.id === questionId));
      return;
    }

    // Compare userAnswer with Firestore Answer
    const isCorrect = userAnswer.trim().toLowerCase() === Answer.trim().toLowerCase();
    setFeedback(prev => ({
      ...prev,
      [questionId]: isCorrect ? "Yay!" : "Nay!"
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-6">
          <h1 className="text-white text-2xl font-bold mb-4">Questions Dashboard</h1>
        </div>
        
        {loading ? (
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-center">
            <div className="animate-pulse text-white">Loading questions...</div>
          </div>
        ) : questions.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {questions.map(question => (
              <div key={question.id} className="bg-gray-800 p-6 rounded-lg shadow-xl">
                <h2 className="text-xl text-white font-semibold mb-2">
                  {question.title || `Document ID: ${question.id}`}
                </h2>
                <div className="mb-3">
                  <input
                    type="text"
                    value={userAnswers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder="Enter your answer"
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => checkAnswer(question.id, userAnswers[question.id], question.Answer)}
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Check Answer
                  </button>
                  {feedback[question.id] && (
                    <p className={`mt-2 text-sm ${feedback[question.id] === "Yay!" ? 'text-green-500' : 'text-red-500'}`}>
                      {feedback[question.id]}
                    </p>
                  )}
                </div>
                <div className="text-sm text-gray-400">
                  {Object.entries(question)
                    .filter(([key]) => !['title', 'Answer', 'id'].includes(key))
                    .map(([key, value]) => (
                      <div key={key} className="mb-1">
                        <span className="font-medium">{key}: </span>
                        <span>{typeof value === 'object' ? JSON.stringify(value) : value.toString()}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-center">
            <p className="text-white">No questions found in the database.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FirstQuiz;