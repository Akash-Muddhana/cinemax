import { createSlice } from '@reduxjs/toolkit';
import { generateDefaultSeatLayout } from '../../utils/storage.js';

const initialState = {
  theatres: [],
  searchQuery: '',
  locationFilter: 'ALL'
};

export const theatreSlice = createSlice({
  name: 'theatres',
  initialState,
  reducers: {
    addTheatre: (state, action) => {
      const data = action.payload;
      const rows = Number(data.totalRows) || 8;
      const cols = Number(data.totalCols) || 10;
      const defaultPrice = Number(data.defaultPrice) || 250;

      const newTheatre = {
        id: `th_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: data.name.trim(),
        location: data.location.trim(),
        city: data.city?.trim() || 'Metropolis',
        address: data.address.trim(),
        totalRows: rows,
        totalCols: cols,
        defaultPrice,
        seatLayout: data.seatLayout && data.seatLayout.length > 0 
          ? data.seatLayout 
          : generateDefaultSeatLayout(rows, cols, defaultPrice),
        amenities: data.amenities || ['Dolby 7.1', 'Air Conditioned', 'Food Court'],
        image: data.image || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
        isActive: true,
        createdAt: new Date().toISOString()
      };
      state.theatres.unshift(newTheatre);
    },

    updateTheatre: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.theatres.findIndex(t => t.id === id);
      if (index !== -1) {
        state.theatres[index] = {
          ...state.theatres[index],
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
    },

    updateTheatreLayout: (state, action) => {
      const { theatreId, seatLayout, totalRows, totalCols } = action.payload;
      const theatre = state.theatres.find(t => t.id === theatreId);
      if (theatre) {
        theatre.seatLayout = seatLayout;
        if (totalRows) theatre.totalRows = totalRows;
        if (totalCols) theatre.totalCols = totalCols;
        theatre.updatedAt = new Date().toISOString();
      }
    },

    deleteTheatre: (state, action) => {
      const theatreId = action.payload;
      state.theatres = state.theatres.filter(t => t.id !== theatreId);
    },

    setTheatreSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },

    setLocationFilter: (state, action) => {
      state.locationFilter = action.payload;
    }
  }
});

export const {
  addTheatre,
  updateTheatre,
  updateTheatreLayout,
  deleteTheatre,
  setTheatreSearchQuery,
  setLocationFilter
} = theatreSlice.actions;

// Selectors
export const selectAllTheatres = (state) => state.theatres.theatres;
export const selectTheatreById = (state, theatreId) => 
  state.theatres.theatres.find(t => t.id === theatreId);

export const selectFilteredTheatres = (state) => {
  const { theatres, searchQuery, locationFilter } = state.theatres;
  const query = (searchQuery || '').toLowerCase().trim();

  return theatres.filter(t => {
    const matchesSearch = !query || 
      t.name.toLowerCase().includes(query) ||
      t.location.toLowerCase().includes(query) ||
      t.address.toLowerCase().includes(query);

    const matchesLocation = !locationFilter || 
      locationFilter === 'ALL' || 
      t.location.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesLocation && t.isActive;
  });
};

export const selectUniqueLocations = (state) => {
  const locs = state.theatres.theatres.map(t => t.location);
  return Array.from(new Set(locs.filter(Boolean)));
};

export default theatreSlice.reducer;
