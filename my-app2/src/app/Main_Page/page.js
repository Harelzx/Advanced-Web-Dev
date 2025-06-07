"use client";

import Link from 'next/link';
import BadgeCase from '@/app/components/BadgeCase';
import { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { fetchBadges, hasBadge } from '../Logic/fetchBadges';
import { saveBadge } from '../Logic/saveBadge';
import BadgeNotificationModal from '../components/BadgeNotificationModal';
import ProtectedRoute from '../components/ProtectedRoute';
import { difficultyMap } from '@/utils/constants';

export default function MainPage() {
  const [grades, setGrades] = useState({});
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [modules, setModules] = useState([]);
  const [userInfo, setUserInfo] = useState({ fullName: '', school: '' });
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(null);

  const totalSessions = 9;
  const completionPercentage = trainingProgress
    ? Math.round((trainingProgress.completedSessions / totalSessions) * 100)
    : 0;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = sessionStorage.getItem('uid');
        if (!userId) {
          console.error('No user ID found in sessionStorage');
          return;
        }

        // Fetch user info
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUserInfo({
            fullName: userData.name || userData.fullName || userData.email || 'Unknown User',
            school: 'Braude College' // Default school for all users since it's not stored in DB
          });
        }

        // Fetch training progress
        const progressRef = doc(db, 'training_progress', userId);
        const progressSnap = await getDoc(progressRef);
        if (progressSnap.exists()) {
            setTrainingProgress(progressSnap.data());
        }

        // Fetch grades
        const resultsRef = collection(db, `users/${userId}/results`);
        const querySnapshot = await getDocs(resultsRef);
        const subjectGrades = {};
        querySnapshot.forEach((doc) => {
          const subject = doc.id;
          const data = doc.data();
          const grade = data.grade || 0;
          subjectGrades[subject] = grade;
        });
        setGrades(subjectGrades);

        // Check and award First Login badge
        const hasFirstLogin = await hasBadge(userId, "First login");
        if (!hasFirstLogin) {
          const today = new Date().toISOString().split("T")[0];
          await saveBadge(userId, "First login", today);
          setShowBadgeModal(true);
        }

        // Add Math Master badge if average grade is high
        const averageGrade = Object.values(subjectGrades).length > 0 
          ? Object.values(subjectGrades).reduce((a, b) => a + b, 0) / Object.values(subjectGrades).length 
          : 0;
        
        if (averageGrade >= 80) {
          const hasMathMaster = await hasBadge(userId, "Math Master");
          if (!hasMathMaster) {
            const today = new Date().toISOString().split("T")[0];
            await saveBadge(userId, "Math Master", today);
            setShowBadgeModal(true);
          }
        }

        // Fetch updated badges from Firebase
        const badges = await fetchBadges(userId);
        setEarnedBadges(badges);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    // Load saved data from localStorage if exists
    try {
      const saved = localStorage.getItem('completedSteps');
      if (saved) {
        setCompletedSteps(new Set(JSON.parse(saved)));
      }
      const path = localStorage.getItem('learningPath');
      if (path) {
        setModules(JSON.parse(path));
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    
    fetchUserData();
  }, []);

  return (
    <ProtectedRoute allowedRoles={['student']}>
    <main className="p-4 space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center" dir="rtl">
        <h1 className="text-3xl font-bold text-gray-800">ברוך הבא, {userInfo.fullName}!</h1>
        <p className="text-md text-gray-600">מוסד לימודים: {userInfo.school}</p>
      </div>
      <div className="bg-white p-6 border rounded-lg shadow-lg" dir="rtl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">לוח מעקב</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Progress Overview */}
          <div className="bg-gray-100 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">התקדמות כללית</h3>
            <p className="text-gray-600 mb-2">
              השלמת <span className="font-bold text-blue-600">{trainingProgress ? trainingProgress.completedSessions : 0}</span> מתוך <span className="font-bold text-blue-600">{totalSessions}</span> סשנים.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5" dir="ltr">
                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }}></div>
              </div>
              <span className="font-semibold text-blue-600">{completionPercentage}%</span>
            </div>
          </div>
          {/* Next Steps */}
          <div className="bg-gray-100 p-4 rounded-lg shadow text-right">
            <h3 className="text-lg font-semibold text-gray-700">הצעד הבא שלך</h3>
            {trainingProgress && trainingProgress.status !== 'completed' ? (
              <>
                <p className="text-gray-600">
                  המשך ל<span className="font-bold">תרגול מספר {trainingProgress.currentSession}</span>.
                  <br />
                  רמת קושי צפויה: <span className="font-bold">{difficultyMap[trainingProgress.currentSession] || 'לא ידוע'}</span>.
                </p>
                <Link href="/InterStudy">
                  <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                    המשך לתרגול
                  </button>
                </Link>
              </>
            ) : trainingProgress && trainingProgress.status === 'completed' ? (
              <p className="text-gray-600">.כל הכבוד! סיימת את כל תוכנית האימונים שלך🎉</p>
            ) : (
              <p className="text-gray-600">.עליך להשלים את מבחן האבחון הראשוני כדי להתחיל בתרגול</p>
            )}
          </div>
          {/* Quiz Grades by Subject */}
          <div className="bg-gray-100 p-4 rounded-lg shadow md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              תוצאות בחינה ראשונה
              <span role="img" aria-label="quiz">📊</span>
            </h3>
            <ul className="space-y-4">
              {Object.keys(grades).length === 0 ? (
                <li>No grades available.</li>
              ) : (
                Object.entries(grades).map(([subject, grade]) => {
                  let barColor = "bg-red-400";
                  if (grade >= 90) barColor = "bg-green-500";
                  else if (grade >= 75) barColor = "bg-yellow-400";
                  else if (grade >= 50) barColor = "bg-blue-400";

                  return (
                    <li key={subject} className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">{subject}</span>
                        <span className={`font-bold ${grade >= 90 ? "text-green-600" : grade >= 75 ? "text-yellow-600" : grade >= 50 ? "text-blue-600" : "text-red-600"}`}>
                          {grade}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-3" dir="ltr">
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
        </div>
      </div>
      <div className="bg-white p-6 border rounded-lg shadow-lg">
        <BadgeCase
          earnedBadges={earnedBadges}
          fullName={userInfo.fullName}
          school={userInfo.school}
        />
      </div>

      {/* Badge Notification Modal */}
      <BadgeNotificationModal 
        show={showBadgeModal} 
        onClose={() => setShowBadgeModal(false)} 
      />
    </main>
    </ProtectedRoute>
  );
}