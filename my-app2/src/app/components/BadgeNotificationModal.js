"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import calendarAnim from "../animations/calendar.json"; // Animation for Daily Login
import Confetti from "react-confetti";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function BadgeNotificationModal({ show, onClose }) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center relative overflow-hidden">
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.2}
        />
        <h3 className="text-xl font-bold text-gray-800 mb-4">Congratulations!</h3>
        <p className="text-gray-600 mb-4">You’ve earned the <span className="font-semibold">Daily Login</span> badge!</p>
        <div className="w-32 h-32 mx-auto mb-4">
          <Lottie animationData={calendarAnim} loop={true} />
        </div>
        <button
          onClick={onClose}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  );
}