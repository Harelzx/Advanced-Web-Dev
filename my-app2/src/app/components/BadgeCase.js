import { FaCalculator, FaFlask, FaCalendarCheck, FaBook, FaTrophy, FaPuzzlePiece, FaLock } from "react-icons/fa";

const allBadges = [
  { label: "Math Master", color: "bg-green-500", icon: <FaCalculator /> },
  { label: "Science Star", color: "bg-blue-500", icon: <FaFlask /> },
  { label: "Daily Login", color: "bg-yellow-500", icon: <FaCalendarCheck /> },
  { label: "Book Worm", color: "bg-purple-500", icon: <FaBook /> },
  { label: "Champion", color: "bg-red-500", icon: <FaTrophy /> },
  { label: "Puzzle Solver", color: "bg-pink-500", icon: <FaPuzzlePiece /> },
];

export default function BadgeCase({ earnedBadges = [], fullName, school }) {
  return (
    <div className="w-full max-w-2xl mx-auto bg-gradient-to-br from-[#f7e9c6] to-[#e0c97f] rounded-3xl border-8 border-[#bfa76f] shadow-2xl p-8 mt-8">
      <div className="mb-6">
        <div className="font-bold">Full name: <span className="font-normal">{fullName}</span></div>
        <div className="font-bold">School: <span className="font-normal">{school}</span></div>
      </div>
      <h3 className="text-xl font-bold mb-4 text-stone-700 text-left">Badges Earned</h3>
      <div className="grid grid-cols-3 grid-rows-2 gap-8 p-6">
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
  );
}