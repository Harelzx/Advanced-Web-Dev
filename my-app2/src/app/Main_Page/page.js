"use client";

import Link from 'next/link';
import BadgeCase from '@/app/components/BadgeCase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../firebase/config';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { fetchBadges, hasBadge } from '../Logic/fetchBadges';
import { saveBadge } from '../Logic/saveBadge';
import BadgeNotificationModal from '../components/BadgeNotificationModal';
import OverallProgress from '../components/mainpage-ui/OverallProgress';
import NextPracticeCard from '../components/mainpage-ui/NextPracticeCard';

export default function MainPage() {
  const [user, setUser] = useState({ fullName: 'טוען...', school: 'Braude' });
  const [grades, setGrades] = useState({});
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = sessionStorage.getItem('uid');
        if (!userId) {
          console.error('No user ID found in sessionStorage');
          router.push('/login');
          return;
        }

        // Fetch user data
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUser({
            fullName: userData.fullName || 'משתמש',
            school: "Braude"
          });
        } else {
          console.log("No such user document! Redirecting to login.");
          sessionStorage.removeItem('uid');
          router.push('/login');
          return;
        }

        // Fetch training progress
        const progressRef = doc(db, 'users', userId, 'training_progress', 'plan_1');
        const progressSnap = await getDoc(progressRef);
        if (progressSnap.exists()) {
          setTrainingProgress(progressSnap.data());
        } else {
          // If no progress, set a default state to indicate the user can start session 1
          setTrainingProgress({ currentSession: 1, completedSessions: 0 });
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

        // Fetch updated badges
        const badges = await fetchBadges(userId);
        setEarnedBadges(badges);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <main className="p-4 space-y-6" dir="rtl">
      <div className="bg-white p-6 border rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">לוח הבקרה שלי</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Training Progress Components */}
          {trainingProgress && (
            <>
              <div>
                <NextPracticeCard sessionNumber={trainingProgress.currentSession} />
              </div>
              <div>
                <OverallProgress completedSessions={trainingProgress.completedSessions} />
              </div>
            </>
          )}

          {/* Quiz Grades by Subject */}
          <div className="bg-gray-100 p-4 rounded-lg shadow md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span role="img" aria-label="quiz">📊</span>
              תוצאות בחינה ראשונה
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
        </div>
      </div>
      <div className="bg-white p-6 border rounded-lg shadow-lg">
        <BadgeCase
          earnedBadges={earnedBadges}
          fullName={user.fullName}
          school={user.school}
        />
      </div>
      <BadgeNotificationModal
        show={showBadgeModal}
        onClose={() => setShowBadgeModal(false)}
      />
    </main>
  );
}