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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className="bg-white p-4 border rounded shadow text-center bg-center"
          style={{ backgroundImage: "url('/OIP.jpeg')", backgroundSize: "50%" }}
        >
          <div className="bg-white bg-opacity-75 p-4 rounded">
            <h2 className="text-xl font-semibold text-gray-800">Interactive Study</h2>
            <p className="text-gray-700 text-base leading-relaxed font-bold">Study your subjects with interactive quizzes and activities.</p>
            <Link href="/InterStudy">
              <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                Go to Interactive Study
              </button>
            </Link>
          </div>
        </div>
        <div
          className="bg-white p-4 border rounded shadow text-center bg-cover bg-center"
          style={{ backgroundImage: "url('/OIP2.jpeg')", backgroundSize: "50%" }}
        >
          <div className="bg-white bg-opacity-75 p-4 rounded">
            <h2 className="text-xl font-semibold text-gray-800">Personalized Learning Path</h2>
            <p className="text-gray-700 text-base leading-relaxed font-bold">Get a customized learning path to address your knowledge gaps.</p>
            <Link href="/PersonalizedPath">
              <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                Go to Personalized Learning Path
              </button>
            </Link>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 border rounded shadow text-center">
        <h2 className="text-xl font-semibold text-gray-800">First Quiz</h2>
        <p className="text-gray-700 text-base leading-relaxed">Start your first math quiz and test your skills!</p>
        <Link href="/FirstQuiz">
          <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Go to First Quiz
          </button>
        </Link>
      </div>
      <div className="bg-yellow-100 p-4 border rounded shadow">
        <BadgeCase
          earnedBadges={earnedBadges}
          fullName={user.fullName}
          school={user.school}
        />
      </div>
    </main>
  );
}