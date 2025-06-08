'use client';

import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import { SESSION_CONFIG } from '@/utils/constants';

/**
 * A card that shows the user's next practice session and a button to start it.
 * @param {number} sessionNumber - The upcoming session number.
 */
export default function NextPracticeCard({ sessionNumber }) {
  if (!sessionNumber || sessionNumber > 9) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg shadow w-full h-full flex flex-col items-center justify-center text-center" dir="rtl">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">סיימת את כל התרגולים!</h3>
        <p className="text-gray-600">כל הכבוד על ההתמדה וההישג המרשים.</p>
      </div>
    );
  }
  
  const config = SESSION_CONFIG[sessionNumber];
  const difficultyName = config?.name || 'לא ידוע';
  
  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow w-full h-full flex flex-col" dir="rtl">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">התרגול הבא שלך</h3>
      <p className="text-gray-600 mb-4 flex-grow">
        תרגול מספר <span className="font-bold">{sessionNumber}</span> - רמת קושי: <span className="font-bold">{difficultyName}</span>
      </p>
      
      <Link href="/InterStudy">
        <button className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 transition-transform transform hover:scale-105 duration-300 flex items-center justify-center gap-2">
          <span>להתחלת התרגול</span>
          <FaArrowLeft />
        </button>
      </Link>
    </div>
  );
} 