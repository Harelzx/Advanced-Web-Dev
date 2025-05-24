import { FaCalculator, FaFlask, FaCalendarCheck, FaBook, FaTrophy, FaPuzzlePiece, FaLock } from "react-icons/fa";

const allBadges = [
  { 
    label: "Math Master", 
    color: "bg-green-500", 
    icon: <FaCalculator />,
    description: "Complete 10 math quizzes with a score of 90% or higher"
  },
  { 
    label: "Science Star", 
    color: "bg-blue-500", 
    icon: <FaFlask />,
    description: "Achieve a perfect score on 5 science experiments"
  },
  { 
    label: "Daily Login", 
    color: "bg-yellow-500", 
    icon: <FaCalendarCheck />,
    description: "Log in for 7 consecutive days"
  },
  { 
    label: "Book Worm", 
    color: "bg-purple-500", 
    icon: <FaBook />,
    description: "Read 20 articles or books in the library"
  },
  { 
    label: "Champion", 
    color: "bg-red-500", 
    icon: <FaTrophy />,
    description: "Win 3 competitions in any subject"
  },
  { 
    label: "Puzzle Solver", 
    color: "bg-pink-500", 
    icon: <FaPuzzlePiece />,
    description: "Solve 15 puzzles with no hints"
  },
];

export default function BadgeCase({ earnedBadges = [], fullName, school }) {
  return (
    <div className="w-full max-w-2xl mx-auto bg-gradient-to-br from-[#f7e9c6] to-[#e0c97f] rounded-3xl border-8 border-[#bfa76f] shadow-2xl p-8 mt-8">
      <div className="mb-6 text-center">
        <div className="font-bold">Full name: <span className="font-normal">{fullName}</span></div>
        <div className="font-bold">School: <span className="font-normal">{school}</span></div>
      </div>
      <h3 className="text-xl font-bold mb-4 text-stone-700 text-center">Badges Earned</h3>
      <div className="grid grid-cols-3 grid-rows-2 gap-8 p-6">
        {allBadges.map((badge) => {
          const earned = earnedBadges.includes(badge.label);
          return (
            <div
              key={badge.label}
              className="relative group flex flex-col items-center justify-center rounded-full w-24 h-24 shadow-lg border-4 ${earned ? badge.color + ' border-white' : 'bg-gray-300 opacity-50 border-gray-400'}"
            >
              <span className="text-4xl mb-2">
                {earned ? badge.icon : <FaLock />}
              </span>
              <span className="text-center text-xs font-bold">
                {badge.label}
              </span>
              {/* Tooltip */}
              <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300 bottom-full mb-2 w-48 p-2 bg-white text-black text-xs rounded-lg shadow-lg text-center z-10">
                {badge.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}