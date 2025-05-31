import Link from 'next/link';
import BadgeCase from '@/app/components/BadgeCase';

const earnedBadges = ["Math Master", "Daily Login"];
const user = {
  fullName: "Jacob Shulman",
  school: "Braude College"
};

export const metadata = {
  title: "Student Study Platform",
};

export default function MainPage() {
  return (
    <main className="p-4 space-y-6">
      <div className="bg-white p-6 border rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Progress Tracker Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Progress Overview */}
          <div className="bg-gray-100 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Overall Progress</h3>
            <p className="text-gray-600">Completion Rate: <span className="font-bold text-green-600">75%</span></p>
            <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
              <div className="bg-green-500 h-4 rounded-full" style={{ width: "75%" }}></div>
            </div>
          </div>
          {/* Module Completion */}
          <div className="bg-gray-100 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Completed Modules</h3>
            <ul className="text-gray-600">
              <li>Math Basics - <span className="font-bold text-green-600">Completed</span></li>
              <li>Science Foundations - <span className="font-bold text-yellow-600">In Progress</span></li>
              <li>Reading Skills - <span className="font-bold text-red-600">Not Started</span></li>
            </ul>
          </div>
          {/* Next Steps */}
          <div className="bg-gray-100 p-4 rounded-lg shadow md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-700">Next Steps</h3>
            <p className="text-gray-600">Complete Science Foundations module by May 28, 2025.</p>
            <Link href="/StudyModules">
              <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                Continue Learning
              </button>
            </Link>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 border rounded shadow">
        <BadgeCase
          earnedBadges={earnedBadges}
          fullName={user.fullName}
          school={user.school}
        />
      </div>
    </main>
  );
}