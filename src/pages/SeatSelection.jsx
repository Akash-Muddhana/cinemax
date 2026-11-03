import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ChevronLeft, 
  Film, 
  MapPin, 
  Calendar, 
  Clock, 
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { selectShowById } from '../features/shows/showSlice';
import { selectMovieById } from '../features/movies/movieSlice';
import { selectTheatreById } from '../features/theatres/theatreSlice';
import { 
  initShowSeatSelection, 
  toggleSeat, 
  clearSelectedSeats,
  selectSelectedSeats, 
  selectSelectedSeatIds 
} from '../features/seats/seatSlice';
import SeatGrid from '../components/SeatGrid';
import BookingSummary from '../components/BookingSummary';

export default function SeatSelection() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const show = useSelector(state => selectShowById(state, showId));
  const movie = useSelector(state => selectMovieById(state, show?.movieId));
  const theatre = useSelector(state => selectTheatreById(state, show?.theatreId));

  const selectedSeats = useSelector(selectSelectedSeats);
  const selectedSeatIds = useSelector(selectSelectedSeatIds);

  // Initialize seat selection for this specific show on load
  useEffect(() => {
    if (showId) {
      dispatch(initShowSeatSelection(showId));
    }
  }, [showId, dispatch]);

  if (!show || !movie || !theatre) {
    return (
      <div className="container page-wrapper" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Showtime Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          The requested movie showtime could not be loaded. It may have expired or been removed.
        </p>
        <Link to="/movies" className="btn btn-primary">
          <ChevronLeft size={16} /> Return to Movies
        </Link>
      </div>
    );
  }

  const handleSeatClick = (seat) => {
    dispatch(toggleSeat({
      seatId: seat.seatId,
      row: seat.row,
      col: seat.col,
      category: seat.category,
      price: seat.price,
      status: seat.status
    }));
  };

  const handleProceedToCheckout = () => {
    if (selectedSeats.length === 0) return;
    navigate(`/checkout/${showId}`);
  };

  return (
    <div className="container page-wrapper">
      {/* Top Breadcrumb & Showtime Info Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1.2rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-secondary btn-sm"
            style={{ marginBottom: '0.6rem' }}
          >
            <ChevronLeft size={14} /> Back
          </button>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', marginBottom: '0.3rem' }}>
            {movie.title}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={13} color="var(--primary)" /> {theatre.name} ({theatre.location})
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={13} /> {show.showDate}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} /> {show.startTime} - {show.endTime}
            </span>
          </div>
        </div>

        {selectedSeats.length > 0 && (
          <button 
            onClick={() => dispatch(clearSelectedSeats())} 
            className="btn btn-secondary btn-sm"
            title="Clear current seat selections"
          >
            <RotateCcw size={13} /> Clear Seats ({selectedSeats.length})
          </button>
        )}
      </div>

      {/* Main Seat Map & Checkout Sidebar Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 360px',
        gap: '2.5rem',
        alignItems: 'start'
      }}>
        {/* Left: Interactive Seat Grid */}
        <div className="card" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <SeatGrid 
            seatInventory={show.seatInventory || []}
            selectedSeatIds={selectedSeatIds}
            onSeatClick={handleSeatClick}
            mode="customer"
          />

          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <AlertCircle size={14} />
            <span>Click available seats to select or deselect. Maximum 8 seats per transaction.</span>
          </div>
        </div>

        {/* Right: Real-time Price Breakdown & Proceed Panel */}
        <div style={{ position: 'sticky', top: '90px' }}>
          <BookingSummary 
            movie={movie}
            theatre={theatre}
            show={show}
            onProceed={handleProceedToCheckout}
            buttonText="Proceed to Checkout"
          />
        </div>
      </div>
    </div>
  );
}
