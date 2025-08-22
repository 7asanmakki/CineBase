import { Link } from "react-router-dom";
import { useRef } from "react";

export default function MovieCard({ movie, onFavoriteToggle, isFavorited }) {
  const { title, release_date, poster_path, id } = movie;
  const IMG_BASE_URL = "https://image.tmdb.org/t/p/w500";

  const imgRef = useRef(null);

  const checkIfBlack = (e) => {
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
  };

  return (
    <Link to={`/movie/${id}`} className="movie-card">
      <img
        ref={imgRef}
        src={
          poster_path
            ? `${IMG_BASE_URL}${poster_path}`
            : `https://placehold.co/400x600?text=No+Image`
        }
        alt={title || "Untitled"}
        loading="lazy"
        className="movie-poster"
        onError={(e) => {
          e.currentTarget.src = `https://placehold.co/400x600?text=No+Image`;
        }}
        onLoad={checkIfBlack} 
      />

      <div className="movie-info">
        <h3>{title}</h3>
        <p>{release_date || "Unknown"}</p>
      </div>

      <div className="overlay">
        <button
          onClick={(e) => {
            e.preventDefault();
            onFavoriteToggle?.(movie);
          }}
          className="favorite-btn"
        >
          {isFavorited ? "★ Favorited" : "☆ Favorite"}
        </button>
      </div>
    </Link>
  );
}
