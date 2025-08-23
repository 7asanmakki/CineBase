import { useFavoritesStore } from "../store";
import MovieCard from "../components/MovieCard";
import { useEffect } from "react";

export default function Favorites() {
  const { favorites, toggleFavorite } = useFavoritesStore();
  
  // Add analytics tracking when component mounts
  useEffect(() => {
    // This would be a real analytics call in a production app
    console.log("Favorites page viewed");
  }, []);

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto">
      <h2 className="text-center text-xl md:text-2xl font-semibold mb-4">⭐ Your Favorites</h2>
      {favorites.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">You haven't added any favorites yet.</p>
          <a href="/" className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">
            Discover Movies
          </a>
        </div>
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
              onFavoriteToggle={toggleFavorite}
            />
          ))}
        </section>
      )}
    </div>
  );
}