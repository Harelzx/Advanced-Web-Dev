import StatsCard from './StatsCard';

export default function TeacherView({ studentsData = [], onAddStudent, onRemoveStudent }) {
  const totalStudents = studentsData.length;
  const averageGrade = studentsData.length > 0 
    ? (studentsData.reduce((sum, student) => sum + student.averageGrade, 0) / studentsData.length).toFixed(1)
    : 0;

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Teacher Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Students Overview */}
        <StatsCard
          title="Students"
          subtitle="Total Students:"
          value={totalStudents}
          valueColor="text-green-600"
          buttonText="Add Student"
          buttonColor="bg-green-500 hover:bg-green-600"
          onButtonClick={onAddStudent}
        />
        
        {/* Class Performance */}
        <StatsCard
          title="Class Performance"
          subtitle="Average Grade:"
          value={`${averageGrade}%`}
          valueColor={averageGrade >= 80 ? "text-green-600" : averageGrade >= 60 ? "text-yellow-600" : "text-red-600"}
          buttonText="View Analytics"
          buttonColor="bg-blue-500 hover:bg-blue-600"
          onButtonClick={() => console.log('View analytics clicked')}
        />
        
        {/* Students List */}
        <StatsCard title="Student Performance" className="md:col-span-2">
          {studentsData.length > 0 ? (
            <div className="space-y-3 mt-3">
              {studentsData.map((student) => (
                <div key={student.id} className="border rounded-lg p-3 bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-gray-800">{student.name}</h4>
                      <span className={`font-bold ${
                        student.averageGrade >= 80 ? "text-green-600" : 
                        student.averageGrade >= 60 ? "text-yellow-600" : "text-red-600"
                      }`}>
                        {student.averageGrade.toFixed(1)}% Average
                      </span>
                    </div>
                    <button
                      onClick={() => onRemoveStudent(student)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      title="Remove Student"
                    >
                      Remove
                    </button>
                  </div>
                  
                  {/* Grades by Subject */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {Object.entries(student.grades).map(([subject, grade]) => (
                      <div key={subject} className="text-center">
                        <div className="text-gray-600 font-medium">{subject}</div>
                        <div className={`font-bold ${
                          grade >= 80 ? "text-green-600" : 
                          grade >= 60 ? "text-yellow-600" : "text-red-600"
                        }`}>
                          {grade}%
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Wrong Questions Count */}
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Wrong Questions: </span>
                    {Object.values(student.wrongQuestions).reduce((total, questions) => 
                      total + (Array.isArray(questions) ? questions.length : 0), 0
                    )} total
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No students assigned yet.</p>
              <button
                onClick={onAddStudent}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Add Your First Student
              </button>
            </div>
          )}
        </StatsCard>
      </div>
    </div>
  );
} 