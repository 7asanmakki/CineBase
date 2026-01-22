import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Favorites from "./pages/Favorites.jsx";
import MovieDetails from "./pages/MovieDetails.jsx";
import SearchResults from "./pages/SearchResults.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { useFavoritesStore, useThemeStore, useAppStore } from "./store";

export default function App() {
  // Get data and actions from our stores
  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isOnline = useAppStore((state) => state.isOnline);
  const setIsOnline = useAppStore((state) => state.setIsOnline);

  // Set up online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOnline]);

  // Force dark mode always
  useEffect(() => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }, []);

  return (
    <ErrorBoundary>
      {!isOnline && (
        <div className="bg-red-500 text-white text-center py-1 text-sm">
          You are currently offline. Some features may be limited.
        </div>
      )}
      <Navbar favoritesCount={favorites.length} />
      <main>
        <ErrorBoundary>
          <Routes>
            <Route
              path="/"
              element={<Home favorites={favorites} onFavoriteToggle={toggleFavorite} />}
            />
            <Route
              path="/favorites"
              element={<Favorites favorites={favorites} onFavoriteToggle={toggleFavorite} />}
            />
            <Route
              path="/movie/:id"
              element={<MovieDetails onFavoriteToggle={toggleFavorite} favorites={favorites} />}
            />
            <Route
              path="/search"
              element={<SearchResults onFavoriteToggle={toggleFavorite} favorites={favorites} />}
            />
          </Routes>
        </ErrorBoundary>
      </main>
    </ErrorBoundary>
  );
}