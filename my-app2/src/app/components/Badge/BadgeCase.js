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
    <div className="bg-gray-100 p-4 rounded-lg shadow" dir="rtl">
      <div className="mb-6 text-center text-stone-700">
      </div>
      <h3 className="text-xl font-bold mb-6 text-stone-800 text-center">תגים שהושגו</h3>
      <div className="grid grid-cols-3 gap-6 p-4">
        {allBadges.map((badge) => {
          const earnedBadge = earnedBadges.find(b => b.label === badge.label);
          const earned = !!earnedBadge;
          const dateEarned = earnedBadge?.dateEarned;
          return (
            <div
              key={badge.label}
              className="relative group flex flex-col items-center justify-center"
            >
              <div className="mb-1 w-30 h-30 flex items-center justify-center">
                {earned ? (
                  <Lottie animationData={badge.anim} loop={true} />
                ) : (
                  <FaLock className="w-15 h-12 text-2xl text-gray-800" />
                )}
              </div>
              <span className="text-center text-sm font-semibold text-gray-800">
                {badge.label}
              </span>
              {earned && dateEarned && (
                <span className="text-center text-xs text-gray-600 mt-1">
                  הושג ב: {formatDate(dateEarned)}
                </span>
              )}
              <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300 bottom-full mb-2 w-40 p-2 bg-black text-white text-xs rounded-lg shadow-lg text-center z-10">
                {badge.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}