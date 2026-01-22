import React from 'react';
import { useAppStore } from '../store';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React error:", error, errorInfo);
    
    // If we have access to the app store, set the error there too
    try {
      const setApiError = useAppStore.getState().setApiError;
      if (setApiError) {
        setApiError({
          message: error.message,
          type: 'react_error'
        });
      }
    } catch (e) {
      // If we can't access the store, just log
      console.error("Could not update app store with error", e);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 flex flex-col items-center justify-center">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 rounded-lg text-center max-w-lg">
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Something went wrong</h2>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
