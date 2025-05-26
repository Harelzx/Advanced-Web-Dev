import SuccessMessage from './SuccessMessage';
import { DashboardHeader } from './DashboardHeader';
import AddStudentModal from './AddStudentModal';

export const EmptyState = ({ 
    userType, 
    userData, 
    onAddItem, 
    successMessage,
    isModalOpen,
    onCloseModal,
    onSuccess,
    userId
  }) => {
    const getIcon = () => {
      return userType === 'teacher' ? '👨‍🎓' : '👨‍👩‍👧‍👦';
    };
  
    const getTitle = () => {
      return userType === 'teacher' ? 'No Students Added Yet' : 'No Children Added Yet';
    };
  
    const getDescription = () => {
      return userType === 'teacher' 
        ? 'Add students to start tracking their learning progress'
        : 'Add your child to start tracking their learning progress';
    };
  
    const getButtonText = () => {
      return userType === 'teacher' ? 'Add Your First Student' : 'Add Your First Child';
    };
  
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <SuccessMessage message={successMessage} isVisible={!!successMessage} />
          
          <DashboardHeader 
            userType={userType}
            userData={userData}
            itemCount={0}
            itemLabel=""
          />
  
          <div className="bg-gray-800 p-12 rounded-lg shadow-xl text-center">
            <div className="text-8xl mb-6">{getIcon()}</div>
            <h2 className="text-white text-2xl font-bold mb-4">{getTitle()}</h2>
            <p className="text-gray-400 text-lg mb-8">{getDescription()}</p>
            <button
              onClick={onAddItem}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg"
            >
              {getButtonText()}
            </button>
          </div>

          <AddStudentModal
            isOpen={isModalOpen}
            onClose={onCloseModal}
            userType={userType}
            userId={userId}
            onSuccess={onSuccess}
          />
        </div>
      </div>
    );
  };
  