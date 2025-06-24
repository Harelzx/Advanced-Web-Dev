"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../firebase/config';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { fetchBadges, hasBadge, saveBadge, recordPageVisit, checkExplorerBadge } from '../components/Badge/BadgeSystem';
import BadgeNotificationModal from '../components/Badge/BadgeNotificationModal';
import BadgeCase from '@/app/components/Badge/BadgeCase'; 
import DashboardLayout from '../components/dashboard/DashboardLayout'; 
import NextPracticeCard from '../components/mainpage-ui/NextPracticeCard'; 
import OverallProgress from '../components/mainpage-ui/OverallProgress'; 

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
      <DashboardLayout
        userRole="student"
        userName={user.fullName}
        headerText="ברוכים הבאים לדף הראשי שלך!"
        layoutType="compact"
        showRole={true}
        showRefreshButton={false}
        roleLabel="שם מלא"
      >
        <div className="space-y-4" dir="rtl">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
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
                    <span className="font-medium text-gray-700">{subject}</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-3">
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
              <NextPracticeCard sessionNumber={trainingProgress?.currentSession || 1} />
            </div>
            <div>
              <OverallProgress completedSessions={trainingProgress?.completedSessions || 0} />
            </div>
          </div>
        </div>
      </DashboardLayout>
      <div className="panels p-4 border rounded-lg shadow-lg" style={{ minHeight: '500px', maxWidth: 'calc(100% - 15px)', margin: '20px auto' }}>
        <BadgeCase earnedBadges={earnedBadges} fullName={user.fullName} school={user.school} />
      </div>
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