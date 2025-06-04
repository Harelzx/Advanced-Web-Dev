export default function DashboardHeader({ userRole, userName }) {
  return (
    <div className="bg-white p-6 border rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        {userRole === 'teacher' ? 'Teacher Dashboard' : 'Parent Dashboard'}
      </h1>
      <p className="text-gray-600">Welcome back, {userName}!</p>
    </div>
  );
} 