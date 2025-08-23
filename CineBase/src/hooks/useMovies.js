import { useState, useEffect } from 'react';
import { fetchData, fetchWithRetry } from '../utils/api';

export function useMovie(id) {
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    
    let isMounted = true;
    setLoading(true);
    setError(null);
    
    const fetchMovie = async () => {
      try {
        const [movieData, creditsData] = await Promise.all([
          fetchData(`/movie/${id}`, { language: "en-US" }),
          fetchData(`/movie/${id}/credits`, { language: "en-US" })
        ]);
        
        if (!isMounted) return;
        
        setMovie(movieData);
        setCast((creditsData?.cast || []).slice(0, 6));
      } catch (error) {
        console.error("Error fetching movie:", error);
        if (isMounted) {
          setError(error.message || "Failed to load movie details");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchMovie();
    
    return () => {
      isMounted = false;
    };
  }, [id]);

  const refetch = () => {
    setLoading(true);
    setError(null);
    // The useEffect will run again if we update the id state
  };

  return { movie, cast, loading, error, refetch };
}

export function useMovieSearch(query) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);
    setHasSearched(true);

    fetchData('/search/movie', { query, language: 'en-US', page: 1 })
      .then(data => {
        if (isMounted) {
          setResults(data.results || []);
        }
      })
      .catch(error => {
        console.error("Search error:", error);
        if (isMounted) {
          setError(error.message || "Failed to search movies");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [query]);

  return { results, loading, error, hasSearched };
}
