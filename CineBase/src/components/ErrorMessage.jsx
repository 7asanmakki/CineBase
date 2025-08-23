import React from 'react';

export default function ErrorMessage({ message, retry = null }) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 my-4 text-center">
      <div className="text-red-600 dark:text-red-400 font-semibold mb-2">
        <span className="mr-2 text-xl">⚠️</span>
        {message || "An unexpected error occurred"}
      </div>
      {retry && (
        <button
          onClick={retry}
          className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded text-sm transition"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
