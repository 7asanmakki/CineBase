import { useState, useEffect } from "react";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = false,
  maxVisiblePages = 5
}) {
  const [pageInput, setPageInput] = useState(currentPage);
  
  // Keep the input in sync with the current page
  useEffect(() => {
    setPageInput(currentPage);
  }, [currentPage]);

  // Handle direct input
  const handleInputChange = (e) => {
    setPageInput(e.target.value);
  };
  
  const handleInputSubmit = (e) => {
    e.preventDefault();
    const pageNumber = parseInt(pageInput, 10);
    if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
      onPageChange(pageNumber);
    } else {
      // Reset to current page if invalid
      setPageInput(currentPage);
    }
  };
  
  // Calculate visible page range
  const generatePageNumbers = () => {
    // For small number of pages, show all
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // For larger datasets, calculate visible range
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  // No pagination needed for single page
  if (totalPages <= 1) return null;

  const visiblePageNumbers = showPageNumbers ? generatePageNumbers() : [];
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <div className="mt-8 flex flex-wrap justify-center items-center gap-3">
      {/* Navigation Buttons */}
      <div className="flex items-center gap-1 md:gap-2 flex-wrap justify-center">
        <button
          onClick={() => onPageChange(1)}
          disabled={!hasPrevPage}
          className={`px-2 py-1 rounded text-sm md:text-base ${
            hasPrevPage
              ? "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
          }`}
          aria-label="First page"
        >
          «
        </button>
        
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className={`px-3 py-1 rounded text-sm ${
            hasPrevPage
              ? "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
          }`}
          aria-label="Previous page"
        >
          Prev
        </button>
        
        {/* Page Numbers */}
        {showPageNumbers && visiblePageNumbers.map(pageNumber => (
          <button
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
            className={`w-8 h-8 flex items-center justify-center rounded ${
              pageNumber === currentPage
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
            aria-current={pageNumber === currentPage ? "page" : undefined}
          >
            {pageNumber}
          </button>
        ))}
        
        {!showPageNumbers && (
          <span className="px-3 py-1 bg-blue-600 text-white rounded">
            {currentPage} / {totalPages}
          </span>
        )}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className={`px-3 py-1 rounded text-sm ${
            hasNextPage
              ? "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
          }`}
          aria-label="Next page"
        >
          Next
        </button>
        
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage}
          className={`px-2 py-1 rounded text-sm md:text-base ${
            hasNextPage
              ? "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
          }`}
          aria-label="Last page"
        >
          »
        </button>
      </div>
      
      {/* Page Jump Form */}
      {totalPages > 7 && (
        <form 
          onSubmit={handleInputSubmit}
          className="flex items-center gap-2 mt-2 md:mt-0"
        >
          <span className="text-sm text-gray-600 dark:text-gray-300">Go to:</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={pageInput}
            onChange={handleInputChange}
            className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm"
          />
          <button
            type="submit"
            className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Go
          </button>
        </form>
      )}
    </div>
  );
}
