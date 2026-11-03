import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShieldAlert, LogIn } from 'lucide-react';
import { selectCurrentUser, selectIsAuthenticated, quickLoginAs } from '../features/auth/authSlice';

export default function AdminRoute({ children }) {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login?admin=true" state={{ from: location }} replace />;
  }

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="container page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ maxWidth: '480px', textAlign: 'center', padding: '2.5rem' }}>
          <div style={{ width: '64px', height: '64px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#ef4444' }}>
            <ShieldAlert size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.8rem', color: '#fff' }}>Admin Access Required</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            You are logged in as <strong>{currentUser?.name}</strong> ({currentUser?.role}), but this area requires Administrator privileges.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <button 
              onClick={() => dispatch(quickLoginAs('ADMIN'))}
              className="btn btn-primary"
            >
              Sign In with Admin Account
            </button>
            <Link to="/" className="btn btn-secondary">
              Return to Public Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
