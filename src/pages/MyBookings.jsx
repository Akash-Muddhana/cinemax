import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Ticket as TicketIcon, 
  Calendar, 
  Clock, 
  MapPin, 
  Film, 
  ArrowRight, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { selectUserBookings } from '../features/bookings/bookingSlice';
import { selectCurrentUser } from '../features/auth/authSlice';
import { formatINR } from '../utils/pricing';

export default function MyBookings() {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const bookings = useSelector(state => selectUserBookings(state, currentUser?.id));

  return (
    <div className="container page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title">
          <TicketIcon size={26} color="var(--primary)" /> My Bookings
        </h1>
        <p className="section-subtitle">
          View your confirmed cinema reservations, e-tickets, and QR entry codes
        </p>
      </div>

      {/* Bookings List */}
      {bookings.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {bookings.map(booking => {
            const isConfirmed = booking.status === 'CONFIRMED';

            return (
              <div 
                key={booking.id}
                className="card"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '100px minmax(0, 1fr) auto',
                  gap: '1.5rem',
                  alignItems: 'center'
                }}
              >
                {/* Poster */}
                <div style={{ aspectRatio: '2 / 3', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--bg-surface)' }}>
                  <img 
                    src={booking.movieSnapshot?.posterUrl} 
                    alt={booking.movieSnapshot?.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Info */}
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '0.85rem', color: '#ff4d58', background: 'rgba(229, 9, 20, 0.12)', padding: '2px 8px', borderRadius: '4px' }}>
                      {booking.bookingReference}
                    </span>
                    <span className={`badge ${isConfirmed ? 'badge-green' : 'badge-red'}`}>
                      {isConfirmed ? 'Confirmed' : 'Cancelled'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Booked on {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.4rem' }}>
                    {booking.movieSnapshot?.title}
                  </h3>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.6rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} color="var(--primary)" /> {booking.theatreSnapshot?.name}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} /> {booking.showDate}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} /> {booking.startTime}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Seats:</span>
                    <strong style={{ color: '#ffffff' }}>
                      {booking.seats.map(s => s.seatId).join(', ')} ({booking.ticketCount} {booking.ticketCount === 1 ? 'ticket' : 'tickets'})
                    </strong>
                  </div>
                </div>

                {/* Right Total & Action */}
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Paid</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ffffff' }}>
                      {formatINR(booking.totalAmount)}
                    </div>
                  </div>

                  <Link 
                    to={`/ticket/${booking.bookingReference}`}
                    className="btn btn-primary btn-sm"
                  >
                    <ExternalLink size={14} /> View Ticket & QR
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <TicketIcon size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>No Bookings Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            You haven't booked any movie tickets yet under this account.
          </p>
          <Link to="/movies" className="btn btn-primary">
            <Film size={15} /> Explore Movies & Book Now
          </Link>
        </div>
      )}
    </div>
  );
}
