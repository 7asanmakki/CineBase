import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import SkeletonCard from "../components/SkeletonCard";
import { fetchWithRetry, NetworkError } from "../utils/api";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// 🚫 blacklist words to block adult/erotic content
const BLOCKED_KEYWORDS = [
  "desire",
  "erotic",
  "sex",
  "love",
  "stepmom",
  "cream",
  "affair",
  "lust",
  "pleasure",
  "obsession",
  "temptation",
  "seduction",
];

// 🚫 blacklist exact titles (lowercased)
const BLOCKED_TITLES = ["the bad guys 2"];

export default function Home({ favorites = [], onFavoriteToggle }) {
  const [sections, setSections] = useState({
    trending: [],
    topRated: [],
    action: [],
    drama: [],
    cartoons: [], // renamed from anime -> cartoons (US Animation / Cartoons)
    anime: [],    // NEW: dedicated Japanese anime section
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({ isError: false, message: "", type: "" });
  const navigate = useNavigate();

  const cleanMovies = (movies) => {
    if (!movies) return [];
    return movies.filter((m) => {
      const title = (m.title || "").toLowerCase();
      if (!m.poster_path) return false;
      if (m.adult) return false;
      if (BLOCKED_TITLES.includes(title)) return false;
      if (BLOCKED_KEYWORDS.some((word) => title.includes(word))) return false;
      return true;
    });
  };

  const fetchSections = async () => {
    try {
      setLoading(true);
      setError({ isError: false, message: "", type: "" });
      
      // Prepare all fetch promises (now 6 endpoints: trending, topRated, action, drama, cartoons (US), anime (JP))
      const endpoints = [
        fetchWithRetry('/discover/movie', { primary_release_year: '2025', sort_by: 'popularity.desc', language: 'en-US', page: 1 }),
        fetchWithRetry('/movie/top_rated', { language: 'en-US', page: 1 }),
        fetchWithRetry('/discover/movie', { with_genres: '28', sort_by: 'popularity.desc', language: 'en-US', page: 1 }),
        fetchWithRetry('/discover/movie', { with_genres: '18', with_original_language: 'en', sort_by: 'popularity.desc', language: 'en-US', page: 1 }),
        // Cartoons & Animation (US / English original)
        fetchWithRetry('/discover/movie', { with_genres: '16,10751', with_original_language: 'en', sort_by: 'popularity.desc', language: 'en-US', page: 1 }),
        // Anime (Japanese original language, animation genre)
        fetchWithRetry('/discover/movie', { with_genres: '16', with_original_language: 'ja', sort_by: 'popularity.desc', language: 'en-US', page: 1 })
      ];
      
      // Execute in parallel
      const [trending, topRated, action, drama, cartoons, anime] = await Promise.all(endpoints);
      
      setSections({
        trending: cleanMovies(trending.results),
        topRated: cleanMovies(topRated.results),
        action: cleanMovies(action.results),
        drama: cleanMovies(drama.results),
        cartoons: cleanMovies(cartoons.results), // US cartoons & animations
        anime: cleanMovies(anime.results),       // Japanese anime
      });
    } catch (error) {
      console.error("Error fetching homepage sections:", error);
      
      // Set meaningful error message based on error type
      if (error instanceof NetworkError) {
        setError({
          isError: true,
          message: error.message, 
          type: "network"
        });
      } else {
        setError({
          isError: true, 
          message: "We couldn't load the latest movies. Please try again later.", 
          type: "general"
        });
      }
      
      // Clear sections
      setSections({
        trending: [],
        topRated: [],
        action: [],
        drama: [],
        cartoons: [],
        anime: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isMovieFavorited = (movie) => favorites.some((f) => f.id === movie.id);

  const renderSection = (title, movies) => (
    <section key={title} className="mb-6 md:mb-8">
      <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-3 tracking-tight text-gray-800 dark:text-gray-100">
        {title}
      </h2>
      <div className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 pb-2 snap-x snap-mandatory">
        {loading ? (
          [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
        ) : movies.length > 0 ? (
          movies.map((movie) => (
            <div
              key={movie.id}
              className="flex-shrink-0 w-32 md:w-40 transition-transform duration-200 hover:scale-105 snap-start"
            >
              <MovieCard
                movie={{
                  ...movie,
                  poster_path:
                    movie.poster_path ||
                    movie.backdrop_path ||
                    "/fallback-poster.jpg",
                }}
                onFavoriteToggle={onFavoriteToggle}
                isFavorited={isMovieFavorited(movie)}
              />
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm">No movies found 😢</p>
        )}
      </div>
    </section>
  );

  // If there's an error, show it
  if (error.isError) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-6 rounded-lg text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
            {error.type === "network" ? "Connection Error" : "Something went wrong"}
          </h2>
          <p className="mt-3 text-gray-700 dark:text-gray-300">{error.message}</p>
          
          <div className="mt-6">
            <button
              onClick={() => {
                fetchSections();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto">
      {renderSection("🔥 Trending in 2025", sections.trending)}
      {renderSection("👑 Most Viewed of All Time", sections.topRated)}
      {renderSection("💥 Action Movies", sections.action)}
      {renderSection("🎭 Drama Movies", sections.drama)}
      {renderSection("🎨 Cartoon & Animation", sections.cartoons)}
      {renderSection("🎌 Anime", sections.anime)}
    </div>
  );
}
