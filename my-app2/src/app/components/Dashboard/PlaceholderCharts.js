// my-app2/src/app/components/Dashboard/PlaceholderCharts.js

import { SubjectPerformance } from './SubjectPerformance';

export const PlaceholderCharts = ({ showSubjects = false, subjects = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {/* Progress Chart Placeholder */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <h3 className="text-white text-lg font-semibold mb-4">📈 Progress Over Time</h3>
        <div className="h-32 bg-gray-700 rounded flex items-center justify-center">
          <span className="text-gray-400">Chart coming soon...</span>
        </div>
      </div>

      {/* Subject Performance or Analysis */}
      {showSubjects && subjects.length > 0 ? (
        <SubjectPerformance subjects={subjects} />
      ) : (
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <h3 className="text-white text-lg font-semibold mb-4">📚 Subject Strengths</h3>
          <div className="h-32 bg-gray-700 rounded flex items-center justify-center">
            <span className="text-gray-400">Analysis coming soon...</span>
          </div>
        </div>
      )}

      {/* Activity Tracker Placeholder */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <h3 className="text-white text-lg font-semibold mb-4">⏰ Study Activity</h3>
        <div className="h-32 bg-gray-700 rounded flex items-center justify-center">
          <span className="text-gray-400">Activity tracking coming soon...</span>
        </div>
      </div>
    </div>
  );
};