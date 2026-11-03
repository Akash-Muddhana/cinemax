import { createSlice } from '@reduxjs/toolkit';
import { generateShowSeatInventory, getRelativeDateString } from '../../utils/storage.js';

const initialState = {
  shows: [],
  selectedDate: getRelativeDateString(0),
  selectedShowId: null
};

export const showSlice = createSlice({
  name: 'shows',
  initialState,
  reducers: {
    addShow: (state, action) => {
      const {
        movieId,
        theatreId,
        theatreSeatLayout,
        showDate,
        startTime,
        endTime,
        basePrice,
        categoryPricing
      } = action.payload;

      const regularPrice = categoryPricing?.REGULAR || Number(basePrice) || 250;
      const vipPrice = categoryPricing?.VIP || Math.round(regularPrice * 1.4);

      // Generate independent show inventory from theatre layout snapshot
      const seatInventory = generateShowSeatInventory(
        theatreSeatLayout || [],
        regularPrice,
        vipPrice
      );

      const newShow = {
        id: `sh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        movieId,
        theatreId,
        showDate,
        startTime,
        endTime,
        basePrice: regularPrice,
        categoryPricing: {
          REGULAR: regularPrice,
          VIP: vipPrice
        },
        seatInventory,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      };

      state.shows.push(newShow);
    },

    updateShow: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.shows.findIndex(s => s.id === id);
      if (index !== -1) {
        state.shows[index] = {
          ...state.shows[index],
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
    },

    deleteShow: (state, action) => {
      const showId = action.payload;
      state.shows = state.shows.filter(s => s.id !== showId);
      if (state.selectedShowId === showId) {
        state.selectedShowId = null;
      }
    },

    setSelectedShowId: (state, action) => {
      state.selectedShowId = action.payload;
    },

    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },

    // Marks seats as booked inside the show's independent inventory
    bookSeatsInShow: (state, action) => {
      const { showId, seatIds, bookingReference } = action.payload;
      const show = state.shows.find(s => s.id === showId);
      if (show && Array.isArray(show.seatInventory)) {
        show.seatInventory.forEach(seat => {
          if (seatIds.includes(seat.seatId)) {
            seat.status = 'BOOKED';
            seat.bookingReference = bookingReference;
          }
        });
      }
    },

    // Release seats on booking cancellation (if admin or demo cancel)
    releaseSeatsInShow: (state, action) => {
      const { showId, seatIds } = action.payload;
      const show = state.shows.find(s => s.id === showId);
      if (show && Array.isArray(show.seatInventory)) {
        show.seatInventory.forEach(seat => {
          if (seatIds.includes(seat.seatId)) {
            seat.status = 'AVAILABLE';
            seat.bookingReference = null;
          }
        });
      }
    }
  }
});

export const {
  addShow,
  updateShow,
  deleteShow,
  setSelectedShowId,
  setSelectedDate,
  bookSeatsInShow,
  releaseSeatsInShow
} = showSlice.actions;

// Selectors
export const selectAllShows = (state) => state.shows.shows;
export const selectSelectedShowId = (state) => state.shows.selectedShowId;
export const selectSelectedDate = (state) => state.shows.selectedDate;

export const selectShowById = (state, showId) =>
  state.shows.shows.find(s => s.id === showId);

export const selectShowsByMovie = (state, movieId, date = null) => {
  return state.shows.shows.filter(s => {
    const matchMovie = s.movieId === movieId;
    const matchDate = !date || s.showDate === date;
    const isActive = s.status === 'ACTIVE';
    return matchMovie && matchDate && isActive;
  });
};

export const selectShowsByTheatre = (state, theatreId, date = null) => {
  return state.shows.shows.filter(s => {
    const matchTheatre = s.theatreId === theatreId;
    const matchDate = !date || s.showDate === date;
    const isActive = s.status === 'ACTIVE';
    return matchTheatre && matchDate && isActive;
  });
};

export default showSlice.reducer;
