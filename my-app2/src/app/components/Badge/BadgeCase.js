"use client";

import dynamic from "next/dynamic";
import bookAnim from "../../animations/book.json";
import calendarAnim from "../../animations/calendar.json";
import streak from "../../animations/Streak.json";
import Explorer from "../../animations/explorer.json";
import puzzleAnim from "../../animations/puzzle.json";
import trophyAnim from "../../animations/trophy.json";
import { FaLock } from "react-icons/fa";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const allBadges = [
  { 
    label: "חוקר", 
    color: "bg-green-500", 
    anim: Explorer,
    description: "חקור כל עמוד בפלטפורמה"
  },
  { 
    label: "התחברות ראשונה", 
    color: "bg-blue-500", 
    anim: calendarAnim,
    description: "ברוכים הבאים לפלטפורמה! השלם את ההתחברות הראשונה שלך"
  },
  { 
    label: "התחברות יומית", 
    color: "bg-yellow-500", 
    anim: streak,
    description: "התחבר במשך 3 ימים רצופים"
  },
  { 
    label: "בקרוב (תולעת ספרים)", 
    color: "bg-purple-500", 
    anim: bookAnim,
    description: "בקרוב! הישארו מעודכנים לעדכונים"
  },
  { 
    label: "בקרוב (מאסטר לוח שנה)", 
    color: "bg-red-500", 
    anim: trophyAnim,
    description: "בקרוב! הישארו מעודכנים לעדכונים"
  },
  { 
    label: "בקרוב (מאסטר פאזלים)", 
    color: "bg-pink-500", 
    anim: puzzleAnim,
    description: "בקרוב! הישארו מעודכנים לעדכונים"
  },
];

export default function BadgeDisplay({ earnedBadges = [], fullName, school }) {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("he-IL", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="panels p-4 rounded-lg shadow" dir="rtl">
      <div className="mb-6 text-center">
      </div>
      <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100 text-center">תגים שהושגו</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 p-4">
        {allBadges.map((badge) => {
          const earnedBadge = earnedBadges.find(b => b.label === badge.label);
          const earned = !!earnedBadge;
          const dateEarned = earnedBadge?.dateEarned;
          return (
            <div
              key={badge.label}
              className="relative group flex flex-col items-center justify-center"
            >
              <div className={`mb-2 w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full ${!earned ? 'bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600' : ''}`}>
                {earned ? (
                  <Lottie animationData={badge.anim} loop={true} />
                ) : (
                  <FaLock className="w-8 h-8 md:w-10 md:h-10 text-gray-600 dark:text-gray-300" />
                )}
              </div>
              <span className={`text-center text-xs md:text-sm font-semibold leading-tight ${earned ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                {badge.label}
              </span>
              {earned && dateEarned && (
                <span className="text-center text-xs text-gray-600 dark:text-gray-400 mt-1">
                  הושג ב: {formatDate(dateEarned)}
                </span>
              )}
              <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300 bottom-full mb-2 w-40 p-2 bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 text-xs rounded-lg shadow-lg text-center z-10">
                {badge.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}