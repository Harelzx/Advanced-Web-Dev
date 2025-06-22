import Button from '../Button';

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
    <div className={`panels p-4 rounded-lg shadow ${className}`}>
      <div className="mb-2">
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      </div>
      
      {value !== undefined && (
        <div className="mb-2">
          <span className={`text-2xl font-bold ${valueColor}`}>{value}</span>
        </div>
      )}
      
      {subtitle && (
        <p className="text-gray-600 mb-2">{subtitle}</p>
      )}
      
      {children}
      
      {buttonText && (
        <div className="mt-2">
          <Button 
            className={buttonColor}
            onClick={onButtonClick}
          >
            {buttonText}
          </Button>
        </div>
      )}
    </div>
  );
} 