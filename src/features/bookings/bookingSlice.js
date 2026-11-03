import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bookings: [],
  lastCreatedBooking: null,
  error: null
};

export const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    createBookingSuccess: (state, action) => {
      const booking = action.payload;
      state.bookings.unshift(booking);
      state.lastCreatedBooking = booking;
      state.error = null;
    },

    cancelBooking: (state, action) => {
      const bookingId = action.payload;
      const booking = state.bookings.find(b => b.id === bookingId);
      if (booking) {
        booking.status = 'CANCELLED';
        booking.cancelledAt = new Date().toISOString();
      }
    },

    clearLastCreatedBooking: (state) => {
      state.lastCreatedBooking = null;
    },

    setBookingError: (state, action) => {
      state.error = action.payload;
    },

    clearBookingError: (state) => {
      state.error = null;
    }
  }
});

export const {
  createBookingSuccess,
  cancelBooking,
  clearLastCreatedBooking,
  setBookingError,
  clearBookingError
} = bookingSlice.actions;

// Selectors
export const selectAllBookings = (state) => state.bookings.bookings;
export const selectLastCreatedBooking = (state) => state.bookings.lastCreatedBooking;
export const selectBookingError = (state) => state.bookings.error;

export const selectBookingById = (state, bookingId) =>
  state.bookings.bookings.find(b => b.id === bookingId);

export const selectBookingByRef = (state, ref) =>
  state.bookings.bookings.find(b => b.bookingReference.toUpperCase() === (ref || '').toUpperCase());

export const selectUserBookings = (state, userId) => {
  if (!userId) return [];
  return state.bookings.bookings.filter(b => b.userId === userId);
};

export default bookingSlice.reducer;
