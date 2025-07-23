'use client';

import React from 'react';

/**
 * Error Boundary component that catches JavaScript errors anywhere in the child component tree
 * Provides a fallback UI and error logging functionality
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      const { fallback, showDetails = false } = this.props;
      
      if (fallback) {
        return typeof fallback === 'function' 
          ? fallback(this.state.error, this.handleReset)
          : fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center panels">
          <div className="max-w-md mx-auto text-center p-6 rounded-lg shadow-lg">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              משהו השתבש
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              אירעה שגיאה בלתי צפויה. אנא נסה לרענן את הדף או פנה לתמיכה טכנית.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
              >
                נסה שוב
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
              >
                רענן דף
              </button>
            </div>

            {showDetails && this.state.error && (
              <details className="mt-6 text-left text-sm">
                <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                  פרטי שגיאה טכניים
                </summary>
                <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-red-600 dark:text-red-400 font-mono text-xs overflow-auto">
                  <div className="font-bold">Error:</div>
                  <div className="mb-2">{this.state.error.toString()}</div>
                  
                  {this.state.errorInfo && (
                    <>
                      <div className="font-bold">Component Stack:</div>
                      <div className="whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </div>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;