import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  movies: [],
  searchQuery: '',
  selectedGenre: 'ALL',
  selectedLanguage: 'ALL'
};

export const movieSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    addMovie: (state, action) => {
      const data = action.payload;
      const newMovie = {
        id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: data.title.trim(),
        description: data.description.trim(),
        genre: Array.isArray(data.genre) ? data.genre : data.genre.split(',').map(g => g.trim()),
        duration: Number(data.duration) || 120,
        language: data.language?.trim() || 'English',
        releaseDate: data.releaseDate || new Date().toISOString().split('T')[0],
        certification: data.certification || 'U/A',
        rating: Number(data.rating) || 8.0,
        director: data.director?.trim() || '',
        cast: Array.isArray(data.cast) ? data.cast : (data.cast || '').split(',').map(c => c.trim()).filter(Boolean),
        posterUrl: data.posterUrl?.trim() || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80',
        bannerUrl: data.bannerUrl?.trim() || '',
        isActive: true,
        createdAt: new Date().toISOString()
      };
      state.movies.unshift(newMovie);
    },

    updateMovie: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.movies.findIndex(m => m.id === id);
      if (index !== -1) {
        state.movies[index] = {
          ...state.movies[index],
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
    },

    deleteMovie: (state, action) => {
      const movieId = action.payload;
      state.movies = state.movies.filter(m => m.id !== movieId);
    },

    setMovieSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },

    setSelectedGenre: (state, action) => {
      state.selectedGenre = action.payload;
    },

    setSelectedLanguage: (state, action) => {
      state.selectedLanguage = action.payload;
    }
  }
});

export const {
  addMovie,
  updateMovie,
  deleteMovie,
  setMovieSearchQuery,
  setSelectedGenre,
  setSelectedLanguage
} = movieSlice.actions;

// Selectors
export const selectAllMovies = (state) => state.movies.movies;
export const selectMovieById = (state, movieId) =>
  state.movies.movies.find(m => m.id === movieId);

export const selectFilteredMovies = (state) => {
  const { movies, searchQuery, selectedGenre, selectedLanguage } = state.movies;
  const query = (searchQuery || '').toLowerCase().trim();

  return movies.filter(m => {
    const matchesSearch = !query ||
      m.title.toLowerCase().includes(query) ||
      m.description.toLowerCase().includes(query) ||
      (m.director && m.director.toLowerCase().includes(query));

    const matchesGenre = !selectedGenre || selectedGenre === 'ALL' ||
      m.genre.some(g => g.toLowerCase() === selectedGenre.toLowerCase());

    const matchesLanguage = !selectedLanguage || selectedLanguage === 'ALL' ||
      m.language.toLowerCase() === selectedLanguage.toLowerCase();

    return matchesSearch && matchesGenre && matchesLanguage && m.isActive;
  });
};

export const selectAllGenres = (state) => {
  const genres = new Set();
  state.movies.movies.forEach(m => {
    if (Array.isArray(m.genre)) {
      m.genre.forEach(g => genres.add(g));
    }
  });
  return ['ALL', ...Array.from(genres)];
};

export default movieSlice.reducer;
