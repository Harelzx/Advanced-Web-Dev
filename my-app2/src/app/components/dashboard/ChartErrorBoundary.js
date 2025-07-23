'use client';

import React from 'react';

/**
 * Specialized Error Boundary for chart components
 * Provides chart-specific fallback UI and error handling
 */
class ChartErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Chart rendering error:', error, errorInfo);
    
    // Log chart-specific error details
    console.error('Chart props:', this.props);
  }

  render() {
    if (this.state.hasError) {
      const { height = 'h-48', message = 'לא ניתן להציג גרף כרגע' } = this.props;
      
      return (
        <div className={`${height} w-full flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg`}>
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm font-medium">{message}</p>
            <p className="text-xs mt-1">שגיאה בטעינת הגרף</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChartErrorBoundary;