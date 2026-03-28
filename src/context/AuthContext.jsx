import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : (
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
          <div style={{
            width: '24px',
            height: '24px',
            border: '2.5px solid #D4AF37',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'authSpin 0.7s linear infinite',
          }} />
          <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>Loading…</span>
          <style>{`@keyframes authSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </AuthContext.Provider>
  );
};
