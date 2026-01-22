import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import ThemeToggle from "./ThemeToggle";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

export default function Navbar({ favoritesCount = 0 }) {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const navigate = useNavigate();
  const location = useLocation();
  const abortRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // highlight helper: returns array of React nodes with matched substring bolded
  const highlightMatch = (text = "", q = "") => {
    if (!q) return text;
    const regex = new RegExp(`(${q.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "ig");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-100 dark:bg-yellow-700 font-semibold px-0.5 rounded">{part}</mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  // fetch suggestions (simple TMDB search)
  const fetchSuggestions = useCallback(
    async (q) => {
      if (!q) {
        setSuggestions([]);
        setLoadingSuggestions(false);
        return;
      }
      setLoadingSuggestions(true);
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      try {
        const url = `${TMDB_BASE}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
          q
        )}&page=1&language=en-US`;
        const res = await fetch(url, { signal: abortRef.current.signal });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setSuggestions((data.results || []).slice(0, 7));
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("Suggestion fetch error:", e);
          setSuggestions([]);
        }
      } finally {
        setLoadingSuggestions(false);
      }
    },
    []
  );

  // debounce effect
  useEffect(() => {
    if (!search) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const id = setTimeout(() => {
      fetchSuggestions(search);
      setShowSuggestions(true);
      setActiveIndex(-1);
    }, 300);
    return () => {
      clearTimeout(id);
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, [search, fetchSuggestions]);

  // keyboard navigation inside suggestions
  const onKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
      setTimeout(() => {
        const el = listRef.current?.querySelector(`[data-idx="${activeIndex + 1}"]`);
        el?.scrollIntoView({ block: "nearest" });
      }, 0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      setTimeout(() => {
        const el = listRef.current?.querySelector(`[data-idx="${activeIndex - 1}"]`);
        el?.scrollIntoView({ block: "nearest" });
      }, 0);
    } else if (e.key === "Enter") {
      // if a suggestion is active, navigate to that movie
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault();
        const sel = suggestions[activeIndex];
        setShowSuggestions(false);
        setSearch("");
        navigate(`/movie/${sel.id}`);
      }
      // otherwise default form submit will run (handled by form)
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // hide suggestions on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (
        !inputRef.current?.contains(e.target) &&
        !listRef.current?.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full bg-gray-100 dark:bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-2 md:gap-0 px-3 md:px-6 py-2 md:py-0">
        {/* Left: Logo */}
        <div className="flex items-center gap-3 flex-shrink-0 py-2 md:py-0">
          <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition">
            CineBase
          </Link>
        </div>

        {/* Center: Search Bar */}
        <form
          onSubmit={handleSearch}
          className="relative flex items-center flex-1 max-w-lg mx-auto md:mx-6 w-full"
          role="search"
          aria-haspopup="listbox"
          aria-expanded={showSuggestions}
        >
          <input
            ref={inputRef}
            type="text"
            className="flex-1 px-3 py-2 rounded-l bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none"
            placeholder="Search movies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Search movies"
            onFocus={() => { if (suggestions.length) setShowSuggestions(true); }}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-r bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Search
          </button>
          {/* Suggestions dropdown */}
          {showSuggestions && (
            <ul
              ref={listRef}
              role="listbox"
              aria-label="Search suggestions"
              className="absolute left-0 right-0 top-full mt-2 max-h-72 overflow-auto z-60 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-b shadow-xl"
            >
              {loadingSuggestions && (
                <li className="p-3 text-sm text-gray-600 dark:text-gray-300">Loading...</li>
              )}
              {!loadingSuggestions && suggestions.length === 0 && (
                <li className="p-3 text-sm text-gray-600 dark:text-gray-300">No suggestions</li>
              )}
              {!loadingSuggestions &&
                suggestions.map((s, idx) => (
                  <li
                    key={s.id}
                    data-idx={idx}
                    role="option"
                    aria-selected={activeIndex === idx}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setShowSuggestions(false);
                      setSearch("");
                      navigate(`/movie/${s.id}`);
                    }}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`flex items-start gap-3 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      activeIndex === idx ? "bg-gray-100 dark:bg-gray-700" : ""
                    }`}
                  >
                    <img
                      src={
                        s.poster_path
                          ? `https://image.tmdb.org/t/p/w92${s.poster_path}`
                          : "https://placehold.co/92x138?text=No+Img"
                      }
                      alt={s.title}
                      className="w-10 h-14 object-cover rounded flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/92x138?text=No+Img";
                      }}
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight" title={s.title}>
                        {highlightMatch(s.title, search)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex gap-2 mt-1">
                        <span>{s.release_date ? s.release_date.slice(0, 4) : "Unknown"}</span>
                        {typeof s.vote_average === "number" && (
                          <span className="inline-block bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded text-xs font-semibold">
                            {Number(s.vote_average).toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </form>

        {/* Right: Links and Theme Toggle */}
        <div className="flex items-center gap-2 md:gap-4 ml-0 md:ml-auto py-2 md:py-0">
          <ul className="flex gap-2 md:gap-4 items-center">
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-2 py-1 rounded transition font-medium ${
                    isActive
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                  }`
                }
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/favorites"
                className={({ isActive }) =>
                  `px-2 py-1 rounded transition font-medium ${
                    isActive
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                  }`
                }
              >
                Favorites{favoritesCount ? ` (${favoritesCount})` : ""}
              </NavLink>
            </li>
          </ul>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}