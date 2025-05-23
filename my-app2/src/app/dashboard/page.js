'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

const Dashboard = () => {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    if (typeof window !== 'undefined') {
      const isLoggedIn = sessionStorage.getItem('user');
      if (!isLoggedIn) {
        router.replace('/login');
        return;
      }
      
      // Fetch questions from Firestore
      const fetchQuestions = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "Question"));
          const questionsList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setQuestions(questionsList);
        } catch (error) {
          console.error("Error fetching questions:", error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchQuestions();
    }
  }, [router]);

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
                <p className="text-gray-300 mb-3">
                  {question.description || 'No description provided'}
                </p>
                <div className="text-sm text-gray-400">
                  {Object.entries(question)
                    .filter(([key]) => !['title', 'description', 'id'].includes(key))
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

export default Dashboard;