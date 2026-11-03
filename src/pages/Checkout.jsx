import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ShieldCheck, 
  ChevronLeft, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  Film, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone 
} from 'lucide-react';
import { selectShowById, bookSeatsInShow } from '../features/shows/showSlice';
import { selectMovieById } from '../features/movies/movieSlice';
import { selectTheatreById } from '../features/theatres/theatreSlice';
import { 
  selectSelectedSeats, 
  selectSelectedSeatIds, 
  clearSelectedSeats 
} from '../features/seats/seatSlice';
import { createBookingSuccess, setBookingError, clearBookingError } from '../features/bookings/bookingSlice';
import { selectCurrentUser, selectIsAuthenticated } from '../features/auth/authSlice';
import { calculatePricing, formatINR } from '../utils/pricing';
import { generateBookingReference, generateDemoQRCodeData } from '../utils/ticketGenerator';
import { validateEmail, validatePhone } from '../utils/validation';

export default function Checkout() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const show = useSelector(state => selectShowById(state, showId));
  const movie = useSelector(state => selectMovieById(state, show?.movieId));
  const theatre = useSelector(state => selectTheatreById(state, show?.theatreId));

  const currentUser = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const selectedSeats = useSelector(selectSelectedSeats);
  const selectedSeatIds = useSelector(selectSelectedSeatIds);

  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '+91 98765 43210');

  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingErrorMessage, setBookingErrorMessage] = useState(null);

  if (!show || !movie || !theatre) {
    return (
      <div className="container page-wrapper" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Invalid Checkout Session</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Please select a valid movie screening to proceed.
        </p>
        <Link to="/movies" className="btn btn-primary">
          <ChevronLeft size={16} /> Return to Movies
        </Link>
      </div>
    );
  }

  if (selectedSeats.length === 0) {
    return (
      <div className="container page-wrapper" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2 style={{ color: '#fff', marginBottom: '1rem' }}>No Seats Selected</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          You have not selected any seats for this show yet.
        </p>
        <Link to={`/seat-selection/${showId}`} className="btn btn-primary">
          <ChevronLeft size={16} /> Select Seats Now
        </Link>
      </div>
    );
  }

  const pricing = calculatePricing(selectedSeats);

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    setBookingErrorMessage(null);

    // Validate Contact Details
    const errors = {};
    if (!customerName.trim()) errors.name = 'Full name is required';
    const emailErr = validateEmail(customerEmail);
    if (emailErr) errors.email = emailErr;
    const phoneErr = validatePhone(customerPhone);
    if (phoneErr) errors.phone = phoneErr;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    setIsProcessing(true);

    // Simulated network latency & verification check
    setTimeout(() => {
      // 1. Verify show exists
      if (!show) {
        setIsProcessing(false);
        setBookingErrorMessage('Verification failed: Show does not exist.');
        return;
      }

      // 2. Verify seats exist in inventory & 3. Verify NOT already booked
      const currentShowSeats = show.seatInventory || [];
      const alreadyBookedSeats = [];

      for (const seat of selectedSeats) {
        const foundInInventory = currentShowSeats.find(s => s.seatId === seat.seatId);
        if (!foundInInventory) {
          alreadyBookedSeats.push(seat.seatId + ' (Invalid)');
        } else if (foundInInventory.status === 'BOOKED') {
          alreadyBookedSeats.push(seat.seatId);
        }
      }

      if (alreadyBookedSeats.length > 0) {
        setIsProcessing(false);
        const errMsg = `Booking conflict! Seat(s) ${alreadyBookedSeats.join(', ')} were just reserved by another booking. Please select different seats.`;
        setBookingErrorMessage(errMsg);
        return;
      }

      // 4. Generate unique booking reference & QR code data
      const bookingRef = generateBookingReference();
      const qrData = generateDemoQRCodeData(bookingRef, show.id, selectedSeats);

      // 5. Build verified booking object
      const newBooking = {
        id: `bk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        bookingReference: bookingRef,
        userId: currentUser?.id || `usr_guest_${Date.now()}`,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone.trim(),
        showId: show.id,
        movieSnapshot: {
          id: movie.id,
          title: movie.title,
          posterUrl: movie.posterUrl,
          language: movie.language,
          duration: movie.duration,
          certification: movie.certification
        },
        theatreSnapshot: {
          id: theatre.id,
          name: theatre.name,
          location: theatre.location,
          address: theatre.address
        },
        showDate: show.showDate,
        startTime: show.startTime,
        endTime: show.endTime,
        seats: selectedSeats.map(s => ({
          seatId: s.seatId,
          row: s.row,
          col: s.col,
          category: s.category,
          price: s.price
        })),
        ticketCount: selectedSeats.length,
        subtotal: pricing.subtotal,
        convenienceFee: pricing.convenienceFee,
        tax: pricing.tax,
        totalAmount: pricing.totalAmount,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        qrCodeData: qrData,
        createdAt: new Date().toISOString()
      };

      // 6. Atomically mark seats as booked in show inventory
      dispatch(bookSeatsInShow({
        showId: show.id,
        seatIds: selectedSeatIds,
        bookingReference: bookingRef
      }));

      // 7. Store confirmed booking in Redux & localStorage
      dispatch(createBookingSuccess(newBooking));

      // 8. Clear current selected seats draft
      dispatch(clearSelectedSeats());

      setIsProcessing(false);

      // 9. Navigate to Ticket Confirmation Page
      navigate(`/ticket/${bookingRef}`);
    }, 600);
  };

  return (
    <div className="container page-wrapper">
      <Link to={`/seat-selection/${showId}`} className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
        <ChevronLeft size={14} /> Back to Seat Selection
      </Link>

      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title">
          <CreditCard size={26} color="var(--primary)" /> Confirm Ticket Booking
        </h1>
        <p className="section-subtitle">
          Review your cinema tickets and complete your reservation
        </p>
      </div>

      {bookingErrorMessage && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 'var(--radius-md)', padding: '1rem', color: '#ff6b6b', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <AlertCircle size={20} />
          <span>{bookingErrorMessage}</span>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 400px',
        gap: '2.5rem',
        alignItems: 'start'
      }}>
        {/* Left Form: Customer Details & Demo Payment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Customer Details Form */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} color="var(--primary)" /> Contact Details for E-Ticket Delivery
            </h3>

            {!isAuthenticated && (
              <div style={{ background: 'var(--bg-elevated)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
                Booking as guest. Or <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Log In</Link> to save tickets directly to your customer profile.
              </div>
            )}

            <form onSubmit={handleConfirmBooking} id="checkout-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{ width: '100%', borderColor: formErrors.name ? '#ef4444' : undefined }}
                />
                {formErrors.name && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>{formErrors.name}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    style={{ width: '100%', borderColor: formErrors.email ? '#ef4444' : undefined }}
                  />
                  {formErrors.email && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>{formErrors.email}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    style={{ width: '100%', borderColor: formErrors.phone ? '#ef4444' : undefined }}
                  />
                  {formErrors.phone && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>{formErrors.phone}</span>}
                </div>
              </div>
            </form>
          </div>

          {/* Payment Method */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="#10b981" /> Express Checkout
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
              Instant booking confirmation with secure e-ticket generation and QR pass.
            </p>

            <div style={{
              background: 'var(--bg-elevated)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ width: '48px', height: '24px', background: 'var(--primary)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.65rem', fontWeight: '800' }}>
                  ONLINE
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#fff', fontSize: '0.9rem' }}>Express Digital Checkout</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Instant electronic admission pass delivery</div>
                </div>
              </div>
              <CheckCircle2 size={20} color="#10b981" />
            </div>
          </div>
        </div>

        {/* Right: Order Summary Sidebar */}
        <div className="booking-summary-panel">
          <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>Order Details</h3>

          {/* Movie snapshot */}
          <div style={{ display: 'flex', gap: '1rem', background: 'var(--bg-elevated)', padding: '0.8rem', borderRadius: 'var(--radius-md)' }}>
            <img 
              src={movie.posterUrl} 
              alt={movie.title}
              style={{ width: '56px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
            />
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '700' }}>{movie.title}</h4>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {theatre.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {show.showDate} • {show.startTime}
              </div>
            </div>
          </div>

          {/* Seats */}
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Reserved Seats:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {selectedSeats.map(s => (
                <span key={s.seatId} className="badge badge-blue">
                  {s.seatId} ({s.category})
                </span>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.8rem' }}>
            <div className="summary-row">
              <span>Tickets Subtotal</span>
              <span style={{ color: '#fff' }}>{formatINR(pricing.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Convenience Fee (₹30 × {pricing.ticketCount})</span>
              <span>{formatINR(pricing.convenienceFee)}</span>
            </div>
            <div className="summary-row">
              <span>Integrated Tax (18%)</span>
              <span>{formatINR(pricing.tax)}</span>
            </div>
            <div className="summary-row total">
              <span>Final Total</span>
              <span style={{ color: '#ff4d58', fontSize: '1.3rem' }}>{formatINR(pricing.totalAmount)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            form="checkout-form"
            disabled={isProcessing}
            className="btn btn-primary btn-block btn-lg"
          >
            {isProcessing ? 'Verifying & Generating Ticket...' : `Pay & Confirm ${formatINR(pricing.totalAmount)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
