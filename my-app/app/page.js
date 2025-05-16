import Link from 'next/link';
import Badge from './components/Badge'

const badges = [
    { label: "Quiz Master", color: "bg-blue-500" },
    { label: "Fast Learner", color: "bg-yellow-500" },
    { label: "100% Attendance", color: "bg-purple-500" },
];

export default function Home() {
    return (
    <div>
      <header>
        <h1>Student Study Platform</h1>
        <p>Choose your study mode</p>
        <div className="mt-4">
          {badges.map((badge, idx) => (
            <Badge key={idx} label={badge.label} color={badge.color} />
          ))}
        </div>
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
        </div>
      </main>
    </div>
    );
}