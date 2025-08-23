import { Link } from "react-router-dom";
import { useRef, useCallback } from "react";

export default function MovieCard({ movie, onFavoriteToggle, isFavorited }) {
  const { title, release_date, poster_path, id } = movie;
  const IMG_BASE_URL = "https://image.tmdb.org/t/p/w500";

  const imgRef = useRef(null);

  const checkIfBlack = useCallback((e) => {
    const img = e.currentTarget;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += data[i] + data[i + 1] + data[i + 2]; // R+G+B
    }
    const brightness = sum / (data.length / 4) / 3;

    if (brightness < 10) {
      img.src = `https://placehold.co/400x600?text=No+Image`;
    }
  }, []);

  return (
    <Link
      to={`/movie/${id}`}
      className="relative block overflow-hidden rounded-lg shadow-md hover:shadow-xl transition"
    >
      <img
        ref={imgRef}
        src={
          poster_path
            ? `${IMG_BASE_URL}${poster_path}`
            : `https://placehold.co/400x600?text=No+Image`
        }
        alt={title || "Untitled"}
        loading="lazy"
        className="w-full h-auto object-cover"
        onError={(e) => {
          e.currentTarget.src = `https://placehold.co/400x600?text=No+Image`;
        }}
        onLoad={checkIfBlack}
      />

      <div className="p-2 bg-white dark:bg-gray-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
          {title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {release_date || "Unknown"}
        </p>
      </div>

      <div className="absolute inset-0 flex items-end justify-center bg-black/50 opacity-0 hover:opacity-100 transition">
        <button
          onClick={(e) => {
            e.preventDefault();
            onFavoriteToggle?.(movie);
          }}
          className="mb-2 rounded bg-yellow-400 px-3 py-1 text-sm font-medium text-black hover:bg-yellow-500"
        >
          {isFavorited ? "★ Favorited" : "☆ Favorite"}
        </button>
      </div>
    </Link>
  );
}