/**
 * Dashboard Error Component
 * Displays error states for dashboard-related failures
 * Provides consistent error UI with retry functionality
 */

export default function DashboardError({ message, onRetry }) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <main className="p-4 space-y-6" dir="rtl">
      <div className="panels p-6 rounded-lg shadow-lg text-center">
        <div className="text-red-500 mb-4">
          <span className="text-4xl">⚠️</span>
        </div>
        <p className="text-red-600 font-medium mb-4">{message}</p>
        <button
          onClick={handleRetry}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          נסה שוב
        </button>
      </div>
    </main>
  );
} 