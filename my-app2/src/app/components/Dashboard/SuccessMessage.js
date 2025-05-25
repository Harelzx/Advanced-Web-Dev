export const SuccessMessage = ({ message, isVisible }) => {
    if (!isVisible || !message) return null;
  
    return (
      <div className="bg-green-900/50 border border-green-500 rounded-lg p-4 mb-6 animate-pulse">
        <p className="text-green-200">{message}</p>
      </div>
    );
  };