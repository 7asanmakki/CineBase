import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchWithRetry, ApiError, NetworkError } from "../utils/api";
import MovieCard from "../components/MovieCard";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";

const BLOCKED_KEYWORDS = [
  "desire", "erotic", "sex", "sexual", "seductive", "seduction", "lust", "pleasure", "obsession",
  "temptation", "affair", "fantasy", "fantasies", "sensual", "intimate", "passion", "steamy",
  "explicit", "adult", "incest", "taboo", "forbidden", "provocative", "nude", "nudity", "orgy",
  "thralls", "romance", "romantic", "attractive stranger", "seduce", "seduces", "seduced", "seducing",
  "affairs", "affection", "flirt", "flirting", "flirtation", "flings", "one night stand", "cheat",
  "cheating", "cheated", "cheats", "mistress", "lover", "lovers", "sensuality", "arousal", "arouse",
  "aroused", "arousing", "provocation", "provocative", "tempting", "tempted", "tempts", "infidelity",
  "adultery", "fornication", "carnal", "libido", "passionate", "seductress", "seductor", "allure",
  "alluring", "ravish", "ravishing", "ravished", "ravishes", "sultry", "sultriness", "sultrily"
];

function filterRelatedMovies(movies, currentMovieId) {
  return (movies || []).filter(m => {
    if (!m) return false;
    if (m.id === currentMovieId) return false;
    if (!m.poster_path) return false;
    if (m.adult) return false;
    
    // Quality filters
    if (!m.vote_count || m.vote_count <= 50) return false;
    if (!m.vote_average || m.vote_average < 5.5) return false;
    
    if (!m.release_date || m.release_date.toLowerCase() === "unknown") return false;
    if (m.original_language && m.original_language.toLowerCase() !== "en" && m.original_language.toLowerCase() !== "ja") return false;
    
    const title = (m.title || "").toLowerCase();
    const overview = (m.overview || "").toLowerCase();
    if (BLOCKED_KEYWORDS.some(word => title.includes(word) || overview.includes(word))) return false;
    return true;
  });
}

export default function MovieDetails({ onFavoriteToggle, favorites = [] }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [director, setDirector] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({ isError: false, message: "", type: "" });
  const [trailer, setTrailer] = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    setError({ isError: false, message: "", type: "" });

    const fetchMovieDetails = async () => {
      try {
        const movieData = await fetchWithRetry(`/movie/${id}`, { language: 'en-US' });
        if (!mounted) return;

        // Fetch credits (cast & director)
        let creditsData = { cast: [], crew: [] };
        try {
          creditsData = await fetchWithRetry(`/movie/${id}/credits`, { language: 'en-US' });
        } catch (creditsError) {
          console.warn("Failed to fetch credits:", creditsError);
        }

        const directorObj = (creditsData.crew || []).find(c => c.job === "Director");
        setDirector(directorObj);

        // Fetch videos (trailers)
        let trailerKey = null;
        try {
          const videoData = await fetchWithRetry(`/movie/${id}/videos`, { language: 'en-US' });
          if (videoData && Array.isArray(videoData.results)) {
            const ytTrailer = videoData.results.find(
              v => v.site === "YouTube" && v.type === "Trailer"
            );
            const ytAny = videoData.results.find(
              v => v.site === "YouTube"
            );
            trailerKey = ytTrailer?.key || ytAny?.key || null;
          }
        } catch (e) {
          // ignore trailer errors
        }

        if (mounted) {
          setMovie(movieData);
          setCast((creditsData?.cast || []).slice(0, 6));
          const tmdbRating = movieData.vote_average
            ? { Source: "TMDB", Value: `${movieData.vote_average} / 10` }
            : null;
          setRatings([tmdbRating].filter(Boolean));
          setTrailer(trailerKey);
          fetchBetterRelatedMovies(movieData);
        }
      } catch (e) {
        console.error("Movie details error:", e);
        if (!mounted) return;
        if (e instanceof NetworkError) {
          setError({ isError: true, message: e.message, type: "network" });
        } else if (e instanceof ApiError && e.status === 404) {
          setError({ isError: true, message: "We couldn't find that movie. It might have been removed or the ID is incorrect.", type: "not_found" });
        } else {
          setError({ isError: true, message: "Something went wrong while loading the movie details. Please try again later.", type: "general" });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Use TMDB's built-in similar/recommendations endpoints
    const fetchBetterRelatedMovies = async (movieData) => {
      setRelatedLoading(true);
      try {
        // 1. Try similar movies endpoint (most accurate)
        let similarMovies = [];
        try {
          const similar = await fetchWithRetry(`/movie/${id}/similar`, { language: 'en-US', page: 1 });
          similarMovies = similar.results || [];
        } catch (e) {
          console.warn("Similar movies failed:", e);
        }

        // 2. Try recommendations endpoint (also very accurate)
        let recommendedMovies = [];
        try {
          const recommendations = await fetchWithRetry(`/movie/${id}/recommendations`, { language: 'en-US', page: 1 });
          recommendedMovies = recommendations.results || [];
        } catch (e) {
          console.warn("Recommendations failed:", e);
        }

        // Combine and deduplicate
        const combined = [...similarMovies, ...recommendedMovies];
        const unique = {};
        combined.forEach(m => { if (m && m.id) unique[m.id] = m; });
        
        let filtered = filterRelatedMovies(Object.values(unique), movieData.id);
        
        // Sort by popularity and rating
        filtered = filtered.sort((a, b) => {
          const scoreA = (a.vote_average || 0) * Math.log10((a.vote_count || 1) + 1) + (a.popularity || 0) / 10;
          const scoreB = (b.vote_average || 0) * Math.log10((b.vote_count || 1) + 1) + (b.popularity || 0) / 10;
          return scoreB - scoreA;
        });

        setRelatedMovies(filtered.slice(0, 12));
      } catch (e) {
        console.error("Related movies error:", e);
        setRelatedMovies([]);
      } finally {
        setRelatedLoading(false);
      }
    };

    fetchMovieDetails();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error.isError) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <button
          onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")}
          className="mb-4 rounded bg-gray-200 dark:bg-gray-700 px-3 py-1 text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          ← Go Back
        </button>
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-6 rounded-lg text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
            {error.type === "network" ? "Connection Error" : 
             error.type === "not_found" ? "Movie Not Found" : "Error"}
          </h2>
          <p className="mt-3 text-gray-700 dark:text-gray-300">{error.message}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go to Homepage
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">Movie information is not available.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Homepage
        </button>
      </div>
    );
  }

  const isFavorited = favorites.some((f) => f.id === movie.id);

  return (
    <div className="relative p-3 md:p-8 max-w-6xl mx-auto">
      <button
        onClick={() =>
          window.history.length > 1 ? navigate(-1) : navigate("/")
        }
        className="mb-4 rounded bg-gray-200 dark:bg-gray-700 px-3 py-1 text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
      >
        ← Go Back
      </button>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-shrink-0 mx-auto lg:mx-0 w-full sm:w-72 md:w-80 lg:w-[340px]">
          <img
            src={
              movie.poster_path
                ? `${IMG_BASE}${movie.poster_path}`
                : "https://placehold.co/400x600?text=No+Image"
            }
            alt={movie.title}
            className="w-full h-auto rounded-xl shadow-lg object-cover"
            style={{ aspectRatio: "2/3", maxHeight: "80vh" }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            {movie.title}
          </h2>
          <div className="flex flex-wrap gap-2 mb-2">
            {movie.genres?.map((g) => (
              <span
                key={g.id}
                className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded text-xs font-semibold"
              >
                {g.name}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 mb-2">
            <span className="text-gray-900 dark:text-gray-100 font-semibold">
              <strong>Release Date:</strong> {movie.release_date || "Unknown"}
            </span>
            {movie.runtime && (
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Runtime:</strong> {movie.runtime} min
              </span>
            )}
            {movie.original_language && (
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Language:</strong> {movie.original_language.toUpperCase()}
              </span>
            )}
            {movie.adult && (
              <span className="text-red-600 dark:text-red-400 font-semibold">18+</span>
            )}
          </div>
          <div className="flex flex-wrap gap-4 mt-2">
            {ratings.map((r, i) => (
              <span
                key={i}
                className="text-sm bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded font-semibold"
              >
                {r.Source}: {r.Value}
              </span>
            ))}
            {typeof movie.vote_count === "number" && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {movie.vote_count.toLocaleString()} votes
              </span>
            )}
          </div>
          <p className="mt-4 text-gray-800 dark:text-gray-100 whitespace-pre-line">
            {movie.overview || "No description available."}
          </p>

          <div className="mt-6">
            <h3 className="font-semibold mb-2 text-lg text-gray-900 dark:text-gray-100">Trailer</h3>
            {trailer ? (
              <div className="aspect-w-16 aspect-h-9 w-full max-w-2xl rounded overflow-hidden bg-black">
                <iframe
                  title="Movie Trailer"
                  width="100%"
                  height="315"
                  src={`https://www.youtube.com/embed/${trailer}`}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  className="w-full h-64 md:h-80"
                />
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400 text-sm">No trailer available.</div>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={() => onFavoriteToggle?.(movie)}
              type="button"
              className="rounded bg-yellow-400 px-4 py-2 font-medium text-black hover:bg-yellow-500"
            >
              {isFavorited ? "★ Remove Favorite" : "☆ Add to Favorites"}
            </button>
          </div>

          {director && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2 text-lg text-gray-900 dark:text-gray-100">
                Director: <span className="font-normal">{director.name}</span>
              </h3>
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Cast</h3>
            <ul className="flex flex-wrap gap-3">
              {cast.length === 0 && <li className="text-gray-500">No cast info.</li>}
              {cast.map((actor) => (
                <li key={actor.cast_id || actor.credit_id} className="text-sm">
                  <span className="font-medium">{actor.name}</span>
                  {actor.character && (
                    <span className="text-gray-500"> as {actor.character}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {relatedMovies.length > 0 && (
        <div className="mt-10">
          <h3 className="font-semibold mb-3 text-lg text-gray-900 dark:text-gray-100">
            You Might Also Like
          </h3>
          <div className="scroll-row flex gap-4 overflow-x-auto pb-2">
            {relatedMovies.map((rel) => (
              <div key={rel.id} className="flex-shrink-0 w-32 md:w-40">
                <MovieCard
                  movie={rel}
                  onFavoriteToggle={onFavoriteToggle}
                  isFavorited={favorites.some(f => f.id === rel.id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}