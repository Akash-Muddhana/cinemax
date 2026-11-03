import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import theatreReducer from '../features/theatres/theatreSlice.js';
import movieReducer from '../features/movies/movieSlice.js';
import showReducer from '../features/shows/showSlice.js';
import seatReducer from '../features/seats/seatSlice.js';
import bookingReducer from '../features/bookings/bookingSlice.js';
import adminReducer from '../features/admin/adminSlice.js';
import { loadPersistedState, savePersistedState } from '../utils/storage.js';

// Safe initial load from localStorage (or defaults if missing)
const preloadedState = loadPersistedState();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theatres: theatreReducer,
    movies: movieReducer,
    shows: showReducer,
    seats: seatReducer,
    bookings: bookingReducer,
    admin: adminReducer
  },
  preloadedState
});

// Auto-save changes to localStorage with gentle throttle
let saveTimeout = null;
store.subscribe(() => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    savePersistedState(store.getState());
  }, 300);
});

export default store;
