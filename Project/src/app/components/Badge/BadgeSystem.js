"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import calendarAnim from "../../animations/calendar.json";
import Explorer from "../../animations/explorer.json";
import Confetti from "react-confetti";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

// Badge animations mapping
const badgeAnimations = {
  "התחברות ראשונה": calendarAnim,
  "חוקר": Explorer,
  // Add other badge animations here as needed
};

// Fetch badges for a user from Firestore
export async function fetchBadges(userId) {
  const badgesCol = collection(db, "users", userId, "badges");
  const badgeSnapshot = await getDocs(badgesCol);
  const badges = badgeSnapshot.docs.map(doc => {
    const data = doc.data();
    let dateEarned = data.dateEarned;

    if (dateEarned && typeof dateEarned === "string") {
      const date = new Date(dateEarned);
      if (!isNaN(date.getTime())) {
        dateEarned = date.toISOString().split("T")[0];
      } else {
        dateEarned = null;
      }
    }
    return {
      label: data.label,
      dateEarned: dateEarned
    };
  });
  return badges;
}

// Check if a user has a specific badge
export async function hasBadge(userId, badgeLabel) {
  const badges = await fetchBadges(userId);
  return badges.some(badge => badge.label === badgeLabel);
}

// Save a badge for a user in Firestore
export async function saveBadge(userId, badgeLabel, dateEarned) {
  const badgeRef = doc(db, "users", userId, "badges", badgeLabel);
  await setDoc(badgeRef, {
    label: badgeLabel,
    dateEarned: dateEarned || new Date().toISOString().split("T")[0], // Default to today’s date
  });
}

// Record a page visit for a user
export async function recordPageVisit(userId, pageName) {
  const visitRef = doc(db, "users", userId, "pageVisits", pageName);
  await setDoc(visitRef, {
    pageName,
    visitedAt: new Date().toISOString(),
  });
}


// Check if a user has earned the Explorer badge by visiting all required pages
export async function checkExplorerBadge(userId) {
  const requiredPages = ["Main_Page", "PersonalizedPath", "InterStudy"];
  const pageVisitsRef = collection(db, "users", userId, "pageVisits");
  const pageVisitsSnapshot = await getDocs(pageVisitsRef);
  const visitedPages = pageVisitsSnapshot.docs.map(doc => doc.id);

  const hasVisitedAll = requiredPages.every(page => visitedPages.includes(page));
  if (hasVisitedAll) {
    const today = new Date().toISOString().split("T")[0];
    await saveBadge(userId, "חוקר", today);
    return true;
  }
  return false;
}

// Badge Notification Modal Component
export default function BadgeNotificationModal({ show, onClose, badgeLabel }) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  if (!show || !badgeLabel) return null;

  const animationData = badgeAnimations[badgeLabel] || calendarAnim; // Fallback to calendarAnim

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="
         p-6 rounded-lg shadow-lg text-center relative overflow-hidden"
        dir="rtl"
      >
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.2}
        />
        <h3 className="text-xl font-bold text-gray-800 mb-4">מזל טוב!</h3>
        <p className="text-gray-600 mb-4">
          הרווחת את התג <span className="font-semibold">{badgeLabel}</span>!
        </p>
        <div className="w-32 h-32 mx-auto mb-4">
          <Lottie animationData={animationData} loop={true} />
        </div>
        <button
          onClick={onClose}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          סגור
        </button>
      </div>
    </div>
  );
}