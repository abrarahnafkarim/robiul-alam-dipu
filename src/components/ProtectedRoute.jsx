import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLoader } from 'react-icons/fi';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0F172A',
        color: '#94A3B8',
        fontFamily: "'Inter', system-ui, sans-serif",
        gap: '0.75rem',
      }}>
        <FiLoader size={20} style={{ animation: 'protectedSpin 0.8s linear infinite' }} color="#D4AF37" />
        <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>Verifying access…</span>
        <style>{`@keyframes protectedSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
