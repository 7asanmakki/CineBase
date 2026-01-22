import { Link, NavLink } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Navbar({ favoritesCount = 0 }) {
  return (
    <nav className="flex items-center justify-between bg-gray-100 dark:bg-gray-900 px-6 py-3 shadow-md">
      {/* Left */}
      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
        <Link to="/">CineBase</Link>
      </div>

      {/* Links */}
      <ul className="flex gap-6">
        <li>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `hover:text-blue-500 ${
                isActive ? "text-blue-600 dark:text-blue-400 font-semibold" : "text-gray-700 dark:text-gray-300"
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
              `hover:text-blue-500 ${
                isActive ? "text-blue-600 dark:text-blue-400 font-semibold" : "text-gray-700 dark:text-gray-300"
              }`
            }
          >
            Favorites{favoritesCount ? ` (${favoritesCount})` : ""}
          </NavLink>
        </li>
      </ul>

      {/* Right */}
      <div>
        <ThemeToggle />
      </div>
    </nav>
  );
}