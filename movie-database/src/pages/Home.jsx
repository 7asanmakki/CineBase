import { useState, useEffect } from "react";
import MovieCard from "../components/MovieCard";
import SkeletonCard from "../components/SkeletonCard";

const API_KEY = "fe0ea1ba99123d90bdb177714b8c7cd8";
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

// 🚫 blacklist exact titles (like Bad Guys 2) - Poster issue from THE API Source
const BLOCKED_TITLES = ["the bad guys 2"];

export default function Home() {
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
      if (!m.poster_path) return false; // skip missing/black posters
      if (m.adult) return false;
      if (BLOCKED_TITLES.includes(m.title.toLowerCase())) return false;
      if (BLOCKED_KEYWORDS.some((word) => m.title.toLowerCase().includes(word)))
        return false;
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

      const [trending, topRated, action, drama, anime] = await Promise.all([
        trendingRes.json(),
        topRatedRes.json(),
        actionRes.json(),
        dramaRes.json(),
        animeRes.json(),
      ]);

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
  }, []);

  const renderSection = (title, movies) => (
    <section className="movie-section">
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
