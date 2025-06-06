export default function ProgressBar({ 
  percentage, 
  color = "bg-green-500", 
  height = "h-3" 
}) {
  return (
    <div className={`w-full bg-gray-200 rounded-full ${height} mt-2`}>
      <div
        className={`${color} ${height} rounded-full transition-all`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
} 