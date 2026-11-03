import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Film, 
  MapPin, 
  Ticket as TicketIcon, 
  ShieldCheck, 
  User, 
  LogOut, 
  LogIn, 
  Menu, 
  X 
} from 'lucide-react';
import { selectCurrentUser, selectIsAuthenticated, logout, quickLoginAs } from '../features/auth/authSlice';

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleQuickSwitch = (role) => {
    dispatch(quickLoginAs(role));
    if (role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/movies');
    }
  };

  return (
    <>
      <header className="main-header">
        <div className="container header-container">
          {/* Logo */}
          <Link to="/" className="logo-brand" onClick={() => setMobileMenuOpen(false)}>
            <div className="logo-icon">
              <Film size={18} />
            </div>
            <span>CINE<span className="logo-accent">MAX</span></span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-links" style={{ display: 'flex' }}>
            <li className="nav-item">
              <NavLink to="/" end>Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/movies">
                <Film size={15} /> Movies
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/theatres">
                <MapPin size={15} /> Theatres
              </NavLink>
            </li>
            {isAuthenticated && (
              <li className="nav-item">
                <NavLink to="/my-bookings">
                  <TicketIcon size={15} /> My Bookings
                </NavLink>
              </li>
            )}
            {currentUser?.role === 'ADMIN' && (
              <li className="nav-item">
                <NavLink to="/admin" style={{ color: '#ff6b6b' }}>
                  <ShieldCheck size={16} /> Admin Portal
                </NavLink>
              </li>
            )}
          </nav>

          {/* Right Header Controls & User Switcher */}
          <div className="header-actions">
            {/* Quick Switcher Pill */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-elevated)', padding: '2px 4px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => handleQuickSwitch('CUSTOMER')}
                style={{
                  fontSize: '0.74rem',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  background: currentUser?.role === 'CUSTOMER' ? 'var(--primary)' : 'transparent',
                  color: currentUser?.role === 'CUSTOMER' ? '#fff' : 'var(--text-muted)',
                  fontWeight: currentUser?.role === 'CUSTOMER' ? '600' : '400'
                }}
                title="Customer Portal"
              >
                Customer
              </button>
              <button
                onClick={() => handleQuickSwitch('ADMIN')}
                style={{
                  fontSize: '0.74rem',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  background: currentUser?.role === 'ADMIN' ? '#dc2626' : 'transparent',
                  color: currentUser?.role === 'ADMIN' ? '#fff' : 'var(--text-muted)',
                  fontWeight: currentUser?.role === 'ADMIN' ? '600' : '400'
                }}
                title="Administrator Portal"
              >
                Admin
              </button>
            </div>

            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link 
                  to={currentUser?.role === 'ADMIN' ? '/admin' : '/my-bookings'}
                  className="user-badge-btn"
                >
                  <User size={14} />
                  <span>{currentUser.name.split(' ')[0]}</span>
                  <span className={`badge ${currentUser.role === 'ADMIN' ? 'badge-red' : 'badge-blue'}`} style={{ padding: '1px 6px', fontSize: '0.65rem' }}>
                    {currentUser.role}
                  </span>
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="btn btn-secondary btn-sm"
                  title="Sign out"
                >
                  <LogOut size={14} />
                  <span className="hidden-mobile">Logout</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <Link to="/login" className="btn btn-secondary btn-sm">
                  <LogIn size={14} /> Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ display: 'none' }}
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
