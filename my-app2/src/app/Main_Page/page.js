"use client";

import Link from 'next/link';
import BadgeCase from '@/app/components/BadgeCase';
import { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import {collection, getDocs,} from 'firebase/firestore';

const earnedBadges = ["Math Master", "Daily Login"];
const user = {
  fullName: "Jacob Shulman",
  school: "Braude College"
};

export default function MainPage() {
    const [grades, setGrades] = useState({});
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const userId = sessionStorage.getItem('uid');
        const resultsRef = collection(db, `users/${userId}/results`);
        const querySnapshot = await getDocs(resultsRef);

        // Use document ID as subject name and grade field as value
        const subjectGrades = {};
        querySnapshot.forEach((doc) => {
          const subject = doc.id; // Document ID is the subject name
          const data = doc.data();
          const grade = data.grade || 0;
          subjectGrades[subject] = grade;
        });

        setGrades(subjectGrades);
      } catch (error) {
        console.error('Error fetching grades:', error);
      }
    };
    const saved = localStorage.getItem('completedSteps');
    if (saved) {
      setCompletedSteps(new Set(JSON.parse(saved)));
    }
    const path = localStorage.getItem('learningPath');
    if (path) {
      setModules(JSON.parse(path));
    }
    fetchGrades();
  }, []);

  return (
    <main className="p-4 space-y-6">
      <div className="bg-white p-6 border rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Tracker Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Progress Overview */}
          <div className="bg-gray-100 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Overall Progress</h3>
            <p className="text-gray-600">Completion Rate: <span className="font-bold text-green-600">75%</span></p>
            <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
              <div className="bg-green-500 h-4 rounded-full" style={{ width: "75%" }}></div>
            </div>
          </div>
          {/* Module Completion */}
          <div className="bg-gray-100 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Completed Modules</h3>
            <ul className="text-gray-600">
              <li>Math Basics - <span className="font-bold text-green-600">Completed</span></li>
              <li>Science Foundations - <span className="font-bold text-yellow-600">In Progress</span></li>
              <li>Reading Skills - <span className="font-bold text-red-600">Not Started</span></li>
            </ul>
          </div>
          {/* Quiz Grades by Subject */}
          <div className="bg-gray-100 p-4 rounded-lg shadow md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2 justify-end">
              <span role="img" aria-label="quiz">📊</span>
              תוצאות בחינה ראשונה
            </h3>
            <ul className="space-y-4">
              {Object.keys(grades).length === 0 ? (
                <li>No grades available.</li>
              ) : (
                 Object.entries(grades).map(([subject, grade]) => {
                  // Color based on grade
                  let barColor = "bg-red-400";
                  if (grade >= 90) barColor = "bg-green-500";
                  else if (grade >= 75) barColor = "bg-yellow-400";
                  else if (grade >= 50) barColor = "bg-blue-400";

                  return (
                    <li key={subject} className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className={`font-bold ${grade >= 90 ? "text-green-600" : grade >= 75 ? "text-yellow-600" : grade >= 50 ? "text-blue-600" : "text-red-600"}`}>
                          {grade}%
                        </span>
                        <span className="font-medium text-gray-700">{subject}</span>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-3">
                        <div
                          className={`${barColor} h-3 rounded-full transition-all`}
                          style={{ width: `${grade}%` }}
                        ></div>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
          {/* Next Steps */}
          <div className="bg-gray-100 p-4 rounded-lg shadow md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-700">Next Steps</h3>
            <p className="text-gray-600">Complete Science Foundations module by May 28, 2025.</p>
            <Link href="/StudyModules">
              <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                Continue Learning
              </button>
            </Link>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 border rounded-lg shadow-lg">
        <BadgeCase
          earnedBadges={earnedBadges}
          fullName={user.fullName}
          school={user.school}
        />
      </div>
    </main>
  );
}