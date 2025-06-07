// A reusable card component for displaying statistics.
export default function StatsCard({ 
  title, 
  subtitle, 
  value, 
  valueColor = "text-green-600", 
  buttonText, 
  buttonColor = "bg-green-500 hover:bg-green-600",
  onButtonClick,
  className = "",
  children 
}) {
  return (
    <div className={`bg-gray-100 p-4 rounded-lg shadow ${className}`}>
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      {subtitle && (
        <p className="text-gray-600">
          {subtitle} <span className={`font-bold ${valueColor}`}>{value}</span>
        </p>
      )}
      {children}
      {buttonText && (
        <div className="mt-2">
          <button 
            className={`text-white px-4 py-2 rounded ${buttonColor}`}
            onClick={onButtonClick}
          >
            {buttonText}
          </button>
        </div>
      )}
    </div>
  );
} 