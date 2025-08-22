import { Link, NavLink } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Navbar({ favoritesCount = 0 }) {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="logo">CineBase</Link>
      </div>

      <ul className="nav-links">
        <li><NavLink to="/" end className={({isActive}) => (isActive ? "active" : "")}>Home</NavLink></li>
        <li><NavLink to="/favorites" className={({isActive}) => (isActive ? "active" : "")}>Favorites{favoritesCount ? ` (${favoritesCount})` : ""}</NavLink></li>
      </ul>

      <div className="nav-right">
        <ThemeToggle />
      </div>
    </nav>
  );
}
