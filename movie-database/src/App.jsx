import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Favorites from "./pages/Favorites.jsx";
import MovieDetails from "./pages/MovieDetails.jsx";

export default function App() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem("cinebase_favorites");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("cinebase_favorites", JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  const toggleFavorite = (movie) => {
    setFavorites((prev) =>
      prev.some((m) => m.id === movie.id)
        ? prev.filter((m) => m.id !== movie.id)
        : [...prev, movie]
    );
  };

  return (
    <>
      <Navbar favoritesCount={favorites.length} />
      <main>
        <Routes>
          <Route
            path="/"
            element={<Home favorites={favorites} onFavoriteToggle={toggleFavorite} />}
          />
          <Route
            path="/favorites"
            element={<Favorites favorites={favorites} onFavoriteToggle={toggleFavorite} />}
          />
          <Route path="/movie/:id" element={<MovieDetails onFavoriteToggle={toggleFavorite} favorites={favorites} />} />
        </Routes>
      </main>
    </>
  );
}
