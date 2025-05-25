export const QuickStats = ({ stats }) => {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-6">
        <h2 className="text-white text-xl font-semibold mb-4">Quick Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.quizzesCompleted}</div>
            <div className="text-gray-400 text-sm">Quizzes Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{stats.averageScore}%</div>
            <div className="text-gray-400 text-sm">Average Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.studyStreak}</div>
            <div className="text-gray-400 text-sm">Study Streak (days)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.totalStudyTime}h</div>
            <div className="text-gray-400 text-sm">Total Study Time</div>
          </div>
        </div>
      </div>
    );
  };