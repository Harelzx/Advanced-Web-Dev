'use client';

import BadgeNotificationModal from '../components/Badge/BadgeNotificationModal';
import BadgeCase from '@/app/components/Badge/BadgeCase';
import MainPageLayout from '../components/mainpage-ui/MainPageLayout';
import NextPracticeCard from '../components/mainpage-ui/NextPracticeCard';
import OverallProgress from '../components/mainpage-ui/OverallProgress';
import { useMainPageLogic } from '@/app/hooks/useMainPageLogic';

export default function MainPage() {
  const {
    user,
    grades,
    earnedBadges,
    showBadgeModal,
    newBadgeLabel,
    trainingProgress,
    nextSession,
    setShowBadgeModal,
    setNewBadgeLabel,
  } = useMainPageLogic();

  return (
    <>
      <MainPageLayout userName={user.fullName}>
        <div className="space-y-4" dir="rtl">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <span role="img" aria-label="quiz">📊</span>
              תוצאות בחינה ראשונה
            </h3>
            {Object.entries(grades).map(([subject, grade]) => {
              let barColor = 'bg-red-400';
              if (grade >= 90) barColor = 'bg-green-500';
              else if (grade >= 75) barColor = 'bg-yellow-400';
              else if (grade >= 50) barColor = 'bg-blue-400';

              return (
                <div key={subject} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span
                      className={`font-bold ${
                        grade >= 90
                          ? 'text-green-600'
                          : grade >= 75
                          ? 'text-yellow-600'
                          : grade >= 50
                          ? 'text-blue-600'
                          : 'text-red-600'
                      }`}
                    >
                      {grade}%
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{subject}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
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
            <div className="order-2 md:order-1">
              <NextPracticeCard sessionNumber={nextSession} />
            </div>
            <div className="order-1 md:order-2">
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