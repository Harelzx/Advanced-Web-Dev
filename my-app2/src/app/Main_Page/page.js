import Link from 'next/link';
import BadgeCase from '@/app/components/BadgeCase';

const earnedBadges = ["Math Master", "Daily Login"]; // Example of earned badges

const user = {
  fullName: "Jacob Shulman",
  school: "Braude College"
};

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
            <BadgeCase
              earnedBadges={earnedBadges}
              fullName={user.fullName}
              school={user.school}
            />
          </section>
        </div>
      </main>
    </div>
    );
}