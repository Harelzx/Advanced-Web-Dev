"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { db } from '../firebase/config';
import { doc, collection, getDocs, setDoc } from 'firebase/firestore';
import { recordPageVisit } from '../components/Badge/BadgeSystem';
import loadingAnimation from "../animations/Loading.json";
import dynamic from 'next/dynamic';
import ProgressSection from '../components/PersonalizedPath/ProgressSection';
import LearningItem from '../components/PersonalizedPath/LearningItem';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function PersonalizedPath() {
  const [learningPath, setLearningPath] = useState(null);
  const [loading, setLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [openIndex, setOpenIndex] = useState(null);

  const toggleOpenIndex = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const fetchLearningPath = useCallback(async () => {
    const userId = typeof window !== 'undefined' ? sessionStorage.getItem('uid') : null;
    if (!userId) {
      setLearningPath([]);
      return;
    }

    setLoading(true);

    try {
      await recordPageVisit(userId, "PersonalizedPath");

      const pathRef = collection(db, 'users', userId, 'learningPath');
      const pathSnapshot = await getDocs(pathRef);

      if (!pathSnapshot.empty) {
        const existingPath = pathSnapshot.docs.map(doc => doc.data());
        setLearningPath(existingPath);
        setLoading(false);
        return;
      }

      const resultsRef = collection(db, 'users', userId, 'results');
      const resultDocs = await getDocs(resultsRef);

      const quizResults = [];
      resultDocs.forEach(docSnap => {
        const subject = docSnap.id;
        const data = docSnap.data();
        if (typeof data.grade === 'number' && data.grade < 100) {
          quizResults.push({ topic: subject, grade: data.grade });
        }
      });

      if (quizResults.length === 0) {
        setLearningPath([]);
        setLoading(false);
        return;
      }

      const result = await fetch('/api/generatePath', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizResults }),
      });

      if (!result.ok) throw new Error(`API returned ${result.status}`);

      const data = await result.json();
      if (data.success && Array.isArray(data.results)) {
        setLearningPath(data.results);
        await Promise.all(
          data.results.map((item, index) =>
            setDoc(doc(pathRef, String(index)), { ...item, createdAt: new Date() })
          )
        );
      } else {
        throw new Error("Invalid learning path response");
      }
    } catch (err) {
      console.error("Error fetching learning path:", err);
      setLearningPath([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLearningPath();
  }, [fetchLearningPath]);

  useEffect(() => {
    if (learningPath) {
      const saved = localStorage.getItem('completedSteps');
      if (saved) {
        setCompletedSteps(new Set(JSON.parse(saved)));
      }
    }
  }, [learningPath]);

  const saveProgress = (newCompletedSteps) => {
    localStorage.setItem('completedSteps', JSON.stringify([...newCompletedSteps]));
  };

  const toggleStepCompletion = (stepIndex) => {
    const newCompletedSteps = new Set(completedSteps);
    if (newCompletedSteps.has(stepIndex)) newCompletedSteps.delete(stepIndex);
    else newCompletedSteps.add(stepIndex);
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
          <h2 className="text-xl font-bold mb-2">טוען מסלול אישי...</h2>
          <p className="text-gray-600">אנא המתן מספר שניות</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen panels" dir="rtl">
      <main className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="text-center py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-green-600 mb-4">מסלול הלמידה האישי שלך</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">מבוסס על תוצאות האבחון שלך</p>
        </div>

        {learningPath && learningPath.length > 0 ? (
          <div className="space-y-8">
            <ProgressSection
              completedSteps={completedSteps.size}
              total={learningPath.length}
              percentage={progressPercentage}
            />

            {learningPath.map((item, index) => (
              <LearningItem
                key={index}
                item={item}
                index={index}
                isCompleted={completedSteps.has(index)}
                toggleStepCompletion={toggleStepCompletion}
                totalItems={learningPath.length}
                isOpen={openIndex === index}
                onToggle={() => toggleOpenIndex(index)}
              />
            ))}

            {progressPercentage === 100 && (
              <div className="bg-green-600 text-white p-8 rounded-2xl shadow-xl text-center">
                <div className="text-4xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold">מזל טוב!</h3>
                <p className="text-green-100 mt-2">סיימת בהצלחה את כל שלבי המסלול</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">לא נמצא מסלול למידה</h3>
              <p className="text-gray-600 mb-6">יכול להיות שקרתה שגיאה או שאין תוצאות אבחון</p>

              <button
                onClick={fetchLearningPath}
                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                נסה שוב ליצור מסלול
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
