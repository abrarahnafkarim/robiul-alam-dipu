import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { FiLock, FiMail, FiKey, FiArrowRight, FiLoader } from 'react-icons/fi';

const AdminLogin = () => {
  const { currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  if (currentUser) {
    return <Navigate to="/admin" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Check your internet connection.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait and try again later.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0F172A',
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: '1rem',
    }}>
      {/* Background accents */}
      <div style={{ position: 'fixed', top: '-15%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{
        backgroundColor: '#1E293B',
        padding: '2.5rem 2.25rem',
        borderRadius: '16px',
        border: '1px solid #334155',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
        position: 'relative',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #D4AF37, #F5D060)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: '0 8px 24px rgba(212, 175, 55, 0.2)',
          }}>
            <FiLock size={22} color="#0F172A" strokeWidth={2.5} />
          </div>
          <h2 style={{ color: '#F8FAFC', margin: 0, fontSize: '1.4rem', fontWeight: '700' }}>
            Admin Login
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.5rem', margin: '0.5rem 0 0' }}>
            Sign in to manage your website
          </p>
        </div>

        {error && (
          <div style={{
            padding: '0.7rem 1rem', borderRadius: '8px', marginBottom: '1.25rem',
            backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
            color: '#EF4444', fontSize: '0.88rem', textAlign: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.8rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <FiMail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                autoComplete="email"
                style={{
                  width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.6rem',
                  borderRadius: '8px', border: '1px solid #334155',
                  backgroundColor: '#0F172A', color: '#F8FAFC',
                  fontSize: '0.95rem', outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
                onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.8rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <FiKey size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{
                  width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.6rem',
                  borderRadius: '8px', border: '1px solid #334155',
                  backgroundColor: '#0F172A', color: '#F8FAFC',
                  fontSize: '0.95rem', outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
                onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.25rem', padding: '0.8rem 2rem',
              borderRadius: '8px', border: 'none',
              background: loading ? '#b5952f' : 'linear-gradient(135deg, #D4AF37, #E5C24A)',
              color: '#0F172A', fontWeight: '700', fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              fontFamily: "'Inter', system-ui, sans-serif",
              boxShadow: loading ? 'none' : '0 4px 16px rgba(212, 175, 55, 0.2)',
            }}
          >
            {loading ? (
              <>
                <FiLoader size={16} style={{ animation: 'loginSpin 0.8s linear infinite' }} />
                Signing in…
              </>
            ) : (
              <>
                Sign In
                <FiArrowRight size={16} />
              </>
            )}
          </button>
        </form>
        <style>{`@keyframes loginSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
};

export default AdminLogin;
