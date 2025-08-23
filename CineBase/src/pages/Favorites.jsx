import MovieCard from "../components/MovieCard";

export default function Favorites({ favorites = [], onFavoriteToggle }) {
  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto">
      <h2 className="text-center text-xl md:text-2xl font-semibold mb-4">⭐ Your Favorites</h2>
      {favorites.length === 0 ? (
        <p className="text-center text-gray-500">No favorites yet.</p>
      ) : (
        <section
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4"
          aria-live="polite"
        >
          {favorites.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              isFavorited={true}
              onFavoriteToggle={onFavoriteToggle}
            />
          ))}
        </section>
      )}
    </div>
  );
}