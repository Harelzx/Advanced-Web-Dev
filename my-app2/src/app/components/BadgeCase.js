"use client";

import dynamic from "next/dynamic";
import bookAnim from "../animations/book.json";
import calendarAnim from "../animations/calendar.json";
import mathAnim from "../animations/math.json";
import puzzleAnim from "../animations/puzzle.json";
import trophyAnim from "../animations/trophy.json";
import { FaLock } from "react-icons/fa";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const allBadges = [
  { 
    label: "Math Master", 
    color: "bg-green-500", 
    anim: mathAnim,
    description: "Complete 10 math quizzes with a score of 90% or higher"
  },
  { 
    label: "First login", 
    color: "bg-blue-500", 
    anim: calendarAnim,
    description: "Welcome to the platform! Complete your first login"
  },
  { 
    label: "Daily Login", 
    color: "bg-yellow-500", 
    anim: calendarAnim,
    description: "Log in for 7 consecutive days"
  },
  { 
    label: "Book Worm", 
    color: "bg-purple-500", 
    anim: bookAnim,
    description: "Read 20 articles or books in the library"
  },
  { 
    label: "Champion", 
    color: "bg-red-500", 
    anim: trophyAnim,
    description: "Win 3 competitions in any subject"
  },
  { 
    label: "Puzzle Solver", 
    color: "bg-pink-500", 
    anim: puzzleAnim,
    description: "Solve 15 puzzles with no hints"
  },
];

export default function BadgeCase({ earnedBadges = [], fullName, school }) {
  // Format date for display (e.g., "June 1, 2025")
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow">
      <h3 className="text-xl font-bold mb-6 text-stone-800 text-center">Badges Earned</h3>
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
                  Earned: {formatDate(dateEarned)}
                </span>
              )}
              {/* Tooltip */}
              <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300 bottom-full mb-2 w-40 p-2 bg-black text-white text-xs rounded-lg shadow-lg text-center z-10">
                {badge.description}
                {earned && dateEarned && (
                  <div className="mt-1">Earned on: {formatDate(dateEarned)}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}