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
        <h2 className="text-xl font-semibold text-gray-700">Your Children's Progress</h2>
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
                  {children.map((child, index) => (
                    <StatsCard key={child.id} title={child.name}>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-gray-600">
                            Average Grade: <span className={`font-bold ${
                              child.averageGrade >= 80 ? "text-green-600" : 
                              child.averageGrade >= 60 ? "text-yellow-600" : "text-red-600"
                            }`}>
                              {child.averageGrade.toFixed(1)}%
                            </span>
                          </p>
                          <button
                            onClick={() => onRemoveChild(child)}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                            title="Remove Child"
                          >
                            Remove
                          </button>
                        </div>
                        
                        {/* Subjects Breakdown */}
                        <div className="text-sm">
                          <p className="font-medium text-gray-700 mb-1">Subjects:</p>
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
                        
                        <ProgressBar 
                          percentage={child.averageGrade} 
                          color={
                            child.averageGrade >= 80 ? "bg-green-500" : 
                            child.averageGrade >= 60 ? "bg-yellow-400" : "bg-red-400"
                          } 
                        />
                        
                        {/* Wrong Questions Summary */}
                        <div className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Areas for improvement: </span>
                          {Object.values(child.wrongQuestions).reduce((total, questions) => 
                            total + (Array.isArray(questions) ? questions.length : 0), 0
                          )} questions to review
                        </div>
                      </div>
                    </StatsCard>
                  ))}
                  
                  {/* Overall Family Progress - only if multiple children */}
                  {children.length > 1 && (
                    <StatsCard
                      title="Overall Family Progress"
                      subtitle="Average Performance:"
                      value={`${(children.reduce((sum, child) => sum + child.averageGrade, 0) / children.length).toFixed(1)}%`}
                      valueColor="text-green-600"
                      buttonText="View Detailed Reports"
                      buttonColor="bg-green-500 hover:bg-green-600"
                      onButtonClick={() => console.log('View reports clicked')}
                    />
                  )}
                </div>
              )}
            </div>
            
            {/* Detailed Breakdown with Collapse */}
            <div className="md:col-span-2">
              <StatsCard>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-700">Detailed Analysis</h3>
                  <button
                    onClick={() => setIsDetailedAnalysisCollapsed(!isDetailedAnalysisCollapsed)}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors text-gray-800"
                    style={{ color: '#1f2937', backgroundColor: '#ffffff', borderColor: '#d1d5db' }}
                  >
                    <span>{isDetailedAnalysisCollapsed ? 'Expand' : 'Collapse'}</span>
                    <span className={`transform transition-transform ${isDetailedAnalysisCollapsed ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                </div>
                
                {!isDetailedAnalysisCollapsed && (
                  <>
                    {children.map((child) => (
                      <div key={child.id} className="mb-4 p-3 border rounded-lg bg-gray-50">
                        <h4 className="font-semibold text-gray-800 mb-2">{child.name}</h4>
                        
                        {/* Wrong Questions by Subject */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Questions to Review:</p>
                          {Object.entries(child.wrongQuestions).map(([subject, questions]) => (
                            Array.isArray(questions) && questions.length > 0 && (
                              <div key={subject} className="text-sm">
                                <span className="font-medium text-gray-600">{subject}: </span>
                                <span className="text-red-600">
                                  {questions.length} questions need review
                                </span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </StatsCard>
            </div>
          </>
        ) : (
          /* No Children Data */
          <StatsCard title="No Children Added" className="md:col-span-2">
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                You haven't added any children yet. Add your first child to start tracking their progress.
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