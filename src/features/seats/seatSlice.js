import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedShowId: null,
  selectedSeats: [] // Array of { seatId, row, col, category, price }
};

export const seatSlice = createSlice({
  name: 'seats',
  initialState,
  reducers: {
    // Set active show for seat selection; clears if switching show
    initShowSeatSelection: (state, action) => {
      const showId = action.payload;
      if (state.selectedShowId !== showId) {
        state.selectedShowId = showId;
        state.selectedSeats = [];
      }
    },

    // Toggle seat selection
    toggleSeat: (state, action) => {
      const seat = action.payload; // { seatId, row, col, category, price, status }
      
      // Safety check: Cannot select booked or disabled
      if (seat.status === 'BOOKED' || seat.status === 'DISABLED') {
        return;
      }

      const existingIndex = state.selectedSeats.findIndex(s => s.seatId === seat.seatId);
      if (existingIndex >= 0) {
        // Deselect
        state.selectedSeats.splice(existingIndex, 1);
      } else {
        // Select (limit to max 8 tickets per demo booking for safety)
        if (state.selectedSeats.length >= 8) {
          return;
        }
        state.selectedSeats.push({
          seatId: seat.seatId,
          row: seat.row,
          col: seat.col,
          category: seat.category || 'REGULAR',
          price: Number(seat.price) || 250
        });
      }
    },

    clearSelectedSeats: (state) => {
      state.selectedSeats = [];
    }
  }
});

export const { initShowSeatSelection, toggleSeat, clearSelectedSeats } = seatSlice.actions;

// Selectors
export const selectActiveShowId = (state) => state.seats.selectedShowId;
export const selectSelectedSeats = (state) => state.seats.selectedSeats;
export const selectSelectedSeatIds = (state) => state.seats.selectedSeats.map(s => s.seatId);
export const selectTicketCount = (state) => state.seats.selectedSeats.length;
export const selectSelectedSeatsSubtotal = (state) => 
  state.seats.selectedSeats.reduce((sum, s) => sum + (Number(s.price) || 0), 0);

export default seatSlice.reducer;
