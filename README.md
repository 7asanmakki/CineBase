# 🎬 CineBase

A modern, feature-rich movie database web application built with React and Vite, powered by The Movie Database (TMDB) API.

**Live Demo:** [cinebase-three.vercel.app](https://cinebase-three.vercel.app/)

---

## ✨ Features

### 🎨 Theming & Design
- **Dark & Light Mode:** Toggle between dark and light themes with persistent preference storage
- **Modern UI:** Sleek, responsive design optimized for all screen sizes
- **Custom Branding:** CineBase logo and consistent color palette throughout
- **Smooth Animations:** Skeleton loaders, hover effects, and transitions for polished UX

### 🔍 Discovery & Search
- **Smart Search:** Autocomplete suggestions with highlighted matches as you type
- **Advanced Filtering:** Filter search results by release year
- **Quality Content:** Automatic filtering of low-quality, adult, or inappropriate content
- **Curated Sections:** 
  - Most Viewed of All Time
  - Trending Movies
  - Action, Drama, Cartoons
  - Recent Anime (2020-2025, full-length films only)

### 🎬 Movie Details
- **Rich Information:** Plot, genres, release date, runtime, language, ratings, cast, and director
- **Embedded Trailers:** Watch official YouTube trailers directly in the app
- **Smart Recommendations:** AI-powered "You Might Also Like" section using TMDB's recommendation engine
- **Favorites System:** Save your favorite movies with localStorage persistence

### ⚡ Performance & Quality
- **Optimized Loading:** Shows 16 high-quality movies per section with verified trailers
- **Error Handling:** Comprehensive error boundaries and friendly error messages
- **Network Resilience:** Automatic retries for failed API calls
- **Content Quality:** Multi-layered filtering ensures only high-rated, popular content appears

---

## 🛠️ Tech Stack

- **Frontend:** React 19.1 with Vite 7.1
- **Styling:** Tailwind CSS 4.1 with custom CSS variables
- **State Management:** Zustand 5.0 with persistence middleware
- **Routing:** React Router DOM 7.8
- **API:** The Movie Database (TMDB) API v3
- **Deployment:** Vercel
- **Version Control:** Git & GitHub

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- TMDB API key ([Get one here](https://www.themoviedb.org/settings/api))

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/7asanmakki/CineBase.git
   cd CineBase
```

2. **Install dependencies**
```bash
   npm install
```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
```env
   VITE_API_KEY=your_tmdb_api_key_here
   VITE_API_URL=https://api.themoviedb.org/3
```

4. **Start the development server**
```bash
   npm run dev
```

5. **Open your browser**
   
   Navigate to [http://localhost:5173](http://localhost:5173)

### Building for Production
```bash
npm run build
npm run preview  # Preview the production build locally
```

---

## 🌐 Deployment

CineBase is deployed on Vercel. To deploy your own instance:

1. **Push to GitHub**
```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   
   In Vercel dashboard → Settings → Environment Variables, add:
```
   VITE_API_KEY = your_tmdb_api_key
   VITE_API_URL = https://api.themoviedb.org/3
```

4. **Deploy**
   
   Vercel will automatically build and deploy your app!

---

## 🐛 Common Issues & Troubleshooting

### Search Suggestions Not Working (401 Unauthorized)

**Symptom:** When typing in the search bar, you see `401 Unauthorized` errors in the browser console, and suggestions don't appear.

**Cause:** Mismatch between environment variable names in your code and `.env` file.

**Solution:** 
1. Check your `.env` file contains:
```env
   VITE_API_KEY=your_tmdb_api_key_here
   VITE_API_URL=https://api.themoviedb.org/3
```

2. Verify your code is using `import.meta.env.VITE_API_KEY` (not `VITE_TMDB_API_KEY`)

3. **Important:** After changing `.env`, you MUST restart your development server:
```bash
   # Stop the server (Ctrl+C), then:
   npm run dev
```

**Why this happens:** Vite only reads `.env` files when the dev server starts. Changes to `.env` during runtime are not picked up.

---

### Movies Not Loading / API Errors

**Symptom:** Movies don't appear, or you see "Failed to fetch" errors.

**Common causes:**

1. **Missing `/3` in API URL**
   - ❌ Wrong: `https://api.themoviedb.org`
   - ✅ Correct: `https://api.themoviedb.org/3`

2. **Invalid or missing API key**
   - Get a free key at [TMDB API Settings](https://www.themoviedb.org/settings/api)
   - Make sure there are no extra spaces or quotes in your `.env` file

3. **TMDB API is down**
   - Check [TMDB Status](https://status.themoviedb.org/)

---

### Deployment Issues on Vercel

**Symptom:** App works locally but breaks after deploying to Vercel.

**Solution:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add the same variables from your local `.env`:
```
   VITE_API_KEY = your_tmdb_api_key
   VITE_API_URL = https://api.themoviedb.org/3
```
3. **Critical:** Redeploy after adding environment variables
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Select "Redeploy"

**Note:** Environment variables in Vercel are separate from your local `.env` file. You must set them in both places.

---

### Theme Not Persisting After Refresh

**Symptom:** You toggle to light/dark mode, but after refreshing the page, it resets.

**Cause:** Browser localStorage might be disabled or blocked.

**Solution:**
1. Check if localStorage is enabled in your browser settings
2. Clear browser cache and try again
3. Check browser console for any localStorage-related errors

If the issue persists, check that Zustand's persist middleware is properly configured in `src/store/index.js`.

## 📁 Project Structure
```
CineBase/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx       # Navigation with search & theme toggle
│   │   ├── ThemeToggle.jsx  # Dark/light mode switcher
│   │   ├── MovieCard.jsx    # Movie display card
│   │   ├── SkeletonCard.jsx # Loading placeholder
│   │   ├── Pagination.jsx   # Page navigation
│   │   └── ErrorBoundary.jsx
│   ├── pages/              # Main application pages
│   │   ├── Home.jsx        # Landing page with curated sections
│   │   ├── SearchResults.jsx
│   │   ├── MovieDetails.jsx
│   │   └── Favorites.jsx
│   ├── store/              # Zustand state management
│   │   └── index.js        # Favorites & theme stores
│   ├── utils/              # Utility functions
│   │   └── api.js          # TMDB API integration
│   ├── styles/
│   │   └── index.css       # Custom Tailwind + CSS variables
│   ├── App.jsx             # Root component
│   └── main.jsx            # Application entry point
├── public/                 # Static assets
├── .env                    # Environment variables (not in repo)
├── package.json
├── vite.config.js
└── README.md
```

---

## 🎯 Key Features Explained

### Theme System
CineBase uses CSS custom properties combined with Zustand for theme management:
- Light mode: Clean, modern palette with excellent contrast
- Dark mode: Cinematic dark theme perfect for browsing movies
- Preference persisted to localStorage
- Instant theme switching with smooth transitions

### Content Quality Filters
Multiple layers of filtering ensure you only see quality content:

**For All Movies:**
- Must have poster image
- Must have release date
- Blocks adult/inappropriate content via keyword blacklist
- Removes movies with very low ratings or vote counts

**For Anime:**
- Minimum 60-minute runtime (excludes OVAs, shorts, TV specials)
- Minimum 6.5/10 rating
- At least 100 votes (popular titles only)
- Released 2020-2025 (recent quality films)

### Search Suggestions
Real-time autocomplete with smart filtering:
- Debounced API calls (300ms) to reduce server load
- Filters out low-quality results
- Sorts by popularity
- Shows movie posters, years, and ratings
- Keyboard navigation (arrow keys, enter, escape)
- Click outside to dismiss

### Smart Recommendations
The "You Might Also Like" section uses TMDB's recommendation algorithm:
- Combines `/similar` and `/recommendations` endpoints
- Scores movies by rating, vote count, and popularity
- Filters for quality (min 5.5 rating, 50 votes)
- Shows 12 best matches

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_KEY` | Your TMDB API key | Yes |
| `VITE_API_URL` | TMDB API base URL | Yes |

### API Rate Limits
TMDB free tier allows:
- 50 requests per second
- Unlimited daily requests

The app implements retry logic for failed requests.

---

## 🎨 Customization

### Theme Colors
Edit `src/styles/index.css` to customize the color palette:
```css
:root {
  --bg: #f0f2f5;      /* Light mode background */
  --text: #1f2937;    /* Light mode text */
  --card: #ffffff;    /* Card background */
  --muted: #6b7280;   /* Muted text */
  --brand: #ff4757;   /* Brand accent color */
  --nav: #ffffff;     /* Navbar background */
}

html.dark {
  --bg: #121212;      /* Dark mode background */
  --text: #f4f4f4;    /* Dark mode text */
  --card: #1e1e1e;    /* Dark card background */
  /* ... */
}
```

### Content Sections
Modify `src/pages/Home.jsx` to add or remove movie sections:
- Change genres via `with_genres` parameter
- Adjust quality thresholds
- Modify release date ranges
- Add custom sorting

---

## 🐛 Troubleshooting

### Search suggestions not working
- Verify `VITE_API_KEY` is set correctly in `.env`
- Restart dev server after changing `.env`
- Check browser console for 401 errors

### Movies not loading
- Confirm API key is valid
- Check network connection
- Verify TMDB API status

### Theme not persisting
- Check browser localStorage is enabled
- Clear cache and reload
- Verify Zustand persist middleware is configured

### Deployment issues on Vercel
- Ensure environment variables are set in Vercel dashboard
- Check build logs for errors
- Verify `package.json` scripts are correct

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Author

**Hasan Makki**
- GitHub: [@7asanmakki](https://github.com/7asanmakki)
- Project Link: [https://github.com/7asanmakki/CineBase](https://github.com/7asanmakki/CineBase)

---

## 🙏 Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for their comprehensive API
- [Vite](https://vitejs.dev/) for lightning-fast development experience
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Zustand](https://zustand-demo.pmnd.rs/) for simple state management

---

## 📚 Learn More

- [TMDB API Documentation](https://developers.themoviedb.org/3)
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---


**Built with ❤️ for movie lovers everywhere 🎬🍿**