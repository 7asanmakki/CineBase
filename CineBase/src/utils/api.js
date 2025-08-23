const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// Error classes
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export class NetworkError extends Error {
  constructor(message) {
    super(message || 'Network connection failed');
    this.name = 'NetworkError';
  }
}

export async function fetchData(endpoint, params = {}) {
  try {
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.search = new URLSearchParams({ api_key: API_KEY, ...params });
    
    const res = await fetch(url);
    
    if (!res.ok) {
      let errorData = null;
      try {
        errorData = await res.json();
      } catch (e) {
        // If response isn't JSON, continue with null errorData
      }
      
      throw new ApiError(
        errorData?.status_message || `API Error: ${res.status}`,
        res.status,
        errorData
      );
    }
    
    const data = await res.json();
    return data;
  } catch (err) {
    // Re-throw API errors
    if (err instanceof ApiError) throw err;
    
    // Handle network errors
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new NetworkError('Unable to connect to movie database. Please check your internet connection.');
    }
    
    // Other unexpected errors
    console.error('API error:', err);
    throw new Error('An unexpected error occurred while fetching data.');
  }
}

// Enhanced version with retry logic
export async function fetchWithRetry(endpoint, params = {}, retries = 3) {
  let lastError = null;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchData(endpoint, params);
    } catch (error) {
      lastError = error;
      
      // Don't retry on 4xx errors (client errors)
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        break;
      }
      
      // Wait before retrying (exponential backoff)
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
}