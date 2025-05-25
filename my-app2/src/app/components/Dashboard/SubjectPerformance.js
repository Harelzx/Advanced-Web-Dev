export const SubjectPerformance = ({ subjects }) => {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <h3 className="text-white text-lg font-semibold mb-4">📚 Subject Performance</h3>
        <div className="space-y-2">
          {subjects.map((subject, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-white text-sm">{subject.name}</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-600 rounded-full h-1">
                  <div 
                    className="bg-blue-500 h-1 rounded-full"
                    style={{ width: `${subject.score}%` }}
                  ></div>
                </div>
                <span className="text-gray-300 text-xs w-8">{subject.score}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };