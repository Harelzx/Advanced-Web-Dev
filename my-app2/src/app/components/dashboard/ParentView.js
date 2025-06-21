'use client';

import { useState } from 'react';
import StatsCard from './StatsCard';
import UserCard from './UserCard';
import Button from '../Button';

// Displays the parent's view of the dashboard.
export default function ParentView({ studentsData = [], onAddChild, onRemoveChild }) {
  const [isChildrenCardsCollapsed, setIsChildrenCardsCollapsed] = useState(false);

  // For parents, studentsData will contain their children's data
  const children = studentsData;
  
  return (
    <div dir="rtl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">התקדמות הילדים שלך</h2>
        <Button onClick={onAddChild}>
          הוסף ילד/ה
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children.length > 0 ? (
          <>
            {/* Individual Children Cards with Collapse */}
            <div className="md:col-span-2">
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
                <div className="grid grid-cols-1 gap-3">
                  {/* Individual Children Cards */}
                  {children.map((child) => (
                    <UserCard 
                      key={child.id}
                      user={child}
                      role="parent"
                      onRemove={onRemoveChild}
                    />
                  ))}
                  
                  {/* Overall Family Progress - only if multiple children */}
                  {children.length > 1 && (
                    <StatsCard
                      title="התקדמות משפחתית כוללת"
                      subtitle="ביצועים ממוצעים:"
                      value={`${(children.reduce((sum, child) => sum + child.averageGrade, 0) / children.length).toFixed(1)}%`}
                      valueColor="text-green-600"
                    />
                  )}
                </div>
              )}
            </div>
            
          </>
        ) : (
          /* No Children Data */
          <StatsCard title="לא נוספו ילדים" className="md:col-span-2">
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                עדיין לא הוספת ילדים. הוסף את ילדך הראשון כדי להתחיל לעקוב אחר התקדמותו.
              </p>
              <button
                onClick={onAddChild}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                הוסף את ילדך הראשון
              </button>
            </div>
          </StatsCard>
        )}
      </div>
    </div>
  );
}