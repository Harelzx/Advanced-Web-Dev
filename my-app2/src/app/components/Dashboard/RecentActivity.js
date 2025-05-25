export const RecentActivity = ({ activities }) => {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <h2 className="text-white text-xl font-semibold mb-4">🎯 Recent Activity</h2>
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-white">{activity.activity}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`text-sm ${
                  activity.score.includes('%') ? 'text-green-400' : 'text-blue-400'
                }`}>
                  {activity.score}
                </span>
                <span className="text-gray-400 text-sm">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };