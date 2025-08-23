import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchWithRetry, ApiError, NetworkError } from "../utils/api";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";

export default function MovieDetails({ onFavoriteToggle, favorites = [] }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [trailer, setTrailer] = useState(null); // <-- Add trailer state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({ isError: false, message: "", type: "" });

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    setError({ isError: false, message: "", type: "" });

    const fetchMovieDetails = async () => {
      try {
        // Fetch movie details
        const movieData = await fetchWithRetry(`/movie/${id}`, { language: 'en-US' });
        if (!mounted) return;

        // Fetch credits (cast)
        let creditsData = { cast: [] };
        try {
          creditsData = await fetchWithRetry(`/movie/${id}/credits`, { language: 'en-US' });
        } catch (creditsError) {
          console.warn("Failed to fetch credits:", creditsError);
        }

        // Fetch OMDB ratings if IMDB ID is available
        let omdbRatings = [];
        if (movieData.imdb_id) {
          try {
            const omdbData = await fetch(
              `https://www.omdbapi.com/?apikey=${import.meta.env.VITE_OMDB_API_KEY}&i=${movieData.imdb_id}`
            ).then(r => r.ok ? r.json() : null);
            if (omdbData && omdbData.Ratings) {
              omdbRatings = omdbData.Ratings;
            }
          } catch (omdbError) {
            console.warn("Failed to fetch OMDB data:", omdbError);
          }
        }

        // Fetch videos (trailers)
        let trailerKey = null;
        try {
          const videoData = await fetchWithRetry(`/movie/${id}/videos`, { language: 'en-US' });
          if (videoData && Array.isArray(videoData.results)) {
            // Prefer YouTube trailer, fallback to any YouTube video
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
          setRatings([tmdbRating, ...omdbRatings].filter(Boolean));
          setTrailer(trailerKey);
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

          {/* --- Trailer Section --- */}
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
          {/* --- End Trailer Section --- */}

          <div className="mt-6">
            <button
              onClick={() => onFavoriteToggle?.(movie)}
              type="button"
              className="rounded bg-yellow-400 px-4 py-2 font-medium text-black hover:bg-yellow-500"
            >
              {isFavorited ? "★ Remove Favorite" : "☆ Add to Favorites"}
            </button>
          </div>
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
    </div>
  );
}