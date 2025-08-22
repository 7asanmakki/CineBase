// src/pages/Home.jsx
import { useState, useEffect } from "react";
import MovieCard from "../components/MovieCard";
import SkeletonCard from "../components/SkeletonCard";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// 🚫 blacklist words to block porn/erotic content
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
    anime: [],
  });
  const [loading, setLoading] = useState(true);

  const cleanMovies = (movies) => {
    if (!movies) return [];
    return movies.filter((m) => {
      // guard title usage
      const title = (m.title || "").toLowerCase();
      if (!m.poster_path) return false; // skip missing/black posters
      if (m.adult) return false;
      if (BLOCKED_TITLES.includes(title)) return false;
      if (BLOCKED_KEYWORDS.some((word) => title.includes(word))) return false;
      return true;
    });
  };

  const fetchSections = async () => {
    try {
      setLoading(true);

      const [trendingRes, topRatedRes, actionRes, dramaRes, animeRes] =
        await Promise.all([
          // Trending 2025 only
          fetch(
            `${BASE_URL}/discover/movie?api_key=${API_KEY}&primary_release_year=2025&sort_by=popularity.desc&language=en-US&page=1`
          ),
          // Most viewed of all time
          fetch(
            `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`
          ),
          // Action
          fetch(
            `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=28&sort_by=popularity.desc&language=en-US&page=1`
          ),
          // Drama (stricter → only English, popular ones)
          fetch(
            `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=18&with_original_language=en&sort_by=popularity.desc&language=en-US&page=1`
          ),
          // Anime + Cartoons
          fetch(
            `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=16,10751&sort_by=popularity.desc&language=en-US&page=1`
          ),
        ]);

      // check responses (partial failure handling)
      const responses = [trendingRes, topRatedRes, actionRes, dramaRes, animeRes];
      const jsons = await Promise.all(
        responses.map(async (r) => {
          if (!r.ok) return { results: [] };
          return r.json();
        })
      );

      const [trending, topRated, action, drama, anime] = jsons;

      setSections({
        trending: cleanMovies(trending.results),
        topRated: cleanMovies(topRated.results),
        action: cleanMovies(action.results),
        drama: cleanMovies(drama.results),
        anime: cleanMovies(anime.results),
      });
    } catch (error) {
      console.error("Error fetching homepage sections:", error);
      setSections({
        trending: [],
        topRated: [],
        action: [],
        drama: [],
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
    <section className="movie-section" key={title}>
      <h2 className="section-title">{title}</h2>
      <div className="scroll-row">
        {loading ? (
          [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
        ) : movies.length > 0 ? (
          movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={{
                ...movie,
                poster_path:
                  movie.poster_path || movie.backdrop_path || "/fallback-poster.jpg",
              }}
              onFavoriteToggle={onFavoriteToggle}
              isFavorited={isMovieFavorited(movie)}
            />
          ))
        ) : (
          <p className="no-movies">No movies found 😢</p>
        )}
      </div>
    </section>
  );

  return (
    <div className="homepage">
      {renderSection("🔥 Trending in 2025", sections.trending)}
      {renderSection("👑 Most Viewed of All Time", sections.topRated)}
      {renderSection("💥 Action Movies", sections.action)}
      {renderSection("🎭 Drama Movies", sections.drama)}
      {renderSection("🎌 Anime & Cartoons", sections.anime)}
    </div>
  );
}
