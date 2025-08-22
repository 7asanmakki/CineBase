// src/pages/MovieDetails.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

export default function MovieDetails({ onFavoriteToggle, favorites = [] }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    setErrorMsg("");
    fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to fetch movie (${r.status})`);
        return r.json();
      })
      .then((data) => {
        if (mounted) setMovie(data);
      })
      .catch((e) => {
        console.error(e);
        if (mounted) setErrorMsg("Could not load movie details.");
      })
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, [id]);

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (errorMsg) return <p style={{ textAlign: "center", color: "red" }}>{errorMsg}</p>;
  if (!movie) return <p style={{ textAlign: "center" }}>Movie not found</p>;

  const isFavorited = favorites.some((f) => f.id === movie.id);

  return (
    <div className="movie-details" style={{ position: "relative" }}>
      <button onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))} className="back-button">
        ← Go Back
      </button>

      <div className="movie-details-content">
        <img
          src={movie.poster_path ? `${IMG_BASE}${movie.poster_path}` : "https://placehold.co/400x600?text=No+Image"}
          alt={movie.title}
          className="movie-details-poster"
        />

        <div className="movie-details-info">
          <h2>{movie.title}</h2>
          <p><strong>Release Date:</strong> {movie.release_date || "Unknown"}</p>
          <p><strong>Rating:</strong> {movie.vote_average || "—"} ⭐</p>
          <p style={{ marginTop: "1rem" }}>{movie.overview || "No description available."}</p>

          <div style={{ marginTop: "1.5rem" }}>
            <button
              onClick={() => onFavoriteToggle?.(movie)}
              className="favorite-btn"
              type="button"
            >
              {isFavorited ? "★ Remove Favorite" : "☆ Add to Favorites"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
