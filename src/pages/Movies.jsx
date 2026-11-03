import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Film, Search, Filter, RotateCcw } from 'lucide-react';
import { selectAllMovies, selectAllGenres } from '../features/movies/movieSlice';
import MovieCard from '../components/MovieCard';

export default function Movies() {
  const [searchParams] = useSearchParams();
  const movies = useSelector(selectAllMovies);
  const genres = useSelector(selectAllGenres);

  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  // Extract unique languages
  const languages = ['ALL', ...Array.from(new Set(movies.map(m => m.language).filter(Boolean)))];

  const filteredMovies = movies.filter(movie => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      movie.title.toLowerCase().includes(q) ||
      movie.description.toLowerCase().includes(q) ||
      (movie.director && movie.director.toLowerCase().includes(q));

    const matchesGenre = selectedGenre === 'ALL' ||
      (Array.isArray(movie.genre) 
        ? movie.genre.some(g => g.toLowerCase() === selectedGenre.toLowerCase())
        : movie.genre.toLowerCase() === selectedGenre.toLowerCase());

    const matchesLanguage = selectedLanguage === 'ALL' ||
      movie.language.toLowerCase() === selectedLanguage.toLowerCase();

    return matchesSearch && matchesGenre && matchesLanguage && movie.isActive;
  });

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('ALL');
    setSelectedLanguage('ALL');
  };

  return (
    <div className="container page-wrapper">
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title">
          <Film size={26} color="var(--primary)" /> All Movies
        </h1>
        <p className="section-subtitle">
          Explore movies currently screening and book your tickets instantly
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          alignItems: 'center'
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search 
              size={18} 
              color="var(--text-muted)" 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} 
            />
            <input
              type="text"
              placeholder="Search movie titles or cast..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Genre Dropdown */}
          <div>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              style={{ width: '100%' }}
            >
              {genres.map(g => (
                <option key={g} value={g}>
                  Genre: {g === 'ALL' ? 'All Genres' : g}
                </option>
              ))}
            </select>
          </div>

          {/* Language Dropdown */}
          <div>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              style={{ width: '100%' }}
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>
                  Language: {lang === 'ALL' ? 'All Languages' : lang}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Action */}
          <div>
            <button 
              type="button" 
              onClick={handleResetFilters}
              className="btn btn-secondary btn-block"
              style={{ height: '42px' }}
            >
              <RotateCcw size={15} /> Reset Filters
            </button>
          </div>
        </div>

        {/* Quick Genre Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'center', marginRight: '0.4rem' }}>
            Quick Filter:
          </span>
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              style={{
                fontSize: '0.75rem',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                background: selectedGenre === genre ? 'var(--primary)' : 'var(--bg-elevated)',
                color: selectedGenre === genre ? '#fff' : 'var(--text-secondary)',
                border: selectedGenre === genre ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                cursor: 'pointer'
              }}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
        <span>Showing <strong>{filteredMovies.length}</strong> movies</span>
      </div>

      {/* Movies Grid */}
      <div className="movie-grid">
        {filteredMovies.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      {filteredMovies.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Film size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>No Movies Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            We couldn't find any movies matching your current filters.
          </p>
          <button onClick={handleResetFilters} className="btn btn-primary btn-sm">
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}
