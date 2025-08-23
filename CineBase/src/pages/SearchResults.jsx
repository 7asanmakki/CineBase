import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import SkeletonCard from "../components/SkeletonCard";
import Pagination from "../components/Pagination";
import { fetchWithRetry, NetworkError } from "../utils/api";

// --- YearFilterBar: Only filter by year, styled nicely ---
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => currentYear - i);

function YearFilterBar({ year, onChange }) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-4 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <label className="block text-base font-semibold text-gray-700 dark:text-gray-200">
        Filter by Year:
      </label>
      <select
        value={year}
        onChange={e => onChange(e.target.value)}
        className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Years</option>
        {years.map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
      {year && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="ml-2 px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
        >
          Clear
        </button>
      )}
    </div>
  );
}

export default function SearchResults({ onFavoriteToggle, favorites = [] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const year = searchParams.get("year") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState({ isError: false, message: "", type: "" });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalResults: 0
  });

  // Handle year filter change
  const handleYearChange = (newYear) => {
    const params = new URLSearchParams(searchParams);
    if (newYear) {
      params.set("year", newYear);
    } else {
      params.delete("year");
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  useEffect(() => {
    if (!query) {
      setResults([]);
      setLoading(false);
      setError({ isError: false, message: "", type: "" });
      return;
    }
    const searchMovies = async () => {
      try {
        if (results.length > 0) setPageLoading(true); else setLoading(true);
        setError({ isError: false, message: "", type: "" });
        const apiParams = {
          query,
          language: 'en-US',
          page: currentPage,
          include_adult: false,
        };
        if (year) apiParams.primary_release_year = year;
        const data = await fetchWithRetry('/search/movie', apiParams);
        setResults(data.results || []);
        setPagination({
          currentPage: data.page || 1,
          totalPages: data.total_pages || 0,
          totalResults: data.total_results || 0
        });
        window.scrollTo(0, 0);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
        if (error instanceof NetworkError) {
          setError({
            isError: true,
            message: error.message,
            type: "network"
          });
        } else {
          setError({
            isError: true,
            message: "We couldn't complete your search right now. Please try again later.",
            type: "search"
          });
        }
      } finally {
        setLoading(false);
        setPageLoading(false);
      }
    };
    searchMovies();
    // eslint-disable-next-line
  }, [query, currentPage, year]);

  const isMovieFavorited = (movie) => favorites.some((f) => f.id === movie.id);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto">
      <h2 className="text-xl md:text-2xl font-semibold mb-4">
        🔍 Search Results{" "}
        {query && (
          <span className="text-blue-600 dark:text-blue-400">for "{query}"</span>
        )}
      </h2>
      {/* Year filter bar */}
      <YearFilterBar year={year} onChange={handleYearChange} />
      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {[...Array(10)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error.isError ? (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 p-6 text-center">
          <p className="text-lg font-semibold text-red-600 dark:text-red-400">
            {error.type === "network" ? "Connection Error" : "Search Error"}
          </p>
          <p className="mt-2 text-gray-700 dark:text-gray-300">{error.message}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              Go to Homepage
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 text-center">
          {query ? (
            <>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                No results for "{query}"
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Try different keywords, check spelling, or explore trending movies.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => navigate("/search")}
                  className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Clear search
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                >
                  Explore Trending
                </button>
              </div>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Tip: try shorter terms (e.g., "Avengers") or remove year/extra words.
              </p>
            </>
          ) : (
            <p className="text-center text-gray-500">
              Enter a search term to find movies.
            </p>
          )}
        </div>
      ) : (
        <>
          {pageLoading && (
            <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex justify-center items-center z-50">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          )}
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Showing {results.length} of {pagination.totalResults} results 
              {pagination.totalPages > 1 && ` • Page ${pagination.currentPage} of ${pagination.totalPages}`}
              {year && ` • Year: ${year}`}
            </p>
          </div>
          <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {results.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onFavoriteToggle={onFavoriteToggle}
                isFavorited={isMovieFavorited(movie)}
              />
            ))}
          </section>
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              showPageNumbers={pagination.totalPages <= 10}
            />
          )}
        </>
      )}
    </div>
  );
}