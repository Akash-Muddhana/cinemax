import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, ArrowLeft, Film, MapPin, Calendar, Clock, Ticket as TicketIcon, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatINR } from '../utils/pricing';

export default function Ticket({ booking }) {
  if (!booking) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Ticket data not found or invalid booking reference.</p>
        <Link to="/my-bookings" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Back to My Bookings
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const qrData = booking.qrCodeData || `CINEMAX-DEMO:REF:${booking.bookingReference}`;

  return (
    <div className="ticket-wrapper">
      {/* Top Action Toolbar (Hidden during print) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Link to="/my-bookings" className="btn btn-secondary btn-sm">
          <ArrowLeft size={15} /> My Bookings
        </Link>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button onClick={handlePrint} className="btn btn-primary btn-sm">
            <Printer size={15} /> Print Ticket
          </button>
        </div>
      </div>

      {/* Cinematic Digital Ticket Card */}
      <div className="cinema-ticket">
        {/* Ticket Header Band */}
        <div className="ticket-header-band">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'white', color: '#b80610', padding: '4px 8px', borderRadius: '4px', fontWeight: '800', fontSize: '0.9rem' }}>
              CINEMAX
            </div>
            <span style={{ fontSize: '0.85rem', letterSpacing: '0.1em', fontWeight: '700', opacity: 0.9 }}>
              E-TICKET ADMISSION
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge" style={{ background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', fontSize: '0.72rem' }}>
              VERIFIED ADMISSION
            </span>
          </div>
        </div>

        {/* Ticket Main Details */}
        <div className="ticket-body">
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
              Booking Reference
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff', letterSpacing: '0.06em', fontFamily: 'monospace', marginBottom: '1.2rem' }}>
              {booking.bookingReference}
            </div>

            {/* Movie Title */}
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.5rem' }}>
              {booking.movieSnapshot?.title}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
              <span className="badge badge-neutral">{booking.movieSnapshot?.language || 'English'}</span>
              <span className="badge badge-neutral">{booking.movieSnapshot?.certification || 'U/A'}</span>
              <span>{booking.movieSnapshot?.duration} mins</span>
            </div>

            {/* Theatre & Location */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.3rem' }}>
              <MapPin size={16} color="var(--primary)" />
              <span>{booking.theatreSnapshot?.name}</span>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginLeft: '1.5rem', marginBottom: '1.2rem' }}>
              {booking.theatreSnapshot?.address || booking.theatreSnapshot?.location}
            </div>

            {/* Date & Time Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', background: 'var(--bg-elevated)', padding: '0.85rem 1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1.2rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date</div>
                <div style={{ fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}>
                  <Calendar size={14} color="var(--primary)" /> {booking.showDate}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Showtime</div>
                <div style={{ fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}>
                  <Clock size={14} color="var(--primary)" /> {booking.startTime}
                </div>
              </div>
            </div>

            {/* Customer & Seats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Customer</span>
                <strong style={{ color: '#fff' }}>{booking.customerName}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Tickets</span>
                <strong style={{ color: '#fff' }}>{booking.ticketCount} Seats</strong>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <div className="ticket-qr-container">
              <QRCodeSVG 
                value={qrData}
                size={130}
                level="M"
                includeMargin={true}
              />
              <span className="ticket-qr-label">Scan at Entry</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '0.78rem', fontWeight: '600' }}>
              <CheckCircle2 size={14} /> Confirmed
            </div>
          </div>
        </div>

        {/* Perforated Stub Line */}
        <div className="ticket-perforation"></div>

        {/* Ticket Bottom Stub */}
        <div style={{ padding: '1.2rem 2rem', background: 'rgba(0,0,0,0.25)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', fontSize: '0.85rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', marginRight: '0.6rem' }}>Seats:</span>
            <span style={{ fontWeight: '700', color: '#ffffff', letterSpacing: '0.04em' }}>
              {booking.seats.map(s => s.seatId).join(', ')}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}>Subtotal:</span>
              <span style={{ color: '#e2e8f0' }}>{formatINR(booking.subtotal)}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}>Total Paid:</span>
              <strong style={{ color: '#ff4d58', fontSize: '1.05rem' }}>{formatINR(booking.totalAmount)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Note under ticket */}
      <div className="no-print" style={{ textAlign: 'center', marginTop: '1.2rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
        Please present this digital e-ticket QR code at the cinema entry scanner 15 minutes before showtime.
      </div>
    </div>
  );
}
