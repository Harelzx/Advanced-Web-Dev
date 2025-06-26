'use client';

/**
 * Main Page Layout Component
 * Layout wrapper specifically for student's main page
 * Provides consistent styling and structure for student dashboard
 */
const MainPageLayout = ({ children, userName, headerText }) => {
  return (
    <main className="p-4 space-y-6 mt-16" dir="rtl">
      <div className="panels p-6 rounded-lg shadow-lg">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">{headerText || `ברוך הבא, ${userName}`}</h1>
        </div>
        {children}
      </div>
    </main>
  );
};

export default MainPageLayout; 