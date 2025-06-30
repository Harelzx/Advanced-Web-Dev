"use client";

import DashboardLayout from '../components/dashboard/DashboardLayout';
import NextPracticeCard from '../components/mainpage-ui/NextPracticeCard';
import OverallProgress from '../components/mainpage-ui/OverallProgress';
import BadgeCase from '@/app/components/Badge/BadgeCase';
import BadgeNotificationModal from '../components/Badge/BadgeNotificationModal';
import { useMainPageLogic } from '@/app/hooks/useMainPageLogic';

export default function MainPage() {
  const {
    user,
    grades,
    earnedBadges,
    showBadgeModal,
    newBadgeLabel,
    trainingProgress,
    setShowBadgeModal,
    setNewBadgeLabel
  } = useMainPageLogic();

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