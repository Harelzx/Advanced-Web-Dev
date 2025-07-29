"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import calendarAnim from "../../animations/calendar.json";
import Explorer from "../../animations/explorer.json";
import Confetti from "react-confetti";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const badgeAnimations = {
  "התחברות ראשונה": calendarAnim,
  "חוקר": Explorer,
  // Add other badge animations here as needed
};

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
        className="panels p-6 rounded-lg shadow-lg text-center relative overflow-hidden"
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