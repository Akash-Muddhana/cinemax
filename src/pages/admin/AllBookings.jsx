import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Ticket, 
  Search, 
  Filter, 
  MapPin, 
  Film, 
  Calendar, 
  Clock, 
  DollarSign, 
  RotateCcw,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Layers,
  Table as TableIcon
} from 'lucide-react';
import { 
  selectAllBookings, 
  cancelBooking 
} from '../../features/bookings/bookingSlice';
import { releaseSeatsInShow } from '../../features/shows/showSlice';
import { selectAllTheatres } from '../../features/theatres/theatreSlice';
import { selectAllMovies } from '../../features/movies/movieSlice';
import { 
  selectAdminFilters, 
  setTheatreFilter, 
  setMovieFilter, 
  setDateFilter, 
  setStatusFilter, 
  setAdminSearchQuery, 
  resetAdminFilters,
  selectFilteredAdminBookings 
} from '../../features/admin/adminSlice';
import { formatINR } from '../../utils/pricing';

export default function AllBookings() {
  const dispatch = useDispatch();
  const theatres = useSelector(selectAllTheatres);
  const movies = useSelector(selectAllMovies);
  const filters = useSelector(selectAdminFilters);
  const filteredBookings = useSelector(selectFilteredAdminBookings);

  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grouped'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Pagination calculation
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage) || 1;
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCancelBooking = (booking) => {
    if (booking.status === 'CANCELLED') return;
    if (window.confirm(`Cancel booking ${booking.bookingReference}? This will release seats (${booking.seats.map(s => s.seatId).join(', ')}) back to available inventory.`)) {
      dispatch(cancelBooking(booking.id));
      dispatch(releaseSeatsInShow({
        showId: booking.showId,
        seatIds: booking.seats.map(s => s.seatId)
      }));
    }
  };

  // Grouped by Theatre
  const groupedByTheatre = {};
  filteredBookings.forEach(b => {
    const thName = b.theatreSnapshot?.name || 'Unknown Theatre';
    if (!groupedByTheatre[thName]) {
      groupedByTheatre[thName] = [];
    }
    groupedByTheatre[thName].push(b);
  });

  return (
    <div className="container page-wrapper">
      {/* Page Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 className="section-title">
            <Ticket size={26} color="var(--primary)" /> Bookings Management
          </h1>
          <p className="section-subtitle">
            Search, filter, and inspect customer ticket transactions across all cinema auditoriums
          </p>
        </div>

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-elevated)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: viewMode === 'table' ? 'var(--primary)' : 'transparent',
              color: viewMode === 'table' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            <TableIcon size={14} /> Flat Table
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grouped')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: viewMode === 'grouped' ? 'var(--primary)' : 'transparent',
              color: viewMode === 'grouped' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            <Layers size={14} /> Group by Theatre
          </button>
        </div>
      </div>

      {/* Comprehensive Filter Bar */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'center'
        }}>
          {/* Search Query */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Ref, customer, email, title..."
              value={filters.searchQuery}
              onChange={(e) => {
                dispatch(setAdminSearchQuery(e.target.value));
                setCurrentPage(1);
              }}
              style={{ width: '100%', paddingLeft: '2.4rem' }}
            />
          </div>

          {/* Theatre Filter */}
          <div>
            <select
              value={filters.theatreFilter}
              onChange={(e) => {
                dispatch(setTheatreFilter(e.target.value));
                setCurrentPage(1);
              }}
              style={{ width: '100%' }}
            >
              <option value="ALL">All Theatres</option>
              {theatres.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Movie Filter */}
          <div>
            <select
              value={filters.movieFilter}
              onChange={(e) => {
                dispatch(setMovieFilter(e.target.value));
                setCurrentPage(1);
              }}
              style={{ width: '100%' }}
            >
              <option value="ALL">All Movies</option>
              {movies.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.statusFilter}
              onChange={(e) => {
                dispatch(setStatusFilter(e.target.value));
                setCurrentPage(1);
              }}
              style={{ width: '100%' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <input
              type="date"
              value={filters.dateFilter}
              onChange={(e) => {
                dispatch(setDateFilter(e.target.value));
                setCurrentPage(1);
              }}
              style={{ width: '100%' }}
            />
          </div>

          {/* Reset Filters */}
          <div>
            <button
              type="button"
              onClick={() => {
                dispatch(resetAdminFilters());
                setCurrentPage(1);
              }}
              className="btn btn-secondary btn-block"
              style={{ height: '42px' }}
            >
              <RotateCcw size={14} /> Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stat Pill */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        <span>Showing <strong>{filteredBookings.length}</strong> matching bookings</span>
        <span>Total Value: <strong style={{ color: '#ff4d58' }}>{formatINR(filteredBookings.filter(b => b.status === 'CONFIRMED').reduce((s, b) => s + (b.totalAmount || 0), 0))}</strong></span>
      </div>

      {/* VIEW MODE 1: FLAT TABLE */}
      {viewMode === 'table' && (
        <>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Customer Info</th>
                  <th>Movie</th>
                  <th>Theatre</th>
                  <th>Screening Time</th>
                  <th>Seats Reserved</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBookings.map(b => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ fontFamily: 'monospace', fontWeight: '700', color: '#ff6b6b' }}>
                        {b.bookingReference}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {new Date(b.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: '#fff' }}>{b.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.customerEmail}</div>
                      {b.customerPhone && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{b.customerPhone}</div>
                      )}
                    </td>
                    <td style={{ fontWeight: '600', color: '#fff' }}>
                      {b.movieSnapshot?.title}
                    </td>
                    <td>
                      <div style={{ color: '#e2e8f0' }}>{b.theatreSnapshot?.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{b.theatreSnapshot?.location}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                        <Calendar size={13} color="var(--primary)" /> {b.showDate}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.startTime}</div>
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontWeight: '700' }}>
                        {b.seats.map(s => s.seatId).join(', ')} ({b.ticketCount})
                      </span>
                    </td>
                    <td style={{ fontWeight: '700', color: '#fff' }}>
                      {formatINR(b.totalAmount)}
                    </td>
                    <td>
                      <span className={`badge ${b.status === 'CONFIRMED' ? 'badge-green' : 'badge-red'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        {b.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleCancelBooking(b)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#ef4444', fontSize: '0.75rem' }}
                            title="Cancel booking and release seats back to inventory"
                          >
                            Cancel
                          </button>
                        )}
                        <a
                          href={`/ticket/${b.bookingReference}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          title="Open Digital Ticket"
                        >
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="btn btn-secondary btn-sm"
              >
                Previous
              </button>
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 0.8rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="btn btn-secondary btn-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* VIEW MODE 2: GROUPED BY THEATRE */}
      {viewMode === 'grouped' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {Object.keys(groupedByTheatre).map(theatreName => {
            const theatreBookings = groupedByTheatre[theatreName];
            const activeTickets = theatreBookings.filter(b => b.status === 'CONFIRMED').reduce((s, b) => s + b.ticketCount, 0);
            const theatreTotal = theatreBookings.filter(b => b.status === 'CONFIRMED').reduce((s, b) => s + b.totalAmount, 0);

            return (
              <div key={theatreName} className="card">
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.8rem', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={18} color="var(--primary)" /> {theatreName}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {theatreBookings.length} total bookings ({activeTickets} active tickets)
                    </div>
                  </div>

                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ff4d58' }}>
                    Revenue: {formatINR(theatreTotal)}
                  </div>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Ref</th>
                        <th>Customer</th>
                        <th>Movie</th>
                        <th>Date & Time</th>
                        <th>Seats</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {theatreBookings.map(b => (
                        <tr key={b.id}>
                          <td style={{ fontFamily: 'monospace', fontWeight: '700', color: '#ff6b6b' }}>{b.bookingReference}</td>
                          <td>
                            <div style={{ color: '#fff', fontWeight: '600' }}>{b.customerName}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{b.customerEmail}</div>
                          </td>
                          <td style={{ color: '#fff' }}>{b.movieSnapshot?.title}</td>
                          <td>{b.showDate} @ {b.startTime}</td>
                          <td>
                            <span className="badge badge-neutral">{b.seats.map(s => s.seatId).join(', ')}</span>
                          </td>
                          <td style={{ fontWeight: '700', color: '#fff' }}>{formatINR(b.totalAmount)}</td>
                          <td>
                            <span className={`badge ${b.status === 'CONFIRMED' ? 'badge-green' : 'badge-red'}`}>{b.status}</span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <a
                              href={`/ticket/${b.bookingReference}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-secondary btn-sm"
                            >
                              <ExternalLink size={13} />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredBookings.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <Ticket size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.8rem' }} />
          <h3 style={{ color: '#fff', marginBottom: '0.4rem' }}>No Bookings Match Query</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Try clearing filters or searching with a different customer name or booking reference.
          </p>
        </div>
      )}
    </div>
  );
}
