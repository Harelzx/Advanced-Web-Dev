"use client";
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase/config';
import { doc, getDoc, updateDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import { recordPageVisit} from '../components/Badge/BadgeSystem';
import loadingAnimation from "../animations/Loading.json";
import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function PersonalizedPath() {
  const [learningPath, setLearningPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    async function fetchLearningPath() {
      const userId = typeof window !== 'undefined' ? sessionStorage.getItem('uid') : null;

      if (!userId) {
        console.log("No user ID found in session storage.");
        setLoading(false);
        return;
      }

      try {
        // Record visit to PersonalizedPath page
        await recordPageVisit(userId, "PersonalizedPath");

        // בדיקה אם כבר שמור מסלול
        const pathRef = collection(db, 'users', userId, 'learningPath');
        const pathSnapshot = await getDocs(pathRef);

        if (!pathSnapshot.empty) {
          const existingPath = pathSnapshot.docs.map(doc => doc.data());
          setLearningPath(existingPath);
          console.log('Loaded saved learning path from Firestore');
          setTimeout(() => setLoading(false), 2000);
          return;
        }

        // שליפת תוצאות אבחון
        const resultsRef = collection(db, 'users', userId, 'results');
        const resultDocs = await getDocs(resultsRef);

        const quizResults = [];
        resultDocs.forEach(docSnap => {
          const subject = docSnap.id;
          const data = docSnap.data();
          if (typeof data.grade === 'number' && data.grade < 100) {
            quizResults.push({
              topic: subject,
              grade: docSnap.data().grade
            });
          }
        });

        if (quizResults.length === 0) {
          setLearningPath([]);
          setTimeout(() => setLoading(false), 2000);
          return;
        }

        // שליחת הבקשה ל־API
        const result = await fetch('/api/generatePath', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quizResults }),
        });

        if (!result.ok) {
          throw new Error(`API returned ${result.status}`);
        }

        const generatedPath = await result.json();
        setLearningPath(generatedPath);

        // שמירת המסלול החדש
        await Promise.all(
          generatedPath.map((item, index) =>
            setDoc(doc(pathRef, String(index)), {
              ...item,
              createdAt: new Date()
            })
          )
        );

        setTimeout(() => setLoading(false), 2000);
      } catch (err) {
        console.error("Error in fetchLearningPath:", err);
        setLearningPath([]);
        setTimeout(() => setLoading(false), 2000);
      }
    }

    fetchLearningPath();
  }, []);


  // Load completed steps from localStorage
  useEffect(() => {
    if (learningPath) {
      const saved = localStorage.getItem('completedSteps');
      if (saved) {
        setCompletedSteps(new Set(JSON.parse(saved)));
      }
    }
  }, [learningPath]);

  // Save completed steps to localStorage
  const saveProgress = (newCompletedSteps) => {
    localStorage.setItem('completedSteps', JSON.stringify([...newCompletedSteps]));
  };

  const toggleStepCompletion = (stepIndex) => {
    const newCompletedSteps = new Set(completedSteps);
    if (newCompletedSteps.has(stepIndex)) {
      newCompletedSteps.delete(stepIndex);
    } else {
      newCompletedSteps.add(stepIndex);
    }
    setCompletedSteps(newCompletedSteps);
    saveProgress(newCompletedSteps);
  };

  const progressPercentage = learningPath 
    ? Math.round((completedSteps.size / learningPath.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen panels flex flex-col items-center justify-center p-6" dir="rtl">
        <div className="bg-gray-50 rounded-3xl shadow-lg p-8 text-center max-w-md w-full">
          <div className="w-32 h-32 mb-6 mx-auto">
            <Lottie animationData={loadingAnimation} loop={true} autoplay={true} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">בניית המסלול האישי שלך</h2>
          <p className="text-gray-600">אנא המתן בזמן שאנחנו יוצרים עבורך מסלול למידה מותאם אישית...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen panels" dir="rtl">
        <main className="max-w-6xl mx-auto p-6 space-y-8">
          {/* Header Section */}
          <div className="text-center py-12">

            <h1 className="text-4xl md:text-5xl font-bold text-green-600 mb-4">
              מסלול הלמידה האישי שלך
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              מסלול מותאם אישית המבוסס על התוצאות שלך, עם משאבי למידה מתקדמים
            </p>
          </div>

          {learningPath && learningPath.length > 0 ? (
            <div className="space-y-8">
              {/* Progress Bar */}
              <div className="panels rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">התקדמות במסלול</h3>
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <span className="text-2xl font-bold text-blue-600">{progressPercentage}%</span>
                    <span className="text-sm text-gray-500">{completedSteps.size} מתוך {learningPath.length}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-blue-600 h-4 rounded-full transition-all duration-700 flex items-center justify-end px-2"
                    style={{ width: `${progressPercentage}%` }}
                  >
                    {progressPercentage > 0 && (
                      <span className="text-white text-xs font-bold">{progressPercentage}%</span>
                    )}
                  </div>
                </div>
                {progressPercentage === 100 && (
                  <div className="mt-4 text-center">
                    <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      🎉 כל הכבוד! סיימת את כל המסלול
                    </span>
                  </div>
                )}
              </div>

              {/* Learning Path Items */}
              {learningPath.map((item, index) => {
                const isCompleted = completedSteps.has(index);
                return (
                <div 
                  key={index} 
                  className={`group relative panels rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border ${
                    isCompleted ? 'border-green-300 bg-green-50' : 'border-gray-100'
                  }`}
                >
                  {/* Completion Checkbox */}
                  <button
                    onClick={() => toggleStepCompletion(index)}
                    className={`absolute top-6 left-6 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all z-10 ${
                      isCompleted 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-gray-300 hover:border-green-400 panels'
                    }`}
                  >
                    {isCompleted && <span className="text-sm">✓</span>}
                  </button>

                  {/* Step Number Badge */}
                  <div className={`absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                    isCompleted 
                      ? 'bg-green-600' 
                      : 'bg-blue-600'
                  }`}>
                    {isCompleted ? '✓' : index + 1}
                  </div>

                  <div className="p-8 pt-20">
                    {/* Topic Title */}
                    <h2 className={`text-2xl md:text-3xl font-bold mb-4 group-hover:text-blue-600 transition-colors ${
                      isCompleted ? 'text-green-700 line-through' : 'text-gray-800'
                    }`}>
                      {item.topic}
                    </h2>

                    {/* Explanation */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                      <div className="flex items-start space-x-3 space-x-reverse">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-blue-600 text-sm">💡</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-lg">{item.explanation}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Video Section */}
                      {item.videoUrl && (
                        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                          <div className="flex items-center space-x-2 space-x-reverse mb-4">
                            <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center">
                              <span className="text-red-700">🎥</span>
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg">סרטון הסבר</h3>
                          </div>
                          
                          <div className="aspect-video mb-4 rounded-lg overflow-hidden shadow-md">
                            <iframe
                              className="w-full h-full"
                              src={item.videoUrl.replace("watch?v=", "embed/")}
                              title={`סרטון עבור ${item.topic}`}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                          
                          <a
                            href={item.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-md hover:shadow-lg"
                          >
                            צפה ביוטיוב
                          </a>
                        </div>
                      )}

                      {/* Practice Section */}
                      {item.practiceTip && (
                        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                          <div className="flex items-center space-x-2 space-x-reverse mb-4">
                            <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                              <span className="text-green-700">📝</span>
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg">תרגול מעשי</h3>
                          </div>
                          
                          <p className="text-gray-700 mb-4 leading-relaxed">{item.practiceTip}</p>
                          
                          {item.practiceTip.includes("http") && (
                            <a
                              href={item.practiceTip.match(/https?:\/\/[^\s]+/)?.[0]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-md hover:shadow-lg"
                            >
                              התחל תרגול
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Line */}
                  {index < learningPath.length - 1 && (
                    <div className={`absolute -bottom-4 right-1/2 w-1 h-8 transition-colors ${
                      isCompleted 
                        ? 'bg-green-400' 
                        : 'bg-gray-300'
                    }`}></div>
                  )}
                </div>
                );
              })}

              {/* Completion Message */}
              {progressPercentage === 100 && (
                <div className="bg-green-600 rounded-2xl p-8 text-center text-white shadow-xl">
                  <div className="text-4xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold mb-2">מזל טוב!</h3>
                  <p className="text-green-100 mb-4">סיימת בהצלחה את כל השלבים במסלול הלמידה האישי שלך</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="panels rounded-2xl shadow-xl p-12 max-w-md mx-auto">
                <div className="text-6xl mb-6">🔍</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">לא נמצא מסלול למידה</h3>
                <p className="text-gray-600 mb-6">נראה שעדיין לא ביצעת את מבחני האבחון הנדרשים</p>
                <Link 
                  href="/diagnosis"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  התחל מבחן אבחון
                </Link>
              </div>
            </div>
          )}
        </main>

        {/* Enhanced Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 left-8 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50"
            aria-label="חזור למעלה"
          >
            ↑
          </button>
        )}
      </div>
    </>
  );
}