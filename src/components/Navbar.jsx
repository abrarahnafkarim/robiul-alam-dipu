import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleTheme = () => {
    if (theme === 'dark') {
      document.body.classList.add('light-theme');
      setTheme('light');
    } else {
      document.body.classList.remove('light-theme');
      setTheme('dark');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = ['About', 'Achievements', 'Blog'];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: scrolled ? '0.85rem 2rem' : '1.25rem 2rem',
        backgroundColor: scrolled ? (theme === 'dark' ? 'rgba(11, 14, 20, 0.88)' : 'rgba(248, 250, 252, 0.88)') : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(212, 175, 55, 0.1)' : '1px solid transparent',
        transition: 'all 0.3s ease',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <a href="#" style={{ fontWeight: 'bold', fontSize: '1.25rem', letterSpacing: '1px', color: 'var(--color-text)', textDecoration: 'none' }}>
        Robiul<span style={{ color: 'var(--color-primary)' }}>.</span>
      </a>

      {/* Desktop Nav */}
      <div className="nav-desktop" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        {navLinks.map((item) => (
          <a 
            key={item} 
            href={`#${item.toLowerCase()}`}
            style={{ 
              color: 'var(--color-text-light)', 
              fontSize: '0.9rem', 
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'var(--transition)',
              textDecoration: 'none',
            }}
            onMouseOver={(e) => e.target.style.color = 'var(--color-primary)'}
            onMouseOut={(e) => e.target.style.color = 'var(--color-text-light)'}
          >
            {item}
          </a>
        ))}
        <button 
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-primary)',
            cursor: 'pointer',
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.35rem',
            borderRadius: '6px',
            transition: 'background-color 0.2s ease',
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>
      </div>

      {/* Mobile toggle */}
      <button
        className="nav-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
        style={{
          display: 'none',
          background: 'none',
          border: 'none',
          color: 'var(--color-text)',
          cursor: 'pointer',
          padding: '0.25rem',
        }}
      >
        {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
      </button>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="nav-mobile-menu" style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          backgroundColor: theme === 'dark' ? 'rgba(11, 14, 20, 0.95)' : 'rgba(248, 250, 252, 0.95)',
          backdropFilter: 'blur(12px)',
          padding: '1.5rem 2rem',
          display: 'flex', flexDirection: 'column', gap: '1rem',
          borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
        }}>
          {navLinks.map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`}
              onClick={() => setMobileOpen(false)}
              style={{ 
                color: 'var(--color-text-light)', 
                fontSize: '1rem', 
                fontWeight: 500,
                textDecoration: 'none',
                padding: '0.5rem 0',
              }}
            >
              {item}
            </a>
          ))}
          <button 
            onClick={() => { toggleTheme(); setMobileOpen(false); }}
            style={{
              background: 'none', border: 'none',
              color: 'var(--color-primary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 0', fontSize: '1rem',
            }}
          >
            {theme === 'dark' ? <><FiSun size={16} /> Light Mode</> : <><FiMoon size={16} /> Dark Mode</>}
          </button>
        </div>
      )}
    </motion.nav>
  );
};

export default Navbar;
