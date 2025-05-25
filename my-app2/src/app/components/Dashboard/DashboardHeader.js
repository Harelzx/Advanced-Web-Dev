export const DashboardHeader = ({ userType, userData, itemCount, itemLabel }) => {
    const getIcon = () => {
      switch (userType) {
        case 'teacher':
          return '👨‍🎓';
        case 'parent':
          return '👨‍👩‍👧‍👦';
        default:
          return '📚';
      }
    };
  
    const getTitle = () => {
      switch (userType) {
        case 'teacher':
          return 'Teacher Dashboard';
        case 'parent':
          return 'Parent Dashboard';
        default:
          return 'Dashboard';
      }
    };
  
    const getDescription = () => {
      switch (userType) {
        case 'teacher':
          return 'Managing your students\' learning progress';
        case 'parent':
          return 'Tracking your children\'s learning progress';
        default:
          return 'Learning progress tracking';
      }
    };
  
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-6">
        <h1 className="text-white text-3xl font-bold mb-2">{getTitle()}</h1>
        <p className="text-gray-300 text-lg">Welcome, {userData?.fullName || userData?.email}</p>
        <p className="text-gray-400">{getDescription()}</p>
        {itemCount > 0 && (
          <p className="text-blue-400 mt-2">
            {getIcon()} Currently {userType === 'teacher' ? 'teaching' : 'tracking'} {itemCount} {itemLabel}{itemCount !== 1 ? (userType === 'parent' ? 'ren' : 's') : ''}
          </p>
        )}
      </div>
    );
  };
  