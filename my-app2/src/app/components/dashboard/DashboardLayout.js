'use client';

import Button from "../Button";

const DashboardLayout = ({ children, userName, headerText, layoutType = "default", showRole = true, showRefreshButton = true, roleLabel = "תפקיד" }) => {
  // Define layout classes based on layoutType
  const getLayoutClasses = () => {
    switch (layoutType) {
      case "compact":
        return "p-2 space-y-3";
      case "wide":
        return "p-6 space-y-8 max-w-7xl mx-auto";
      default:
        return "p-4 space-y-6";
    }
  };

  // Define header classes based on layoutType
  const getHeaderClasses = () => {
    switch (layoutType) {
      case "compact":
        return "text-xl";
      case "wide":
        return "text-3xl";
      default:
        return "text-2xl";
    }
  };

  return (
    <main className={getLayoutClasses()} dir="rtl">
      <div className="panels p-6 rounded-lg shadow-lg">
        <div className="mb-4">
          <p className={`font-bold text-gray-800 ${getHeaderClasses()}`}>{headerText || `ברוך הבא, ${userName}`}</p>
        </div>
        <div className="flex justify-between items-center mb-4">
          {showRole && (
            <div>
              <p className="text-xl font-medium text-slate-700 dark:text-slate-300">
                ברוך הבא, <span className="font-bold text-indigo-600 dark:text-indigo-400">{userName}</span>!
              </p>
            </div>
          )}
          {showRefreshButton && (
            <Button>
              ← רענן נתונים
            </Button>
          )}
        </div>
        {children}
      </div>
    </main>
  );
};

export default DashboardLayout;