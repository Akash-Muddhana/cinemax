import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Star, 
  Clock, 
  Globe, 
  Calendar, 
  MapPin, 
  Sparkles, 
  Ticket, 
  ChevronLeft, 
  User, 
  Clapperboard, 
  CheckCircle 
} from 'lucide-react';
import { selectMovieById } from '../features/movies/movieSlice';
import { selectAllTheatres } from '../features/theatres/theatreSlice';
import { selectShowsByMovie } from '../features/shows/showSlice';
import { getRelativeDateString } from '../utils/storage';
import { formatINR } from '../utils/pricing';

export default function MovieDetails() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const movie = useSelector(state => selectMovieById(state, movieId));
  const theatres = useSelector(selectAllTheatres);

  const todayStr = getRelativeDateString(0);
  const tomorrowStr = getRelativeDateString(1);
  const dayAfterStr = getRelativeDateString(2);

  const [selectedDate, setSelectedDate] = useState(todayStr);

  const allMovieShows = useSelector(state => selectShowsByMovie(state, movieId, selectedDate));

  if (!movie) {
    return (
      <div className="container page-wrapper" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Movie Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>The requested movie could not be located in our catalog.</p>
        <Link to="/movies" className="btn btn-primary">
          <ChevronLeft size={16} /> Back to Movies
        </Link>
      </div>
    );
  }

  // Format date readable
  const formatDateLabel = (dateStr) => {
    if (dateStr === todayStr) return 'Today';
    if (dateStr === tomorrowStr) return 'Tomorrow';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Group shows by theatre
  const showsByTheatre = {};
  allMovieShows.forEach(show => {
    if (!showsByTheatre[show.theatreId]) {
      showsByTheatre[show.theatreId] = [];
    }
    showsByTheatre[show.theatreId].push(show);
  });

  return (
    <div>
      {/* Cinematic Backdrop Banner */}
      <div 
        style={{
          position: 'relative',
          minHeight: '380px',
          background: `linear-gradient(180deg, rgba(10, 11, 14, 0.4) 0%, rgba(10, 11, 14, 0.95) 90%, #0a0b0e 100%), url(${movie.bannerUrl || movie.posterUrl}) center/cover no-repeat`,
          display: 'flex',
          alignItems: 'flex-end',
          paddingBottom: '2.5rem'
        }}
      >
        <div className="container" style={{ width: '100%' }}>
          <Link to="/movies" className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
            <ChevronLeft size={15} /> Back to Movies
          </Link>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-end' }}>
            {/* Poster Card */}
            <div style={{
              width: '200px',
              aspectRatio: '2 / 3',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: '0 16px 40px rgba(0,0,0,0.8)',
              border: '2px solid rgba(255,255,255,0.12)',
              flexShrink: 0
            }}>
              <img 
                src={movie.posterUrl} 
                alt={movie.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Movie Title & Badges */}
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.8rem' }}>
                <span className="badge badge-red">{movie.certification || 'U/A'}</span>
                <span className="badge badge-neutral">{movie.language}</span>
                <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Star size={12} fill="#fbbf24" color="#fbbf24" /> {movie.rating?.toFixed(1) || '8.0'}
                </span>
              </div>

              <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.6rem' }}>
                {movie.title}
              </h1>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={15} /> {movie.duration} mins
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={15} /> Release: {movie.releaseDate}
                </span>
                {movie.director && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Clapperboard size={15} /> Dir: {movie.director}
                  </span>
                )}
              </div>

              {/* Genre Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {(Array.isArray(movie.genre) ? movie.genre : [movie.genre]).map((g, idx) => (
                  <span key={idx} className="movie-genre-tag" style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}>
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container page-wrapper">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          {/* Left Column: Synopsis, Cast */}
          <div>
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#fff' }}>Synopsis</h3>
              <p style={{ color: '#cbd5e1', lineHeight: '1.7', fontSize: '0.95rem' }}>
                {movie.description}
              </p>
            </div>

            {movie.cast && movie.cast.length > 0 && (
              <div className="card">
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={18} color="var(--primary)" /> Starring Cast
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                  {(Array.isArray(movie.cast) ? movie.cast : movie.cast.split(',')).map((actor, idx) => (
                    <div 
                      key={idx}
                      style={{
                        background: 'var(--bg-elevated)',
                        padding: '0.5rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.85rem',
                        color: '#fff',
                        fontWeight: '500'
                      }}
                    >
                      {actor.trim()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Showtimes & Theatres Booking */}
          <div id="showtimes" style={{ gridColumn: 'span 2' }}>
            <div className="card">
              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Ticket size={20} color="var(--primary)" /> Select Showtime & Theatre
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                Pick a screening date to view available auditoriums and reserve seats
              </p>

              {/* Date Selector Tabs */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                {[todayStr, tomorrowStr, dayAfterStr].map(dateStr => (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => setSelectedDate(dateStr)}
                    style={{
                      padding: '0.65rem 1.4rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      background: selectedDate === dateStr ? 'var(--primary)' : 'var(--bg-elevated)',
                      color: selectedDate === dateStr ? '#ffffff' : 'var(--text-secondary)',
                      border: selectedDate === dateStr ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>{formatDateLabel(dateStr)}</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{dateStr}</span>
                  </button>
                ))}
              </div>

              {/* Theatres with Shows */}
              {Object.keys(showsByTheatre).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {Object.keys(showsByTheatre).map(theatreId => {
                    const theatre = theatres.find(t => t.id === theatreId);
                    const theatreShows = showsByTheatre[theatreId];

                    return (
                      <div 
                        key={theatreId}
                        style={{
                          background: 'var(--bg-surface)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1.25rem',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '0.5rem' }}>
                          <div>
                            <h4 style={{ color: '#fff', fontSize: '1.15rem' }}>{theatre?.name}</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                              <MapPin size={13} /> {theatre?.location}, {theatre?.city}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '0.3rem' }}>
                            {(theatre?.amenities || ['Dolby Atmos']).slice(0, 2).map((a, i) => (
                              <span key={i} className="amenity-chip" style={{ fontSize: '0.7rem' }}>{a}</span>
                            ))}
                          </div>
                        </div>

                        {/* Showtimes Pills */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                          {theatreShows.map(show => {
                            // Calculate available seats count in this show
                            const availableSeatsCount = show.seatInventory?.filter(s => s.status === 'AVAILABLE').length || 0;
                            const isAlmostFull = availableSeatsCount <= 10 && availableSeatsCount > 0;
                            const isSoldOut = availableSeatsCount === 0;

                            return (
                              <button
                                key={show.id}
                                type="button"
                                disabled={isSoldOut}
                                onClick={() => navigate(`/seat-selection/${show.id}`)}
                                style={{
                                  background: 'var(--bg-card)',
                                  border: '1px solid rgba(255,255,255,0.12)',
                                  borderRadius: 'var(--radius-md)',
                                  padding: '0.65rem 1rem',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: '3px',
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
                                <span style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff' }}>
                                  {show.startTime}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>
                                  From {formatINR(show.basePrice)}
                                </span>
                                <span style={{ fontSize: '0.68rem', color: isAlmostFull ? '#ff4d58' : 'var(--text-muted)' }}>
                                  {isSoldOut ? 'Sold Out' : `${availableSeatsCount} seats left`}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                  <Calendar size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.8rem' }} />
                  <h4 style={{ color: '#fff', marginBottom: '0.4rem' }}>No Screenings Scheduled</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                    There are no scheduled shows for this movie on {formatDateLabel(selectedDate)}. Please select another date.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
