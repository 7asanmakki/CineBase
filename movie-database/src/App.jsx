import { useState, useEffect } from "react";
import ThemeToggle from "./components/ThemeToggle";
import MovieCard from "./components/MovieCard";
import SkeletonCard from "./components/SkeletonCard";
import "./App.css";

const API_KEY = "fe0ea1ba99123d90bdb177714b8c7cd8";
const BASE_URL = "https://api.themoviedb.org/3";

<h1 className="app-title">CineBase</h1>

function App() {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("Avengers");
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchMovies(query);
  }, []);

  const fetchMovies = async (searchQuery) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${searchQuery}`
      );
      const data = await response.json();
      setMovies(data.results || []);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMovies(query);
  };

  const handleFavoriteToggle = (movie) => {
    setFavorites((prev) =>
      prev.some((fav) => fav.id === movie.id)
        ? prev.filter((fav) => fav.id !== movie.id)
        : [...prev, movie]
    );
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1 className="logo"> CineBase</h1>
        <ThemeToggle />
      </header>

      {/* Search Bar */}
      <section className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a movie..."
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
      </section>

      {/* Movies Grid */}
      <main className="movies-grid">
        {loading
          ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
          : movies.length > 0
          ? movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                isFavorited={favorites.some((fav) => fav.id === movie.id)}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))
          : (
            <p className="no-movies">No movies found 😢</p>
          )}
      </main>
    </div>
  );
}

export default App;
