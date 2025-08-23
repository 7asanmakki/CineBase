# 🎬 CineBase

## 📖 Overview

**CineBase** is a modern, responsive Movie Database Web Application built with **React + Vite**.  
It allows users to search, browse, and explore movies with rich details, trailers, and a beautiful dark-themed UI inspired by the CineBase logo colors (red, white, black).

---

## 🚀 Features

### 🎨 UI/UX & Design
- **Dark Mode Only:** The entire app uses a sleek dark theme with a red/white/black palette matching the CineBase logo.
- **CineBase Logo:** Custom SVG logo in the navbar for brand identity.
- **Responsive Design:** Fully optimized for desktop, tablet, and mobile.
- **Flexible Navbar:** Improved navigation bar with better spacing, alignment, and logo integration.
- **Consistent Card Layouts:** Movie cards and details are visually consistent and responsive.

### 🔍 Search & Discovery
- **Live Search Bar:** Search for movies with instant suggestions.
- **Search Results Pagination:** Efficiently browse large result sets with page navigation.
- **Year Filter:** Filter search results by release year with a stylish dropdown.
- **Error Handling:** Friendly error messages for network/API issues and no results.

### 🎬 Movie Details
- **Rich Movie Info:** View plot, genres, release date, runtime, language, ratings, and cast.
- **YouTube Trailer Embed:** Watch the official trailer directly in the details view.
- **Favorites:** Add/remove movies to your favorites list, stored in localStorage.

### 🏠 Home & Trending
- **Trending in 2025:** Curated trending movies for the year.
- **Top Rated, Action, Drama, Anime:** Browse by popular categories.
- **Horizontal Scroll Sections:** Smooth, responsive horizontal carousels for each section.

### ⭐ Favorites
- **Favorites Page:** View and manage your favorite movies in a grid layout.

### ⚡ Performance & Quality
- **API Integration:** Uses TMDB API for movie data and OMDB for extra ratings.
- **Loading Skeletons:** Animated placeholders for fast, smooth loading.
- **Blacklist Filtering:** Adult/erotic content and unwanted titles are filtered out.
- **Robust Error Boundaries:** Prevents crashes and shows helpful fallback UI.

---

## 🛠️ Tech Stack

- **React (Vite)**
- **TMDB API** & **OMDB API**
- **Tailwind CSS** (with custom variables for CineBase palette)
- **Zustand** (for state management)
- **JavaScript (ES6+)**
- **Git & GitHub**

---

## 📝 How to Run

1. Clone the repo and install dependencies:
   ```bash
   git clone https://github.com/yourusername/cinebase.git
   cd cinebase
   npm install
   ```
2. Add your TMDB and OMDB API keys to a `.env` file:
   ```
   VITE_TMDB_API_KEY=your_tmdb_key
   VITE_OMDB_API_KEY=your_omdb_key
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧩 Project Structure

- `src/components/` – Navbar, MovieCard, SkeletonCard, ThemeToggle, etc.
- `src/pages/` – Home, SearchResults, MovieDetails, Favorites
- `src/styles/` – Custom Tailwind CSS with CineBase color palette
- `src/utils/` – API utilities and error handling
- `public/` – Logo, favicon, and static assets

---

## 👨‍💻 Contributors

- **Hasan Makki** – Project lead, frontend, API integration, UI/UX

---

## 📝 Notes

- **Dark mode only:** The app always uses dark mode for a cinematic experience.
- **Brand colors:** Red, white, and black are used throughout for a cohesive look.
- **No light mode or theme toggle:** The toggle has been removed for simplicity.
- **Trailers:** YouTube trailers are embedded when available.
- **Favorites:** Persisted in localStorage for a personal touch.
- **Blacklist:** Adult and unwanted content is filtered out for safety.

---

