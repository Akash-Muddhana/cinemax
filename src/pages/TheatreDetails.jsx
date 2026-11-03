import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  MapPin, 
  Sparkles, 
  Calendar, 
  Clock, 
  Film, 
  ChevronLeft, 
  Ticket 
} from 'lucide-react';
import { selectTheatreById } from '../features/theatres/theatreSlice';
import { selectShowsByTheatre } from '../features/shows/showSlice';
import { selectAllMovies } from '../features/movies/movieSlice';
import { getRelativeDateString } from '../utils/storage';
import { formatINR } from '../utils/pricing';

export default function TheatreDetails() {
  const { theatreId } = useParams();
  const navigate = useNavigate();
  const theatre = useSelector(state => selectTheatreById(state, theatreId));
  const movies = useSelector(selectAllMovies);

  const todayStr = getRelativeDateString(0);
  const tomorrowStr = getRelativeDateString(1);
  const dayAfterStr = getRelativeDateString(2);

  const [selectedDate, setSelectedDate] = useState(todayStr);

  const theatreShows = useSelector(state => selectShowsByTheatre(state, theatreId, selectedDate));

  if (!theatre) {
    return (
      <div className="container page-wrapper" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Theatre Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>The requested cinema auditorium could not be found.</p>
        <Link to="/theatres" className="btn btn-primary">
          <ChevronLeft size={16} /> Back to Theatres
        </Link>
      </div>
    );
  }

  const formatDateLabel = (dateStr) => {
    if (dateStr === todayStr) return 'Today';
    if (dateStr === tomorrowStr) return 'Tomorrow';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Group shows by Movie
  const showsByMovie = {};
  theatreShows.forEach(show => {
    if (!showsByMovie[show.movieId]) {
      showsByMovie[show.movieId] = [];
    }
    showsByMovie[show.movieId].push(show);
  });

  return (
    <div className="container page-wrapper">
      <Link to="/theatres" className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
        <ChevronLeft size={15} /> All Theatres
      </Link>

      {/* Theatre Header Hero */}
      <div className="card" style={{ marginBottom: '2.5rem', padding: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem' }}>
          <div>
            <span className="badge badge-red" style={{ marginBottom: '0.6rem' }}>
              CINEMAX PREMIER AUDITORIUM
            </span>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.4rem' }}>
              {theatre.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '0.4rem' }}>
              <MapPin size={16} color="var(--primary)" />
              <span>{theatre.address}, {theatre.location}, {theatre.city}</span>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Auditorium Capacity: {theatre.totalRows * theatre.totalCols} Seats ({theatre.totalRows} Rows × {theatre.totalCols} Columns)
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {(theatre.amenities || ['IMAX Laser', 'Dolby Atmos', 'Recliners']).map((amenity, idx) => (
              <span key={idx} className="amenity-chip" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                <Sparkles size={12} color="#ff4d58" style={{ display: 'inline', marginRight: '5px' }} />
                {amenity}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Date Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <h2 className="section-title" style={{ fontSize: '1.4rem' }}>
          <Calendar size={22} color="var(--primary)" /> Scheduled Movies & Showtimes
        </h2>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[todayStr, tomorrowStr, dayAfterStr].map(dateStr => (
            <button
              key={dateStr}
              type="button"
              onClick={() => setSelectedDate(dateStr)}
              style={{
                padding: '0.5rem 1.1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                background: selectedDate === dateStr ? 'var(--primary)' : 'var(--bg-elevated)',
                color: selectedDate === dateStr ? '#ffffff' : 'var(--text-secondary)',
                border: selectedDate === dateStr ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                transition: 'all 0.2s ease'
              }}
            >
              {formatDateLabel(dateStr)} ({dateStr.split('-').slice(1).join('/')})
            </button>
          ))}
        </div>
      </div>

      {/* Movies Screening List */}
      {Object.keys(showsByMovie).length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {Object.keys(showsByMovie).map(movieId => {
            const movie = movies.find(m => m.id === movieId);
            const movieShows = showsByMovie[movieId];

            return (
              <div 
                key={movieId}
                className="card"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr',
                  gap: '1.5rem',
                  alignItems: 'center'
                }}
              >
                {/* Poster Thumbnail */}
                <div style={{ aspectRatio: '2 / 3', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--bg-surface)' }}>
                  <img 
                    src={movie?.posterUrl} 
                    alt={movie?.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Movie Details & Showtimes */}
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff' }}>
                      {movie?.title}
                    </h3>
                    <span className="badge badge-neutral">{movie?.certification || 'U/A'}</span>
                    <span className="badge badge-neutral">{movie?.language}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{movie?.duration}m</span>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {movie?.description}
                  </p>

                  {/* Showtimes Pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {movieShows.map(show => {
                      const availableCount = show.seatInventory?.filter(s => s.status === 'AVAILABLE').length || 0;
                      const isSoldOut = availableCount === 0;

                      return (
                        <button
                          key={show.id}
                          type="button"
                          disabled={isSoldOut}
                          onClick={() => navigate(`/seat-selection/${show.id}`)}
                          style={{
                            background: 'var(--bg-elevated)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: 'var(--radius-md)',
                            padding: '0.6rem 1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: isSoldOut ? 'not-allowed' : 'pointer',
                            opacity: isSoldOut ? 0.4 : 1,
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSoldOut) {
                              e.currentTarget.style.borderColor = 'var(--primary)';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                            e.currentTarget.style.transform = 'none';
                          }}
                        >
                          <span style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>
                            {show.startTime}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>
                            {formatINR(show.basePrice)}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            {isSoldOut ? 'Sold Out' : `${availableCount} seats left`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <Film size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.8rem' }} />
          <h3 style={{ color: '#fff', marginBottom: '0.4rem' }}>No Screenings Scheduled</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            There are no shows scheduled at this theatre on {formatDateLabel(selectedDate)}. Please choose another date or visit another theatre.
          </p>
        </div>
      )}
    </div>
  );
}
