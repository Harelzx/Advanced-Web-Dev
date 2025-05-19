import Image from "next/image";

const allBadges = [
  { label: "Math Master", color: "bg-green-500", icon: "/icons/math.png" },
  { label: "Science Star", color: "bg-blue-500", icon: "/icons/science.png" },
  { label: "Daily Login", color: "bg-yellow-500", icon: "/icons/login.png" },
  // Add more themed badges here
];

export default function BadgeCase({ earnedBadges = [] }) {
  return (
    <div className="badge-case grid grid-cols-3 gap-4 p-4 bg-stone-100 rounded-lg justify-items-center">
      {allBadges.map((badge) => {
        const earned = earnedBadges.includes(badge.label);
        return (
          <div
            key={badge.label}
            className={`flex flex-col items-center p-2 rounded w-28 ${earned ? badge.color : "bg-gray-300 opacity-50"}`}
          >
            <div className="flex justify-center w-full">
              <Image src={badge.icon} alt={badge.label} width={40} height={40} />
            </div>
            <span className="mt-2 text-center">{badge.label}</span>
            {!earned && <span className="text-xs text-gray-500 text-center">Locked</span>}
          </div>
        );
      })}
    </div>
  );
}