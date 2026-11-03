import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Public & Customer Pages
import Home from './pages/Home';
import Movies from './pages/Movies';
import MovieDetails from './pages/MovieDetails';
import Theatres from './pages/Theatres';
import TheatreDetails from './pages/TheatreDetails';
import SeatSelection from './pages/SeatSelection';
import Checkout from './pages/Checkout';
import TicketConfirmation from './pages/TicketConfirmation';
import MyBookings from './pages/MyBookings';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageTheatres from './pages/admin/ManageTheatres';
import ManageMovies from './pages/admin/ManageMovies';
import ManageShows from './pages/admin/ManageShows';
import AllBookings from './pages/admin/AllBookings';

export default function App() {
  return (
    <>
      <Header />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          {/* Public & Customer Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movies/:movieId" element={<MovieDetails />} />
          <Route path="/theatres" element={<Theatres />} />
          <Route path="/theatres/:theatreId" element={<TheatreDetails />} />
          <Route path="/seat-selection/:showId" element={<SeatSelection />} />
          <Route path="/checkout/:showId" element={<Checkout />} />
          <Route path="/ticket/:bookingRef" element={<TicketConfirmation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Customer Protected Route */}
          <Route 
            path="/my-bookings" 
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            } 
          />

          {/* Admin Protected Routes */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/theatres" 
            element={
              <AdminRoute>
                <ManageTheatres />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/movies" 
            element={
              <AdminRoute>
                <ManageMovies />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/shows" 
            element={
              <AdminRoute>
                <ManageShows />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/bookings" 
            element={
              <AdminRoute>
                <AllBookings />
              </AdminRoute>
            } 
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
