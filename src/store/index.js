import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Create a store for favorites that persists to localStorage
export const useFavoritesStore = create(
  persist(
    (set) => ({
      favorites: [],
      addFavorite: (movie) => 
        set((state) => ({
          favorites: state.favorites.some(m => m.id === movie.id) 
            ? state.favorites 
            : [...state.favorites, movie]
        })),
      removeFavorite: (movieId) => 
        set((state) => ({
          favorites: state.favorites.filter(m => m.id !== movieId)
        })),
      toggleFavorite: (movie) => 
        set((state) => ({
          favorites: state.favorites.some(m => m.id === movie.id) 
            ? state.favorites.filter(m => m.id !== movie.id) 
            : [...state.favorites, movie]
        })),
    }),
    {
      name: 'cinebase-favorites', // unique name for localStorage
    }
  )
);

// Create a store for theme persistence
export const useThemeStore = create(
  persist(
    (set) => ({
      isDarkMode: true, // Default to dark mode
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setDarkMode: () => set({ isDarkMode: true }),
      setLightMode: () => set({ isDarkMode: false }),
    }),
    {
      name: 'cinebase-theme',
    }
  )
);

// Store for API errors and network state
export const useAppStore = create((set) => ({
  isOnline: navigator.onLine,
  apiError: null,
  setIsOnline: (status) => set({ isOnline: status }),
  setApiError: (error) => set({ apiError: error }),
  clearApiError: () => set({ apiError: null }),
}));
