"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../firebase/config';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { fetchBadges, hasBadge, saveBadge, recordPageVisit, checkExplorerBadge } from '../components/Badge/BadgeSystem';
import BadgeNotificationModal from '../components/Badge/BadgeNotificationModal';
import BadgeCase from '@/app/components/Badge/BadgeCase'; 
import MainPageLayout from '../components/mainpage-ui/MainPageLayout'; 
import NextPracticeCard from '../components/mainpage-ui/NextPracticeCard'; 
import OverallProgress from '../components/mainpage-ui/OverallProgress'; 

// Helper function to determine available sessions based on completed sessions
const getAvailableSessions = (completedSessions) => {
  // Ensure completedSessions is an array
  const completed = Array.isArray(completedSessions) ? completedSessions : [];
  const available = new Set();

  // Always available
  available.add(1); // session 1 easy

  // Unlocking logic
  if (completed.includes(1)) {
    available.add(2); // session 2 easy
    available.add(4); // session 1 medium
  }
  if (completed.includes(2)) {
    available.add(3); // session 3 easy
    available.add(5); // session 2 medium
  }
  if (completed.includes(4)) {
    available.add(5); // session 2 medium
    available.add(7); // session 1 hard
  }
  if (completed.includes(5)) {
    available.add(6); // session 3 medium
    available.add(8); // session 2 hard
  }
  if (completed.includes(7)) {
    available.add(8); // session 2 hard
  }
  if (completed.includes(8)) {
    available.add(9); // session 3 hard
  }

  return Array.from(available);
};

export default function MainPage() {
  const [user, setUser] = useState({ fullName: 'טוען...', school: 'Braude' });
  const [grades, setGrades] = useState({});
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [newBadgeLabel, setNewBadgeLabel] = useState(null);
  const [trainingProgress, setTrainingProgress] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = sessionStorage.getItem('uid');
        if (!userId) {
          router.push('/login');
          return;
        }

        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUser({ fullName: userDocSnap.data().fullName || 'משתמש' });
        } else {
          sessionStorage.removeItem('uid');
          router.push('/login');
          return;
        }

        const progressRef = doc(db, 'users', userId, 'training_progress', 'plan_1');
        const progressSnap = await getDoc(progressRef);
        if (progressSnap.exists()) {
          setTrainingProgress(progressSnap.data());
        } else {
          setTrainingProgress({ currentSession: 1, completedSessions: 0 });
        }

        const resultsRef = collection(db, `users/${userId}/results`);
        const querySnapshot = await getDocs(resultsRef);
        const subjectGrades = {};
        querySnapshot.forEach((doc) => {
          subjectGrades[doc.id] = doc.data().grade || 0;
        });
        setGrades(subjectGrades);

        // Record visit to Main_Page
        await recordPageVisit(userId, "Main_Page");

        // Check for First Login badge
        const hasFirstLogin = await hasBadge(userId, "התחברות ראשונה");
        if (!hasFirstLogin) {
          const today = new Date().toISOString().split("T")[0];
          await saveBadge(userId, "התחברות ראשונה", today);
          setNewBadgeLabel("התחברות ראשונה");
          setShowBadgeModal(true);
        }

        // Check for Explorer badge
        const hasExplorerBadge = await hasBadge(userId, "חוקר");
        if (!hasExplorerBadge) {
          const earnedExplorer = await checkExplorerBadge(userId);
          if (earnedExplorer) {
            setNewBadgeLabel("חוקר");
            setShowBadgeModal(true);
          }
        }

        const badges = await fetchBadges(userId);
        setEarnedBadges(badges);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [router]);

  return (
    <>
      <MainPageLayout
        userName={user.fullName}
      >
        <div className="space-y-4" dir="rtl">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <span role="img" aria-label="quiz">📊</span>
              תוצאות בחינה ראשונה
            </h3>
            {Object.entries(grades).map(([subject, grade]) => {
              let barColor = "bg-red-400";
              if (grade >= 90) barColor = "bg-green-500";
              else if (grade >= 75) barColor = "bg-yellow-400";
              else if (grade >= 50) barColor = "bg-blue-400";

              return (
                <div key={subject} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className={`font-bold ${grade >= 90 ? "text-green-600" : grade >= 75 ? "text-yellow-600" : grade >= 50 ? "text-blue-600" : "text-red-600"}`}>
                      {grade}%
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{subject}</span>
                  </div>
                  <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-3">
                    <div
                      className={`${barColor} h-3 rounded-full transition-all`}
                      style={{ width: `${grade}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <NextPracticeCard sessionNumber={(() => {
                if (!trainingProgress?.completedSessions) return 1;
                const availableSessions = getAvailableSessions(trainingProgress.completedSessions);
                const nextSession = availableSessions
                  .filter(s => !trainingProgress.completedSessions.includes(s))
                  .sort((a, b) => a - b)[0];
                return nextSession || 10; // 10 means all sessions completed
              })()} />
            </div>
            <div>
              <OverallProgress completedSessions={trainingProgress?.completedSessions?.length || 0} />
            </div>
          </div>
          
          {/* Badge Case */}
          <div className="mt-6">
            <BadgeCase earnedBadges={earnedBadges} fullName={user.fullName} school={user.school} />
          </div>
        </div>
      </MainPageLayout>
      <BadgeNotificationModal
        show={showBadgeModal}
        onClose={() => {
          setShowBadgeModal(false);
          setNewBadgeLabel(null);
        }}
        badgeLabel={newBadgeLabel}
      />
    </>
  );
}