export const PersonInfoCard = ({ 
    person, 
    userType, 
    onAddItem, 
    showAddButton = true,
    itemCount,
    additionalInfo = {} 
  }) => {
    const getTitle = () => {
      return userType === 'teacher' ? 'Student Information' : 'Student Information';
    };
  
    const getAddButtonText = () => {
      return userType === 'teacher' ? 'Add Another Student' : 'Add Another Child';
    };
  
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl font-semibold">{getTitle()}</h2>
          {showAddButton && itemCount === 1 && (
            <button
              onClick={onAddItem}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
            >
              {getAddButtonText()}
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-gray-300">
            <span className="font-medium">Name:</span> {person.fullName || person.name}
          </div>
          <div className="text-gray-300">
            <span className="font-medium">Email:</span> {person.email}
          </div>
          {additionalInfo.lastActivity && (
            <div className="text-gray-300">
              <span className="font-medium">Last Activity:</span> {additionalInfo.lastActivity}
            </div>
          )}
          {additionalInfo.accountCreated && (
            <div className="text-gray-300">
              <span className="font-medium">Account Created:</span> {additionalInfo.accountCreated}
            </div>
          )}
          <div className="text-gray-300">
            <span className="font-medium">Role:</span> {person.role || 'Student'}
          </div>
        </div>
      </div>
    );
  };