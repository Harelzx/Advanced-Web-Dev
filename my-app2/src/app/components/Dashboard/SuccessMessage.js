const SuccessMessage = ({ message, isVisible }) => {
  if (!isVisible || !message) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
      <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
        <span className="text-xl">✨</span>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
};

export default SuccessMessage;