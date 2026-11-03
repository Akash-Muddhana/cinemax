import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  LogIn, 
  ShieldCheck, 
  User, 
  Lock, 
  AlertCircle, 
  Film, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';
import { 
  login, 
  selectAuthError, 
  clearAuthError, 
  quickLoginAs,
  selectCurrentUser,
  selectIsAuthenticated
} from '../features/auth/authSlice';
import { sha256Async } from '../utils/storage';
import { validateEmail, validatePassword } from '../utils/validation';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const authError = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);

  const [activeTab, setActiveTab] = useState(
    location.search.includes('admin=true') ? 'ADMIN' : 'CUSTOMER'
  );
  const [email, setEmail] = useState(
    activeTab === 'ADMIN' ? 'admin@cinemax.com' : 'customer@cinemax.com'
  );
  const [password, setPassword] = useState(
    activeTab === 'ADMIN' ? 'admin123' : 'customer123'
  );
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Navigate when successfully authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const from = location.state?.from?.pathname || (currentUser.role === 'ADMIN' ? '/admin' : '/movies');
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate, location]);

  const handleTabChange = (role) => {
    setActiveTab(role);
    dispatch(clearAuthError());
    setValidationErrors({});
    if (role === 'ADMIN') {
      setEmail('admin@cinemax.com');
      setPassword('admin123');
    } else {
      setEmail('customer@cinemax.com');
      setPassword('customer123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());

    // Validate
    const errors = {};
    const emailErr = validateEmail(email);
    if (emailErr) errors.email = emailErr;
    const passErr = validatePassword(password);
    if (passErr) errors.password = passErr;

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});

    setIsSubmitting(true);
    let passwordHash = '';
    try {
      passwordHash = await sha256Async(password);
    } catch {
      passwordHash = password;
    }

    dispatch(login({ email, password, passwordHash }));
    setIsSubmitting(false);
  };

  const handle1ClickLogin = (role) => {
    dispatch(quickLoginAs(role));
    if (role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/movies');
    }
  };

  return (
    <div className="container page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '75vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="logo-brand" style={{ justifyContent: 'center', marginBottom: '0.6rem' }}>
            <div className="logo-icon">
              <Film size={20} />
            </div>
            <span>CINE<span className="logo-accent">MAX</span></span>
          </div>
          <h2 style={{ fontSize: '1.4rem', color: '#fff' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Sign in to access your bookings and manage cinema operations
          </p>
        </div>

        {/* Role Toggle Tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '4px', marginBottom: '1.5rem', border: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            onClick={() => handleTabChange('CUSTOMER')}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: activeTab === 'CUSTOMER' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'CUSTOMER' ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}
          >
            <User size={15} /> Customer
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('ADMIN')}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: activeTab === 'ADMIN' ? '#dc2626' : 'transparent',
              color: activeTab === 'ADMIN' ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}
          >
            <ShieldCheck size={15} /> Administrator
          </button>
        </div>

        {/* Error message */}
        {authError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 'var(--radius-sm)', padding: '0.75rem', color: '#ff6b6b', fontSize: '0.82rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{authError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              style={{ width: '100%', borderColor: validationErrors.email ? '#ef4444' : undefined }}
            />
            {validationErrors.email && (
              <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '3px', display: 'block' }}>{validationErrors.email}</span>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', borderColor: validationErrors.password ? '#ef4444' : undefined }}
            />
            {validationErrors.password && (
              <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '3px', display: 'block' }}>{validationErrors.password}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-block"
            style={{ marginTop: '0.5rem' }}
          >
            <LogIn size={16} /> {isSubmitting ? 'Signing In...' : `Sign In as ${activeTab === 'ADMIN' ? 'Admin' : 'Customer'}`}
          </button>
        </form>

        {/* Quick Sign In Shortcut */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.2rem', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
            Quick Sign In:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handle1ClickLogin('CUSTOMER')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem' }}
            >
              <User size={13} /> Customer Account
            </button>
            <button
              type="button"
              onClick={() => handle1ClickLogin('ADMIN')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem' }}
            >
              <ShieldCheck size={13} color="#ef4444" /> Admin Portal
            </button>
          </div>
        </div>

        {/* Register Link */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>
            Create Customer Account
          </Link>
        </div>
      </div>
    </div>
  );
}
