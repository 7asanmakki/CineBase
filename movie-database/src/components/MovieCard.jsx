export default function MovieCard({ movie, onFavoriteToggle, isFavorited }) {
  const { title, release_date, poster_path } = movie;
  const IMG_BASE_URL = "https://image.tmdb.org/t/p/w500";

  const img = poster_path
    ? `${IMG_BASE_URL}${poster_path}`
    : `https://placehold.co/400x600?text=${encodeURIComponent(title)}`;

  return (
    <div className="movie-card">
      <img src={img} alt={title} className="movie-poster" loading="lazy" />
      <div className="movie-info">
        <h3>{title}</h3>
        <p>{release_date || "Unknown"}</p>
      </div>
      <div className="overlay">
        <button
          onClick={() => onFavoriteToggle?.(movie)}
          className="favorite-btn"
        >
          {isFavorited ? "★ Favorited" : "☆ Favorite"}
        </button>
      </div>
    </div>
  );
}
