import Image from "next/image";
import Link from 'next/link';
import BadgeCase from './components/BadgeCase'

const earnedBadges = ["Math Master", "Daily Login"]; // Example of earned badges, need to be fetched from a database

const badges = [
  { label: "Math Master", color: "bg-green-500" },
  { label: "Science Star", color: "bg-blue-500" },
  { label: "Daily Login", color: "bg-yellow-500" },
  // Add more badges as you like
];

export default function Home() {
    return (
    <div>
      <header>
        <h1>Student Study Platform</h1>
        <p>Choose your study mode</p>
      </header>
      <section>
        <h2>Your Badge Case</h2>
        <BadgeCase earnedBadges={earnedBadges} />
        <p className="mt-2 text-gray-600">
          Log in to earn more badges and fill your case!
        </p>
      </section>
      <main>
        <div className="study-options">
          <div className="option-card">
            <h2>Interactive Study</h2>
            <p>Study your subjects with interactive quizzes and activities.</p>
            <Link href="/InterStudy">
              <button>Go to Interactive Study</button>
            </Link>
          </div>
          <div className="option-card">
            <h2>Personalized Learning Path</h2>
            <p>Get a customized learning path to address your knowledge gaps.</p>
            <Link href="/PersonalizedPath">
              <button>Go to Personalized Learning Path</button>
            </Link>
          </div>
        </div>
      </main>
    </div>
    );
}