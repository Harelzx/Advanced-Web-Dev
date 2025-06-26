'use client';

/**
 * Main Page Layout Component
 * Layout wrapper specifically for student's main page
 * Provides consistent styling and structure for student dashboard
 */
const MainPageLayout = ({ children, userName, headerText }) => {
  return (
    <div className="min-h-screen panels">
      <main className="p-4 space-y-6 pt-20" dir="rtl">
        <div className="panels p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{headerText || `ברוך הבא, ${userName}`}</h1>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainPageLayout; 