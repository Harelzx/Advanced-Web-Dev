import { FaCalculator, FaFlask, FaCalendarCheck, FaBook, FaTrophy, FaPuzzlePiece, FaLock } from "react-icons/fa";

const allBadges = [
  { label: "Math Master", color: "bg-green-500", icon: <FaCalculator /> },
  { label: "Science Star", color: "bg-blue-500", icon: <FaFlask /> },
  { label: "Daily Login", color: "bg-yellow-500", icon: <FaCalendarCheck /> },
  { label: "Book Worm", color: "bg-purple-500", icon: <FaBook /> },
  { label: "Champion", color: "bg-red-500", icon: <FaTrophy /> },
  { label: "Puzzle Solver", color: "bg-pink-500", icon: <FaPuzzlePiece /> },
];

export default function BadgeCase({ earnedBadges = [] }) {
  return (
    <div className="badge-case-container flex justify-center">
      <div className="relative p-4 bg-gradient-to-br from-stone-300 to-stone-100 rounded-3xl border-8 border-stone-500 shadow-2xl min-w-[400px]">
        <div className="grid grid-cols-2 grid-rows-3 gap-8 p-6">
          {allBadges.map((badge) => {
            const earned = earnedBadges.includes(badge.label);
            return (
              <div
                key={badge.label}
                className={`flex flex-col items-center justify-center rounded-full w-24 h-24 shadow-lg border-4 ${
                  earned ? badge.color + " border-white" : "bg-gray-300 opacity-50 border-gray-400"
                }`}
              >
                <span className="text-4xl mb-2">
                  {earned ? badge.icon : <FaLock />}
                </span>
                <span className="text-center text-xs font-bold">
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}