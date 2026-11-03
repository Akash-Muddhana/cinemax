import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Search, 
  Film, 
  MapPin, 
  Sparkles, 
  Calendar, 
  ChevronRight, 
  Flame, 
  ShieldCheck, 
  Tv, 
  Armchair, 
  QrCode 
} from 'lucide-react';
import { selectAllMovies, selectAllGenres } from '../features/movies/movieSlice';
import { selectAllTheatres } from '../features/theatres/theatreSlice';
import MovieCard from '../components/MovieCard';
import TheatreCard from '../components/TheatreCard';

export default function Home() {
  const navigate = useNavigate();
  const movies = useSelector(selectAllMovies);
  const theatres = useSelector(selectAllTheatres);
  const genres = useSelector(selectAllGenres);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('ALL');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const filteredMovies = movies.filter(m => {
    const matchesSearch = !searchQuery || 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGenre = selectedGenre === 'ALL' || 
      (Array.isArray(m.genre) ? m.genre.includes(selectedGenre) : m.genre === selectedGenre);

    return matchesSearch && matchesGenre;
  });

  return (
    <div style={{ flex: 1 }}>
      {/* Cinematic Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-tagline">
              <Flame size={14} /> Premier Cinematic Experience
            </div>
            <h1 className="hero-title">
              Experience Cinema Like <span style={{ color: 'var(--primary)' }}>Never Before</span>
            </h1>
            <p className="hero-description">
              Immerse yourself in crystal-clear IMAX 4K Laser projection, cutting-edge Dolby Atmos surround audio, and ultra-plush VIP recliners.
            </p>

            {/* Quick Hero Search */}
            <form onSubmit={handleSearchSubmit} className="hero-search-bar" style={{ maxWidth: '540px' }}>
              <Search size={20} color="var(--text-muted)" style={{ marginLeft: '0.5rem', alignSelf: 'center' }} />
              <input
                type="text"
                placeholder="Search movies, blockbusters, or directors..."
                className="hero-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0.6rem 1.2rem' }}>
                Search
              </button>
            </form>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <Link to="/movies" className="btn btn-primary">
                <Film size={16} /> Browse All Movies
              </Link>
              <Link to="/theatres" className="btn btn-secondary">
                <MapPin size={16} /> Find Theatres
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container page-wrapper">
        {/* Now Showing Section */}
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem' }}>
            <div>
              <h2 className="section-title">
                <Film size={24} color="var(--primary)" /> Now Showing
              </h2>
              <p className="section-subtitle" style={{ marginBottom: 0 }}>
                Explore popular blockbusters playing right now in CINEMAX theatres
              </p>
            </div>

            <Link to="/movies" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: '600', fontSize: '0.92rem' }}>
              View all ({movies.length}) <ChevronRight size={16} />
            </Link>
          </div>

          {/* Genre Filter Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.8rem' }}>
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  background: selectedGenre === genre ? 'var(--primary)' : 'var(--bg-elevated)',
                  color: selectedGenre === genre ? '#fff' : 'var(--text-secondary)',
                  border: selectedGenre === genre ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {genre}
              </button>
            ))}
          </div>

          {/* Movie Cards Grid */}
          <div className="movie-grid">
            {filteredMovies.slice(0, 6).map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {filteredMovies.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <Film size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Movies Found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                No films matched your search or genre filter. Try selecting a different category.
              </p>
            </div>
          )}
        </section>

        {/* Feature Highlights Banner */}
        <section style={{ marginBottom: '4rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem'
          }}>
            <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(229, 9, 20, 0.15)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'var(--primary)' }}>
                <Tv size={24} />
              </div>
              <div>
                <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.4rem' }}>IMAX Laser & Dolby</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                  Next-gen dual 4K laser projection with immersive multi-dimensional sound systems.
                </p>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: '#10b981' }}>
                <Armchair size={24} />
              </div>
              <div>
                <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.4rem' }}>VIP Recliners & Lounges</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                  Motorized leather recliners with in-seat gourmet dining service at your fingertips.
                </p>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(37, 99, 235, 0.15)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: '#3b82f6' }}>
                <QrCode size={24} />
              </div>
              <div>
                <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.4rem' }}>Instant QR E-Tickets</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                  Seamless digital entry with unique encrypted QR codes generated right in your browser.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Theatres Section */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h2 className="section-title">
                <MapPin size={24} color="var(--primary)" /> Premier Cinema Locations
              </h2>
              <p className="section-subtitle" style={{ marginBottom: 0 }}>
                State-of-the-art auditoriums across premier destinations
              </p>
            </div>
            <Link to="/theatres" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: '600', fontSize: '0.92rem' }}>
              All theatres ({theatres.length}) <ChevronRight size={16} />
            </Link>
          </div>

          <div className="theatre-grid">
            {theatres.map(theatre => (
              <TheatreCard key={theatre.id} theatre={theatre} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
