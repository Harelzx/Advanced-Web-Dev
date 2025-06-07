import { useState } from 'react';
import StatsCard from './StatsCard';
import ProgressBar from './ProgressBar';

export default function ParentView({ studentsData = [], onAddChild, onRemoveChild }) {
  const [isChildrenCardsCollapsed, setIsChildrenCardsCollapsed] = useState(false);
  const [isDetailedAnalysisCollapsed, setIsDetailedAnalysisCollapsed] = useState(false);
  
  // For parents, studentsData will contain their children's data
  const children = studentsData;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">Your Children&apos;s Progress</h2>
        <button
          onClick={onAddChild}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Add Child
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children.length > 0 ? (
          <>
            {/* Individual Children Cards with Collapse */}
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-700">Children Overview</h3>
                <button
                  onClick={() => setIsChildrenCardsCollapsed(!isChildrenCardsCollapsed)}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors text-gray-800"
                  style={{ color: '#1f2937', backgroundColor: '#ffffff', borderColor: '#d1d5db' }}
                >
                  <span>{isChildrenCardsCollapsed ? 'Expand' : 'Collapse'}</span>
                  <span className={`transform transition-transform ${isChildrenCardsCollapsed ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
              </div>
              
              {!isChildrenCardsCollapsed && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Individual Children Cards */}
                  {children.map((child) => {
                    const totalSessions = 9;
                    const completionPercentage = child.trainingProgress?.completedSessions
                      ? Math.round((child.trainingProgress.completedSessions / totalSessions) * 100)
                      : 0;

                    return (
                      <ChildCard 
                        key={child.id}
                        child={child}
                        completionPercentage={completionPercentage}
                        totalSessions={totalSessions}
                        onRemoveChild={onRemoveChild}
                      />
                    );
                  })}
                  
                  {/* Overall Family Progress - only if multiple children */}
                  {children.length > 1 && (
                    <StatsCard
                      title="Overall Family Progress"
                      subtitle="Average Performance:"
                      value={`${(children.reduce((sum, child) => sum + child.averageGrade, 0) / children.length).toFixed(1)}%`}
                      valueColor="text-green-600"
                    />
                  )}
                </div>
              )}
            </div>
            
          </>
        ) : (
          /* No Children Data */
          <StatsCard title="No Children Added" className="md:col-span-2">
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                You haven&apos;t added any children yet. Add your first child to start tracking their progress.
              </p>
              <button
                onClick={onAddChild}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Add Your First Child
              </button>
            </div>
          </StatsCard>
        )}
      </div>
    </div>
  );
}

const ChildCard = ({ child, completionPercentage, totalSessions, onRemoveChild }) => {
  const [showDetails, setShowDetails] = useState(false);
  const lastActivityDate = child.trainingProgress?.lastActivity?.toDate();

  const getSubjectStrength = () => {
    const performanceData = child.practicePerformance;
    if (!performanceData || Object.keys(performanceData).length === 0) {
      return { strong: null, weak: null };
    }
    const sortedSubjects = Object.entries(performanceData).sort((a, b) => b[1] - a[1]);
    const strong = sortedSubjects[0];
    const weak = sortedSubjects[sortedSubjects.length - 1];
    return { strong, weak };
  };

  const { strong, weak } = getSubjectStrength();

  return (
    <StatsCard title={child.name}>
      <div className="space-y-4">
        {/* Remove Button */}
        <div className="flex justify-end">
          <button
            onClick={() => onRemoveChild(child)}
            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
            title="Remove Child"
          >
            Remove
          </button>
        </div>

        {/* Training Progress */}
        <div>
          <p className="font-medium text-gray-700 mb-2">Training Progress</p>
          <ProgressBar 
            percentage={completionPercentage} 
            color="bg-blue-500"
          />
          <div className="flex justify-between items-center mt-1 text-sm text-gray-600">
            <span>
              {child.trainingProgress?.completedSessions || 0} / {totalSessions} Sessions
            </span>
            <span className="font-bold text-blue-600">{completionPercentage}%</span>
          </div>
          {lastActivityDate && (
            <div className="text-xs text-gray-500 text-right mt-2">
              <span className="font-semibold">פעילות אחרונה:</span> {lastActivityDate.toLocaleDateString('he-IL')}
            </div>
          )}
        </div>

        {/* Average Grade */}
        <div>
          <p className="font-medium text-gray-700 mb-1">Initial Test Average</p>
          <div className="flex justify-between items-center">
            <p className={`text-2xl font-bold ${
              child.averageGrade >= 80 ? "text-green-600" : 
              child.averageGrade >= 60 ? "text-yellow-600" : "text-red-600"
            }`}>
              {child.averageGrade.toFixed(1)}%
            </p>
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-blue-600 hover:underline"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
        </div>

        {/* Strengths, Weaknesses and Avg Time */}
        <div className="flex flex-wrap justify-around text-center border-t pt-4">
            {/* Strongest Subject */}
            {strong && (
              <div className="px-2">
                <p className="text-sm font-semibold text-gray-500">Strongest Subject</p>
                <p className="font-bold text-green-600">{strong[0]} ({Math.round(strong[1])}%)</p>
              </div>
            )}

            {/* Weakest Subject */}
            {weak && (
               <div className="px-2">
                <p className="text-sm font-semibold text-gray-500">Needs Improvement</p>
                <p className="font-bold text-red-600">{weak[0]} ({Math.round(weak[1])}%)</p>
              </div>
            )}

            {/* Average Practice Time */}
            {child.averageTimeSpent > 0 && (
                <div className="px-2">
                    <p className="text-sm font-semibold text-gray-500">Avg. Practice Time</p>
                    <p className="font-bold text-indigo-600">{child.averageTimeSpent.toFixed(0)} min</p>
                </div>
            )}
        </div>
        
        {/* Detailed Subjects Breakdown (Collapsible) */}
        {showDetails && (
          <div className="text-sm border-t pt-3 mt-3">
            <p className="font-semibold text-gray-700 mb-2">Initial Test Scores:</p>
            {Object.entries(child.grades).map(([subject, grade]) => (
              <div key={subject} className="flex justify-between mb-1">
                <span className="text-gray-600">{subject}:</span>
                <span className={`font-bold ${
                  grade >= 80 ? "text-green-600" : 
                  grade >= 60 ? "text-yellow-600" : "text-red-600"
                }`}>
                  {grade}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </StatsCard>
  );
}; 