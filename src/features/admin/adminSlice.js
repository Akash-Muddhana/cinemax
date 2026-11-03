import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theatreFilter: 'ALL',
  movieFilter: 'ALL',
  dateFilter: '',
  statusFilter: 'ALL',
  searchQuery: '',
  sortBy: 'createdAt',
  sortOrder: 'desc'
};

export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setTheatreFilter: (state, action) => {
      state.theatreFilter = action.payload;
    },
    setMovieFilter: (state, action) => {
      state.movieFilter = action.payload;
    },
    setDateFilter: (state, action) => {
      state.dateFilter = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    setAdminSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSortOptions: (state, action) => {
      const { sortBy, sortOrder } = action.payload;
      if (sortBy) state.sortBy = sortBy;
      if (sortOrder) state.sortOrder = sortOrder;
    },
    resetAdminFilters: (state) => {
      state.theatreFilter = 'ALL';
      state.movieFilter = 'ALL';
      state.dateFilter = '';
      state.statusFilter = 'ALL';
      state.searchQuery = '';
      state.sortBy = 'createdAt';
      state.sortOrder = 'desc';
    }
  }
});

export const {
  setTheatreFilter,
  setMovieFilter,
  setDateFilter,
  setStatusFilter,
  setAdminSearchQuery,
  setSortOptions,
  resetAdminFilters
} = adminSlice.actions;

// Selectors
export const selectAdminFilters = (state) => state.admin;

// Derived Admin Dashboard Statistics
export const selectAdminStats = (state) => {
  const totalTheatres = state.theatres.theatres.length;
  const totalMovies = state.movies.movies.length;
  const totalShows = state.shows.shows.length;
  
  const allBookings = state.bookings.bookings;
  const activeBookings = allBookings.filter(b => b.status === 'CONFIRMED');

  const totalDemoBookings = allBookings.length;
  const confirmedBookingsCount = activeBookings.length;
  
  const totalTickets = activeBookings.reduce((sum, b) => sum + (Number(b.ticketCount) || 0), 0);
  const totalSimulatedRevenue = activeBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

  return {
    totalTheatres,
    totalMovies,
    totalShows,
    totalDemoBookings,
    confirmedBookingsCount,
    totalTickets,
    totalSimulatedRevenue
  };
};

// Filtered Admin Bookings Selector
export const selectFilteredAdminBookings = (state) => {
  const { theatreFilter, movieFilter, dateFilter, statusFilter, searchQuery, sortBy, sortOrder } = state.admin;
  const bookings = state.bookings.bookings;
  const q = (searchQuery || '').toLowerCase().trim();

  const filtered = bookings.filter(b => {
    // Theatre filter
    if (theatreFilter !== 'ALL' && b.theatreSnapshot?.id !== theatreFilter) {
      return false;
    }

    // Movie filter
    if (movieFilter !== 'ALL' && b.movieSnapshot?.id !== movieFilter) {
      return false;
    }

    // Date filter
    if (dateFilter && b.showDate !== dateFilter) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'ALL' && b.status !== statusFilter) {
      return false;
    }

    // Search query (customer name, email, booking ref, theatre, movie)
    if (q) {
      const matchName = b.customerName?.toLowerCase().includes(q);
      const matchEmail = b.customerEmail?.toLowerCase().includes(q);
      const matchRef = b.bookingReference?.toLowerCase().includes(q);
      const matchMovie = b.movieSnapshot?.title?.toLowerCase().includes(q);
      const matchTheatre = b.theatreSnapshot?.name?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchRef && !matchMovie && !matchTheatre) {
        return false;
      }
    }

    return true;
  });

  // Sorting
  filtered.sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (sortBy === 'createdAt' || sortBy === 'showDate') {
      valA = new Date(valA).getTime() || 0;
      valB = new Date(valB).getTime() || 0;
    } else if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = (valB || '').toLowerCase();
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return filtered;
};

export default adminSlice.reducer;
