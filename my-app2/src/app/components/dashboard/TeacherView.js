import { useState } from 'react';
import StatsCard from './StatsCard';
import UserCard from './UserCard';

// Displays the teacher's view of the dashboard.
export default function TeacherView({ studentsData = [], onAddStudent, onRemoveStudent, onOpenChat }) {
  const [isStudentListCollapsed, setIsStudentListCollapsed] = useState(false);
  
  const totalStudents = studentsData.length;
  const averageGrade = studentsData.length > 0 
    ? (studentsData.reduce((sum, student) => sum + student.averageGrade, 0) / studentsData.length).toFixed(1)
    : 0;

  return (
    <div dir="rtl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">סקירת מורה</h2>
        <button
          onClick={onOpenChat}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          💬 צ'אט עם הורים
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Students Overview */}
        <StatsCard
          title="תלמידים"
          subtitle="סך כל התלמידים:"
          value={totalStudents}
          valueColor="text-green-600"
          buttonText="הוסף תלמיד"
          buttonColor="bg-green-500 hover:bg-green-600"
          onButtonClick={onAddStudent}
        />
        
        {/* Class Performance */}
        <StatsCard
          title="ביצועי כיתה"
          subtitle="ציון ממוצע:"
          value={`${averageGrade}%`}
          valueColor={averageGrade >= 80 ? "text-green-600" : averageGrade >= 60 ? "text-yellow-600" : "text-red-600"}
        />
        
        {/* Students List */}
        <div className="md:col-span-2">
          <StatsCard>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">ביצועי תלמידים</h3>
              <button
                onClick={() => setIsStudentListCollapsed(!isStudentListCollapsed)}
                className="flex items-center gap-2 px-3 py-1 text-sm panels border panels"
              >
                <span>{isStudentListCollapsed ? 'הרחב' : 'כווץ'}</span>
                <span className={`transform transition-transform ${isStudentListCollapsed ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
            </div>
            
            {!isStudentListCollapsed && (
              <>
                {studentsData.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {studentsData.map((student) => (
                      <UserCard 
                        key={student.id} 
                        user={student} 
                        role="teacher"
                        onRemove={onRemoveStudent} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="panels mb-4">עדיין לא שויכו תלמידים.</p>
                    <button
                      onClick={onAddStudent}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                    >
                      הוסף את התלמיד הראשון שלך
                    </button>
                  </div>
                )}
              </>
            )}
          </StatsCard>
        </div>
      </div>
    </div>
  );
} 