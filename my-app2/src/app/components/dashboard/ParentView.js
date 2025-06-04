import StatsCard from './StatsCard';
import ProgressBar from './ProgressBar';

export default function ParentView({ studentsData = [] }) {
  // For parents, studentsData will contain their children's data
  const children = studentsData;
  
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Children's Progress</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children.length > 0 ? (
          <>
            {/* Individual Children Cards */}
            {children.map((child, index) => (
              <StatsCard key={child.id} title={child.name}>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    Average Grade: <span className={`font-bold ${
                      child.averageGrade >= 80 ? "text-green-600" : 
                      child.averageGrade >= 60 ? "text-yellow-600" : "text-red-600"
                    }`}>
                      {child.averageGrade.toFixed(1)}%
                    </span>
                  </p>
                  
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
            
            {/* Detailed Breakdown */}
            <StatsCard title="Detailed Analysis" className="md:col-span-2">
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
            </StatsCard>
          </>
        ) : (
          /* No Children Data */
          <StatsCard title="No Data Available" className="md:col-span-2">
            <p className="text-gray-600">
              No children's progress data is currently available. 
              Please connect your children's accounts to view their progress.
            </p>
          </StatsCard>
        )}
      </div>
    </div>
  );
} 