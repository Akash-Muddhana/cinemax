import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CheckCircle2, Film, ArrowRight } from 'lucide-react';
import { selectBookingByRef } from '../features/bookings/bookingSlice';
import Ticket from '../components/Ticket';

export default function TicketConfirmation() {
  const { bookingRef } = useParams();
  const booking = useSelector(state => selectBookingByRef(state, bookingRef));

  return (
    <div className="container page-wrapper">
      {/* Top Success Banner */}
      <div style={{
        maxWidth: '680px',
        margin: '0 auto 2rem',
        textAlign: 'center',
        background: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem'
      }}>
        <div style={{
          width: '52px',
          height: '52px',
          background: 'rgba(16, 185, 129, 0.2)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 0.75rem',
          color: '#10b981'
        }}>
          <CheckCircle2 size={30} />
        </div>
        <h1 style={{ fontSize: '1.6rem', color: '#ffffff', fontWeight: '800', marginBottom: '0.3rem' }}>
          Booking Confirmed!
        </h1>
        <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
          Your movie tickets have been successfully issued and confirmed.
        </p>
      </div>

      {/* Ticket Rendering */}
      <Ticket booking={booking} />

      {/* Bottom Nav Links */}
      <div className="no-print" style={{ maxWidth: '680px', margin: '2rem auto 0', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <Link to="/movies" className="btn btn-secondary">
          <Film size={15} /> Book Another Movie
        </Link>
        <Link to="/my-bookings" className="btn btn-primary">
          View All My Bookings <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
