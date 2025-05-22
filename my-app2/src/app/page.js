import { FaCalculator, FaFlask, FaCalendarCheck, FaBook, FaTrophy, FaPuzzlePiece, FaLock } from "react-icons/fa";
import Link from 'next/link';
import BadgeCase from './components/BadgeCase'

const earnedBadges = ["Math Master", "Daily Login"]; // Example of earned badges

const badges = [
  { label: "Math Master", icon: <FaCalculator /> },
  { label: "Science Star", icon: <FaFlask /> },
  { label: "Daily Login", icon: <FaCalendarCheck /> },
  { label: "Book Worm", icon: <FaBook /> },
  { label: "Champion", icon: <FaTrophy /> },
  { label: "Puzzle Solver", icon: <FaPuzzlePiece /> },
];

export default function Home() {
    return (
    <div>
      <header>
        <h1>Student Study Platform</h1>
        <p>Choose your study mode</p>
      </header>
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
          <div className="option-card">
            <h2>First Quiz</h2>
            <p>Start your first math quiz and test your skills!</p>
            <Link href="/FirstQuiz">
              <button>Go to First Quiz</button>
            </Link>
          </div>
          <section>
            <h2>Your Badge Case</h2>
            <BadgeCase earnedBadges={earnedBadges} />
          </section>
        </div>
      </main>
    </div>
    );
}