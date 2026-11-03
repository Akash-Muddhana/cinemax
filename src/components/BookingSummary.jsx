import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Ticket, Calendar, Clock, MapPin, Film, ShieldCheck } from 'lucide-react';
import { selectSelectedSeats, selectTicketCount, selectSelectedSeatsSubtotal } from '../features/seats/seatSlice';
import { calculatePricing, formatINR } from '../utils/pricing';

export default function BookingSummary({ movie, theatre, show, onProceed, buttonText = "Proceed to Checkout" }) {
  const navigate = useNavigate();
  const selectedSeats = useSelector(selectSelectedSeats);
  const ticketCount = useSelector(selectTicketCount);
  const subtotal = useSelector(selectSelectedSeatsSubtotal);

  const pricing = calculatePricing(selectedSeats);

  return (
    <div className="booking-summary-panel">
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.4rem', color: '#ffffff' }}>
          Booking Summary
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Review your selection and ticket prices
        </p>
      </div>

      {/* Movie & Theatre Info */}
      <div style={{ background: 'var(--bg-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', fontWeight: '700', color: '#ffffff' }}>
          <Film size={15} color="var(--primary)" />
          <span>{movie?.title || 'Selected Movie'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
          <MapPin size={13} />
          <span>{theatre?.name || 'Selected Theatre'}, {theatre?.location}</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={13} /> {show?.showDate}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={13} /> {show?.startTime}
          </span>
        </div>
      </div>

      {/* Selected Seats Badges */}
      <div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          Selected Seats ({ticketCount}):
        </div>
        {selectedSeats.length === 0 ? (
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
            Please click available seats on the map above
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {selectedSeats.map(seat => (
              <span 
                key={seat.seatId}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: seat.category === 'VIP' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(37, 99, 235, 0.15)',
                  border: seat.category === 'VIP' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(37, 99, 235, 0.4)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: seat.category === 'VIP' ? '#34d399' : '#60a5fa'
                }}
              >
                {seat.seatId} ({seat.category}) • {formatINR(seat.price)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
        <div className="summary-row">
          <span>Tickets Subtotal ({ticketCount})</span>
          <span style={{ fontWeight: '600', color: '#ffffff' }}>{formatINR(pricing.subtotal)}</span>
        </div>

        <div className="summary-row">
          <span>Convenience Fee (₹30 × {ticketCount})</span>
          <span>{formatINR(pricing.convenienceFee)}</span>
        </div>

        <div className="summary-row">
          <span>GST / Integrated Tax (18%)</span>
          <span>{formatINR(pricing.tax)}</span>
        </div>

        <div className="summary-row total">
          <span>Total Amount</span>
          <span style={{ color: '#ff4d58' }}>{formatINR(pricing.totalAmount)}</span>
        </div>
      </div>

      {/* Action Button */}
      <button 
        type="button"
        disabled={ticketCount === 0}
        onClick={onProceed}
        className="btn btn-primary btn-block btn-lg"
      >
        <Ticket size={18} /> {buttonText}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <ShieldCheck size={14} color="#10b981" />
        <span>256-Bit SSL Encrypted & Verified Checkout</span>
      </div>
    </div>
  );
}
