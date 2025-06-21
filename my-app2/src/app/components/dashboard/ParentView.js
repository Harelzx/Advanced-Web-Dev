'use client';

import { useState } from 'react';
import StatsCard from './StatsCard';
import UserCard from './UserCard';

// Displays the parent's view of the dashboard.
export default function ParentView({ studentsData = [], onAddChild, onRemoveChild }) {
  const [isChildrenCardsCollapsed, setIsChildrenCardsCollapsed] = useState(false);

  // For parents, studentsData will contain their children's data
  const children = studentsData;
  
  const totalChildren = children.length;
  const averageGrade = children.length > 0 
    ? (children.reduce((sum, child) => sum + child.averageGrade, 0) / children.length).toFixed(1)
    : 0;
  
  return (
    <div dir="rtl">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">התקדמות הילדים שלך</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Children Overview */}
        <StatsCard
          title="ילדים"
          subtitle="סך כל הילדים:"
          value={totalChildren}
          valueColor="text-green-600"
          buttonText="הוסף ילד/ה"
          buttonColor="bg-green-500 hover:bg-green-600"
          onButtonClick={onAddChild}
        />
        
        {/* Family Performance */}
        <StatsCard
          title="התקדמות משפחתית כוללת"
          subtitle="ביצועים ממוצעים:"
          value={`${averageGrade}%`}
          valueColor={averageGrade >= 80 ? "text-green-600" : averageGrade >= 60 ? "text-yellow-600" : "text-red-600"}
        />
        
        {/* Children List */}
        <div className="md:col-span-2">
          <StatsCard>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-700">סקירת ילדים</h3>
              <button
                onClick={() => setIsChildrenCardsCollapsed(!isChildrenCardsCollapsed)}
                className="flex items-center gap-2 px-3 py-1 text-sm panels border panels"
              >
                <span>{isChildrenCardsCollapsed ? 'הרחב' : 'כווץ'}</span>
                <span className={`transform transition-transform ${isChildrenCardsCollapsed ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
            </div>
            
            {!isChildrenCardsCollapsed && (
              <>
                {children.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {children.map((child) => (
                      <UserCard 
                        key={child.id}
                        user={child}
                        role="parent"
                        onRemove={onRemoveChild}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="panels mb-4">עדיין לא הוספת ילדים.</p>
                    <button
                      onClick={onAddChild}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                    >
                      הוסף את ילדך הראשון
                    </button>
                  </div>
                )}
              </>
            )}
          </StatsCard>
        </div>
      </div>
    </div>
  );
}