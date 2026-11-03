import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Shield, Info, Heart, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '3rem 0 2rem',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem'
        }}>
          {/* Brand Column */}
          <div>
            <div className="logo-brand" style={{ marginBottom: '1rem' }}>
              <div className="logo-icon">
                <Film size={18} />
              </div>
              <span>CINE<span className="logo-accent">MAX</span></span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1.2rem' }}>
              Next-generation cinema experience featuring interactive seat layout designer, real-time seat reservation, and digital ticketing with dynamic QR codes.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: '#94a3b8' }}>
              <Lock size={13} color="#10b981" /> 256-Bit SSL Encrypted Checkout
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '1.2rem' }}>Quick Navigation</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <li><Link to="/" style={{ transition: 'color 0.2s' }}>Home & Featured</Link></li>
              <li><Link to="/movies">Browse Movies</Link></li>
              <li><Link to="/theatres">Cinema Locations</Link></li>
              <li><Link to="/my-bookings">My Bookings</Link></li>
              <li><Link to="/login">Account Access</Link></li>
            </ul>
          </div>

          {/* Admin Management */}
          <div>
            <h4 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '1.2rem' }}>Operations</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <li><Link to="/admin">Operations Dashboard</Link></li>
              <li><Link to="/admin/theatres">Theatres & Seating</Link></li>
              <li><Link to="/admin/movies">Movie Catalog</Link></li>
              <li><Link to="/admin/shows">Showtime Schedules</Link></li>
              <li><Link to="/admin/bookings">Box Office Bookings</Link></li>
            </ul>
          </div>

          {/* Guest Services */}
          <div>
            <h4 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={16} color="#10b981" /> Premier Experience
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.6' }}>
              Featuring IMAX 4K Dual Laser Projection, Dolby Atmos 128-channel spatial sound, and motorized VIP recliner lounges.
            </p>
            <div style={{ marginTop: '0.8rem', padding: '0.6rem 0.8rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: '#cbd5e1' }}>
              Instant digital QR entry pass delivered on ticket confirmation.
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.82rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            &copy; {new Date().getFullYear()} CINEMAX Entertainment Group. All Rights Reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            Premier Motion Picture Experience
          </div>
        </div>
      </div>
    </footer>
  );
}
