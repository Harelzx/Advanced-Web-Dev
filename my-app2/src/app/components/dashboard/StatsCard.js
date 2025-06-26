import Button from '../Button';

// A reusable card component for displaying statistics.
export default function StatsCard({ 
  title, 
  subtitle, 
  value, 
  valueColor = "text-emerald-600 dark:text-emerald-400", 
  buttonText, 
  buttonColor = "bg-emerald-500 hover:bg-emerald-600",
  onButtonClick,
  className = "",
  children 
}) {
  return (
    <div className={`panels p-4 rounded-lg shadow ${className}`}>
      <div className="mb-2">
      <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      
      {value !== undefined && (
        <div className="mb-2">
          <span className={`text-2xl font-bold ${valueColor}`}>{value}</span>
        </div>
      )}
      
      {subtitle && (
        <p className="text-slate-600 dark:text-slate-400 mb-2">{subtitle}</p>
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