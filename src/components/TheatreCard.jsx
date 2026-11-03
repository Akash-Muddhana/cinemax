import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Film, Sparkles, ArrowRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectShowsByTheatre } from '../features/shows/showSlice';
import { selectAllMovies } from '../features/movies/movieSlice';

export default function TheatreCard({ theatre }) {
  const shows = useSelector(state => selectShowsByTheatre(state, theatre.id));
  const movies = useSelector(selectAllMovies);

  // Unique movies playing in this theatre
  const playingMovieIds = Array.from(new Set(shows.map(s => s.movieId)));
  const playingMovies = movies.filter(m => playingMovieIds.includes(m.id));

  return (
    <div className="theatre-card">
      <div className="theatre-header">
        <div>
          <h3 className="theatre-name">{theatre.name}</h3>
          <div className="theatre-location">
            <MapPin size={14} color="var(--primary)" />
            <span>{theatre.location}, {theatre.city}</span>
          </div>
        </div>
        <span className="badge badge-red" style={{ fontSize: '0.7rem' }}>
          {theatre.totalRows * theatre.totalCols} Seats
        </span>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.8rem' }}>
        {theatre.address}
      </p>

      {/* Amenities */}
      <div className="theatre-amenities">
        {(theatre.amenities || ['Dolby Atmos', 'Recliners', '4K Laser']).map((amenity, idx) => (
          <span key={idx} className="amenity-chip">
            <Sparkles size={11} color="#ff4d58" style={{ display: 'inline', marginRight: '4px' }} />
            {amenity}
          </span>
        ))}
      </div>

      {/* Playing Movies snippet */}
      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Film size={13} /> Now Screening:
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '600' }}>
            {playingMovies.length} {playingMovies.length === 1 ? 'Movie' : 'Movies'}
          </span>
        </div>

        {playingMovies.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
            {playingMovies.slice(0, 3).map(m => (
              <span 
                key={m.id} 
                style={{
                  fontSize: '0.75rem',
                  background: 'var(--bg-elevated)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  color: '#e2e8f0'
                }}
              >
                {m.title}
              </span>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            No shows scheduled today
          </div>
        )}

        <Link 
          to={`/theatres/${theatre.id}`} 
          className="btn btn-secondary btn-sm btn-block"
          style={{ justifyContent: 'space-between' }}
        >
          <span>View Showtimes & Book</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
