import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Film, 
  Plus, 
  Edit3, 
  Trash2, 
  Star, 
  Clock, 
  Globe, 
  Save, 
  X, 
  Check, 
  Image as ImageIcon 
} from 'lucide-react';
import { selectAllMovies, addMovie, updateMovie, deleteMovie } from '../../features/movies/movieSlice';

export default function ManageMovies() {
  const dispatch = useDispatch();
  const movies = useSelector(selectAllMovies);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: 'Action, Sci-Fi',
    duration: 120,
    language: 'English',
    releaseDate: new Date().toISOString().split('T')[0],
    certification: 'U/A',
    rating: 8.5,
    director: '',
    cast: '',
    posterUrl: '',
    bannerUrl: ''
  });

  const [formErrors, setFormErrors] = useState({});

  const handleOpenAdd = () => {
    setEditingMovie(null);
    setFormData({
      title: '',
      description: '',
      genre: 'Action, Sci-Fi',
      duration: 120,
      language: 'English',
      releaseDate: new Date().toISOString().split('T')[0],
      certification: 'U/A',
      rating: 8.5,
      director: '',
      cast: '',
      posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=80'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      description: movie.description,
      genre: Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre,
      duration: movie.duration,
      language: movie.language,
      releaseDate: movie.releaseDate,
      certification: movie.certification || 'U/A',
      rating: movie.rating || 8.0,
      director: movie.director || '',
      cast: Array.isArray(movie.cast) ? movie.cast.join(', ') : (movie.cast || ''),
      posterUrl: movie.posterUrl,
      bannerUrl: movie.bannerUrl || ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = (movie) => {
    if (window.confirm(`Are you sure you want to remove "${movie.title}" from the catalog?`)) {
      dispatch(deleteMovie(movie.id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Movie title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.genre.trim()) errors.genre = 'At least one genre is required';
    if (!formData.posterUrl.trim()) errors.posterUrl = 'Poster URL is required';
    
    const duration = Number(formData.duration);
    if (!duration || duration <= 0) errors.duration = 'Duration must be positive minutes';

    const rating = Number(formData.rating);
    if (isNaN(rating) || rating < 0 || rating > 10) errors.rating = 'Rating must be between 0 and 10';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const genreList = formData.genre.split(',').map(g => g.trim()).filter(Boolean);
    const castList = formData.cast.split(',').map(c => c.trim()).filter(Boolean);

    if (editingMovie) {
      dispatch(updateMovie({
        id: editingMovie.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        genre: genreList,
        duration: duration,
        language: formData.language.trim(),
        releaseDate: formData.releaseDate,
        certification: formData.certification,
        rating: rating,
        director: formData.director.trim(),
        cast: castList,
        posterUrl: formData.posterUrl.trim(),
        bannerUrl: formData.bannerUrl.trim()
      }));
    } else {
      dispatch(addMovie({
        title: formData.title.trim(),
        description: formData.description.trim(),
        genre: genreList,
        duration: duration,
        language: formData.language.trim(),
        releaseDate: formData.releaseDate,
        certification: formData.certification,
        rating: rating,
        director: formData.director.trim(),
        cast: castList,
        posterUrl: formData.posterUrl.trim(),
        bannerUrl: formData.bannerUrl.trim()
      }));
    }

    setIsModalOpen(false);
  };

  return (
    <div className="container page-wrapper">
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 className="section-title">
            <Film size={26} color="var(--primary)" /> Movie Catalog Management
          </h1>
          <p className="section-subtitle">
            Add blockbusters, edit film metadata, maintain genres, certifications, and high-res promotional posters
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={16} /> Add New Movie
        </button>
      </div>

      {/* Movies Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Poster</th>
              <th>Movie Details</th>
              <th>Genre</th>
              <th>Duration</th>
              <th>Language</th>
              <th>Rating</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {movies.map(movie => (
              <tr key={movie.id}>
                <td style={{ width: '60px' }}>
                  <img 
                    src={movie.posterUrl} 
                    alt={movie.title}
                    style={{ width: '48px', height: '68px', objectFit: 'cover', borderRadius: '4px' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=100&q=80';
                    }}
                  />
                </td>
                <td>
                  <div style={{ fontWeight: '700', color: '#fff', fontSize: '1rem' }}>{movie.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {movie.certification || 'U/A'} • Release: {movie.releaseDate}
                  </div>
                  {movie.director && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dir: {movie.director}</div>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                    {(Array.isArray(movie.genre) ? movie.genre : [movie.genre]).map((g, i) => (
                      <span key={i} className="movie-genre-tag" style={{ fontSize: '0.68rem' }}>{g}</span>
                    ))}
                  </div>
                </td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                    <Clock size={13} color="var(--text-muted)" /> {movie.duration} mins
                  </span>
                </td>
                <td>
                  <span className="badge badge-neutral">{movie.language}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontWeight: '700' }}>
                    <Star size={13} fill="#fbbf24" color="#fbbf24" /> {movie.rating?.toFixed(1) || '8.0'}
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleOpenEdit(movie)}
                      className="btn btn-secondary btn-sm"
                      title="Edit Movie"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(movie)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#ef4444' }}
                      title="Delete Movie"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT MOVIE MODAL */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.8rem' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#fff' }}>
                {editingMovie ? 'Edit Movie' : 'Add New Movie to Catalog'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Movie Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dune: Part Two"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', borderColor: formErrors.title ? '#ef4444' : undefined }}
                />
                {formErrors.title && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{formErrors.title}</span>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Description / Synopsis *
                </label>
                <textarea
                  rows="3"
                  placeholder="Comprehensive plot summary and premise..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', borderColor: formErrors.description ? '#ef4444' : undefined }}
                />
                {formErrors.description && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{formErrors.description}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Genres (comma-separated) *
                  </label>
                  <input
                    type="text"
                    placeholder="Action, Sci-Fi, Drama"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    style={{ width: '100%', borderColor: formErrors.genre ? '#ef4444' : undefined }}
                  />
                  {formErrors.genre && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{formErrors.genre}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Duration (Minutes) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    style={{ width: '100%', borderColor: formErrors.duration ? '#ef4444' : undefined }}
                  />
                  {formErrors.duration && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{formErrors.duration}</span>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Language
                  </label>
                  <input
                    type="text"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Certification
                  </label>
                  <select
                    value={formData.certification}
                    onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="U">U (Universal)</option>
                    <option value="U/A">U/A (Parental Guidance)</option>
                    <option value="A">A (Adults Only)</option>
                    <option value="PG-13">PG-13</option>
                    <option value="R">R (Restricted)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Rating (0 - 10)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Director
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Christopher Nolan"
                    value={formData.director}
                    onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Release Date
                  </label>
                  <input
                    type="date"
                    value={formData.releaseDate}
                    onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Starring Cast (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Actor 1, Actor 2, Actor 3"
                  value={formData.cast}
                  onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Poster Image URL *
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.posterUrl}
                  onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                  style={{ width: '100%', borderColor: formErrors.posterUrl ? '#ef4444' : undefined }}
                />
                {formErrors.posterUrl && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{formErrors.posterUrl}</span>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Banner / Backdrop Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.bannerUrl}
                  onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> {editingMovie ? 'Save Movie Changes' : 'Add Movie to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
