"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../firebase/config";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import LoadingWheel from '../components/LoadingWheel';

const FirstQuiz = () => {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const userId = sessionStorage.getItem("uid");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "all_questions"));
        const questionsList = querySnapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            Answer: data.correct_answer,
            question: data.question,
            subject: data.subject || "unknown",
            fakeAnswers: data.incorrect_answers || [],
          };
        });
        setQuestions(questionsList);
      } catch (error) {
        console.error("Error fetching questions:", error);
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
    setUserAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const finishTest = async () => {
    // Validate all questions are answered
    if (Object.keys(userAnswers).length < questions.length) {
      alert("אנא ענה על כל השאלות לפני סיום המבחן");
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

        const resultRef = doc(db, "users", userId, "results", subject);
        await setDoc(resultRef, { grade });

        const exerciseRef = doc(db, "users", userId, "exercises", subject);
        await setDoc(exerciseRef, { wrongQuestions: wrongIds });
      }

      router.push("/Main_Page");
    } catch (error) {
      console.error("Error saving results:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGridClick = (index) => {
    setCurrentIndex(index);
  };

  const totalAnswered = Object.keys(userAnswers).length;
  const totalQuestions = questions.length;

  if (submitting) {
    return <LoadingWheel title="שומר תוצאות..." message="אנא המתן בזמן שאנו מעבדים את התשובות שלך." />;
  }

  return (
    <div className="min-h-screen panels-900 flex items-center justify-center p-2 md:p-6">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl gap-4">
        {/* Question Navigation Grid - Hidden on mobile, visible on large screens */}
        <div className="hidden lg:block lg:w-1/4 panels p-4 rounded-xl">
          <h2 className="text-blue-700 text-xl font-bold mb-4" style={{ direction: "rtl" }}>
            מפת שאלות
          </h2>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: totalQuestions }, (_, i) => (
              <button
                key={i}
                onClick={() => handleGridClick(i)}
                className={`w-12 h-12 border-2 rounded flex items-center justify-center text-sm ${
                  currentIndex === i
                    ? "bg-blue-500 text-white border-blue-700"
                    : userAnswers[questions[i]?.id]
                    ? "bg-green-500 text-white border-green-600"
                    : "panels text-black border-gray-300"
                }`}
                style={{ direction: "rtl" }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Main Quiz Content */}
        <div className="w-full lg:w-3/4 panels p-4 md:p-6 rounded-xl shadow-2xl">
          {/* Mobile Progress Indicator */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
            <div className="text-blue-500 font-medium text-sm">
              שאלה {currentIndex + 1} מתוך {totalQuestions}
            </div>
            <div className="text-blue-500 font-medium text-sm">
              ענית על {totalAnswered} מתוך {totalQuestions} שאלות
            </div>
          </div>

          <h1 className="text-white text-2xl md:text-3xl font-bold mb-6" style={{ direction: "rtl", textAlign: "right" }}>
            חידון שאלות
          </h1>
          {loading ? (
            <LoadingWheel title="טוען שאלות..." message="אנא המתן בזמן שאנו מכינים את החידון." />
          ) : questions.length > 0 ? (
            <>
              <h2 className="text-lg md:text-xl text-white font-semibold mb-4" style={{ direction: "rtl", textAlign: "right" }}>
                {questions[currentIndex].question || `שאלה ${currentIndex + 1}`}
              </h2>
              <div className="grid gap-3 md:gap-4">
                {shuffledOptions.map((option, index) => {
                  const qId = questions[currentIndex].id;
                  const isSelected = userAnswers[qId] === option;
                  const buttonStyles = `group w-full p-3 md:p-5 rounded-xl md:rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] text-right ${
                    isSelected
                      ? "bg-blue-500 text-white border-blue-600"
                      : "bg-gray-50 border-gray-200 panels hover:bg-blue hover:border-green-400 hover:text-green-800"
                  }`;
                  return (
                    <button
                      key={index}
                      className={buttonStyles}
                      onClick={() => handleAnswerChange(qId, option)}
                      style={{ direction: "rtl", textAlign: "right"}}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base md:text-lg font-medium">{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Buttons - Above finish button */}
              <div className="flex justify-between items-center mt-6 mb-4">
                <button
                  onClick={() => setCurrentIndex(Math.min(totalQuestions - 1, currentIndex + 1))}
                  disabled={currentIndex === totalQuestions - 1}
                  className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-4 py-2 rounded transition-colors"
                >
                  שאלה הבאה
                </button>
                <button
                  onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                  className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-4 py-2 rounded transition-colors"
                >
                  שאלה קודמת
                </button>
              </div>

              <button
                onClick={finishTest}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition text-lg"
                disabled={submitting}
              >
                סיים מבחן
              </button>
            </>
          ) : (
            <p className="text-white" style={{ direction: "rtl", textAlign: "right" }}>
              לא נמצאו שאלות.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FirstQuiz;