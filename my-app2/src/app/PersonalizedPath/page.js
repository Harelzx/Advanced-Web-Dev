"use client";
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import loadingAnimation from "../animations/Loading.json";
import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function PersonalizedPath() {
  const [learningPath, setLearningPath] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLearningPath() {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.log('No user is currently logged in');
          setTimeout(() => setLoading(false), 2000); 
          return;
        }

        const userId = currentUser.uid;
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.log(`User ${userId} not found.`);
          setTimeout(() => setLoading(false), 2000); 
          return;
        }

        const userData = userSnap.data();

        if (Array.isArray(userData.learningPath)) {
          setLearningPath(userData.learningPath);
          setTimeout(() => setLoading(false), 2000); 
          return;
        }

        if (userData.intialQiuzDone) {
          const result = await fetch('/api-ai/generatePath.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quizResults: userData.initialQuizResults }),
          });

          if (!result.ok) {
            throw new Error(`API returned ${result.status}`);
          }

          const generatedPath = await result.json();
          await updateDoc(userRef, { learningPath: generatedPath });
          setLearningPath(generatedPath);
          setTimeout(() => setLoading(false), 2000); 
          return;
        }

        setLearningPath([]);
        setTimeout(() => setLoading(false), 2000); 
      } catch (err) {
        console.error("Error in fetchLearningPath:", err);
        setLearningPath([]);
        setTimeout(() => setLoading(false), 2000); 
      }
    }

    fetchLearningPath();
  }, []);

  if (loading) {
    return (
      <div className="text-center p-6 flex flex-col items-center justify-center">
        <div className="w-32 h-32 mb-4">
          <Lottie animationData={loadingAnimation} loop={true} autoplay={true}  />
        </div>
        <p className="text-lg text-gray-700">Loading learning path...</p>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center text-gray-800">Your Personalized Learning Path</h1>

      {learningPath && learningPath.length > 0 ? (
        learningPath.map((item, index) => (
          <div key={index} className="p-4 border rounded shadow bg-white">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{item.topic}</h2>
            <p className="text-gray-700 mb-2">{item.explanation}</p>
            <a
              href={item.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline mb-2 block"
            >
              Watch Video
            </a>
            <p className="text-sm text-gray-600">Practice: {item.practiceTip}</p>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">No learning path available.</p>
      )}
    </main>
  );
}
