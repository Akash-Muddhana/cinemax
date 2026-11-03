import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  UserPlus, 
  Film, 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  Mail, 
  User, 
  Phone 
} from 'lucide-react';
import { registerCustomer, selectAuthError, clearAuthError } from '../features/auth/authSlice';
import { sha256Async } from '../utils/storage';
import { validateEmail, validatePassword, validatePhone } from '../utils/validation';

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authError = useSelector(selectAuthError);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());

    // Validation
    const errors = {};
    if (!name.trim()) errors.name = 'Full name is required';
    const emailErr = validateEmail(email);
    if (emailErr) errors.email = emailErr;
    const phoneErr = validatePhone(phone);
    if (phoneErr) errors.phone = phoneErr;
    const passErr = validatePassword(password);
    if (passErr) errors.password = passErr;
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});

    setIsSubmitting(true);
    const passwordHash = await sha256Async(password);

    dispatch(registerCustomer({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      phone: phone.trim()
    }));

    setIsSubmitting(false);

    // If registered successfully, navigate to movie catalog
    setTimeout(() => {
      navigate('/movies');
    }, 100);
  };

  return (
    <div className="container page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="logo-brand" style={{ justifyContent: 'center', marginBottom: '0.6rem' }}>
            <div className="logo-icon">
              <Film size={20} />
            </div>
            <span>CINE<span className="logo-accent">MAX</span></span>
          </div>
          <h2 style={{ fontSize: '1.4rem', color: '#fff' }}>Create Customer Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Register to book seats, access instant e-tickets, and manage reservations
          </p>
        </div>

        {/* Locked Role Notification */}
        <div style={{
          background: 'rgba(37, 99, 235, 0.1)',
          border: '1px solid rgba(37, 99, 235, 0.3)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.65rem 0.9rem',
          fontSize: '0.8rem',
          color: '#93c5fd',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} color="#60a5fa" style={{ flexShrink: 0 }} />
          <span>Join CINEMAX Rewards for instant e-ticket access, mobile passes, and exclusive offers.</span>
        </div>

        {authError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 'var(--radius-sm)', padding: '0.75rem', color: '#ff6b6b', fontSize: '0.82rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Smith"
              style={{ width: '100%', borderColor: validationErrors.name ? '#ef4444' : undefined }}
            />
            {validationErrors.name && (
              <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '3px', display: 'block' }}>{validationErrors.name}</span>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              style={{ width: '100%', borderColor: validationErrors.email ? '#ef4444' : undefined }}
            />
            {validationErrors.email && (
              <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '3px', display: 'block' }}>{validationErrors.email}</span>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              style={{ width: '100%', borderColor: validationErrors.phone ? '#ef4444' : undefined }}
            />
            {validationErrors.phone && (
              <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '3px', display: 'block' }}>{validationErrors.phone}</span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 chars"
                style={{ width: '100%', borderColor: validationErrors.password ? '#ef4444' : undefined }}
              />
              {validationErrors.password && (
                <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '3px', display: 'block' }}>{validationErrors.password}</span>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Confirm *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm"
                style={{ width: '100%', borderColor: validationErrors.confirmPassword ? '#ef4444' : undefined }}
              />
              {validationErrors.confirmPassword && (
                <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '3px', display: 'block' }}>{validationErrors.confirmPassword}</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-block"
            style={{ marginTop: '0.8rem' }}
          >
            <UserPlus size={16} /> {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
