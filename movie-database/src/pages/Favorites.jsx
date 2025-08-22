import MovieCard from "../components/MovieCard";

export default function Favorites({ favorites = [], onFavoriteToggle }) {
  return (
    <div style={{ padding: "1.5rem" }}>
      <h2 style={{ textAlign: "center" }}>⭐ Your Favorites</h2>
      {favorites.length === 0 ? (
        <p style={{ textAlign: "center", color: "#777" }}>No favorites yet.</p>
      ) : (
        <section className="movies-grid" aria-live="polite">
          {favorites.map((movie) => (
            <MovieCard key={movie.id} movie={movie} isFavorited={true} onFavoriteToggle={onFavoriteToggle} />
          ))}
        </section>
      )}
    </div>
  );
}
