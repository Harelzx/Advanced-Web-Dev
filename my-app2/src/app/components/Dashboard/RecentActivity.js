export const RecentActivity = ({ activities }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-6">
      <h3 className="text-white text-lg font-semibold mb-4">🎯 Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="bg-gray-700 p-4 rounded-lg">
            <div className="flex flex-col items-center text-center">
              <div className="text-white font-medium mb-1">{activity.title}</div>
              <div className="flex items-center space-x-2">
                {activity.score && (
                  <span className="text-green-400 font-medium">{activity.score}</span>
                )}
                {activity.status && (
                  <span className={`text-sm ${
                    activity.status === 'In Progress' ? 'text-yellow-400' : 'text-blue-400'
                  }`}>
                    {activity.status}
                  </span>
                )}
                <span className="text-gray-400 text-sm">{activity.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};