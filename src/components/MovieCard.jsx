import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Clock, Globe, Ticket, Info } from 'lucide-react';

export default function MovieCard({ movie }) {
  const navigate = useNavigate();

  if (!movie) return null;

  return (
    <div className="movie-card">
      <div className="movie-poster-wrap">
        <img 
          src={movie.posterUrl} 
          alt={movie.title} 
          className="movie-poster-img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80';
          }}
        />
        <div className="movie-rating-chip">
          <Star size={13} fill="#fbbf24" color="#fbbf24" />
          <span>{movie.rating ? movie.rating.toFixed(1) : '8.0'}</span>
        </div>
        <div className="movie-cert-chip">
          {movie.certification || 'U/A'}
        </div>
      </div>

      <div className="movie-info">
        <h3 className="movie-title" title={movie.title}>
          {movie.title}
        </h3>

        <div className="movie-meta">
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={13} /> {movie.duration}m
          </span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Globe size={13} /> {movie.language}
          </span>
        </div>

        <div className="movie-genre-list">
          {(Array.isArray(movie.genre) ? movie.genre : [movie.genre]).slice(0, 3).map((g, idx) => (
            <span key={idx} className="movie-genre-tag">{g}</span>
          ))}
        </div>

        <div className="movie-actions">
          <Link to={`/movies/${movie.id}`} className="btn btn-secondary btn-sm">
            <Info size={14} /> Details
          </Link>
          <button 
            onClick={() => navigate(`/movies/${movie.id}#showtimes`)}
            className="btn btn-primary btn-sm"
          >
            <Ticket size={14} /> Book
          </button>
        </div>
      </div>
    </div>
  );
}
