import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Building2, 
  Film, 
  Calendar, 
  Ticket, 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  Plus, 
  ArrowRight,
  MapPin,
  Clock
} from 'lucide-react';
import { selectAdminStats } from '../../features/admin/adminSlice';
import { selectAllBookings } from '../../features/bookings/bookingSlice';
import { selectAllTheatres } from '../../features/theatres/theatreSlice';
import { selectAllMovies } from '../../features/movies/movieSlice';
import { formatINR } from '../../utils/pricing';

export default function AdminDashboard() {
  const stats = useSelector(selectAdminStats);
  const bookings = useSelector(selectAllBookings);
  const theatres = useSelector(selectAllTheatres);
  const movies = useSelector(selectAllMovies);

  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="container page-wrapper">
      {/* Top Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff4d58', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
            <ShieldCheck size={18} /> Central Administration
          </div>
          <h1 className="section-title">Cinema Operations Dashboard</h1>
          <p className="section-subtitle" style={{ marginBottom: 0 }}>
            Real-time analytics and management controls for CINEMAX cinema networks
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
          <Link to="/admin/theatres" className="btn btn-secondary btn-sm">
            <Building2 size={14} /> Theatres & Seats
          </Link>
          <Link to="/admin/movies" className="btn btn-secondary btn-sm">
            <Film size={14} /> Movies
          </Link>
          <Link to="/admin/shows" className="btn btn-primary btn-sm">
            <Plus size={14} /> Schedule Show
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1.2rem',
        marginBottom: '2.5rem'
      }}>
        {/* Theatres */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Theatres</span>
            <Building2 size={18} color="#60a5fa" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>
            {stats.totalTheatres}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Auditoriums Active
          </div>
        </div>

        {/* Movies */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Movies</span>
            <Film size={18} color="#a78bfa" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>
            {stats.totalMovies}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            In Current Catalog
          </div>
        </div>

        {/* Scheduled Shows */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Shows</span>
            <Calendar size={18} color="#fbbf24" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>
            {stats.totalShows}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Screenings Scheduled
          </div>
        </div>

        {/* Bookings */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bookings</span>
            <Ticket size={18} color="#34d399" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>
            {stats.totalDemoBookings}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            {stats.confirmedBookingsCount} Confirmed Orders
          </div>
        </div>

        {/* Tickets Sold */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tickets Sold</span>
            <TrendingUp size={18} color="#f43f5e" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>
            {stats.totalTickets}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Seats Reserved
          </div>
        </div>

        {/* Total Revenue */}
        <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(145deg, #181b24, #12141a)', border: '1px solid rgba(229, 9, 20, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#ff6b6b', textTransform: 'uppercase', fontWeight: '700' }}>Gross Revenue</span>
            <DollarSign size={18} color="#ff4d58" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: '800', color: '#ff4d58' }}>
            {formatINR(stats.totalSimulatedRevenue)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Confirmed Ticket Sales
          </div>
        </div>
      </div>

      {/* Main Grid: Management Modules & Recent Bookings */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem'
      }}>
        {/* Recent Bookings Panel */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Ticket size={18} color="var(--primary)" /> Recent Bookings
            </h3>
            <Link to="/admin/bookings" style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All ({bookings.length}) <ArrowRight size={14} />
            </Link>
          </div>

          {recentBookings.length > 0 ? (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ref</th>
                    <th>Customer</th>
                    <th>Movie</th>
                    <th>Theatre</th>
                    <th>Date / Time</th>
                    <th>Seats</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map(b => (
                    <tr key={b.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: '700', color: '#ff6b6b' }}>
                        {b.bookingReference}
                      </td>
                      <td>
                        <div style={{ fontWeight: '600', color: '#fff' }}>{b.customerName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.customerEmail}</div>
                      </td>
                      <td style={{ color: '#fff', fontWeight: '500' }}>{b.movieSnapshot?.title}</td>
                      <td>{b.theatreSnapshot?.name}</td>
                      <td>
                        <div>{b.showDate}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.startTime}</div>
                      </td>
                      <td>
                        <span className="badge badge-neutral">
                          {b.seats.map(s => s.seatId).join(', ')}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
              No recent bookings recorded.
            </div>
          )}
        </div>

        {/* Quick Management Shortcuts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '0.8rem' }}>Administrative Portals</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <Link 
                to="/admin/theatres"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.8rem 1rem',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Building2 size={16} color="var(--primary)" />
                  <span>Theatres & Seating Designer</span>
                </div>
                <ArrowRight size={14} color="var(--text-muted)" />
              </Link>

              <Link 
                to="/admin/movies"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.8rem 1rem',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Film size={16} color="var(--primary)" />
                  <span>Movie Catalog Management</span>
                </div>
                <ArrowRight size={14} color="var(--text-muted)" />
              </Link>

              <Link 
                to="/admin/shows"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.8rem 1rem',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Calendar size={16} color="var(--primary)" />
                  <span>Showtime Scheduling</span>
                </div>
                <ArrowRight size={14} color="var(--text-muted)" />
              </Link>

              <Link 
                to="/admin/bookings"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.8rem 1rem',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Ticket size={16} color="var(--primary)" />
                  <span>All Bookings & Filters</span>
                </div>
                <ArrowRight size={14} color="var(--text-muted)" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
