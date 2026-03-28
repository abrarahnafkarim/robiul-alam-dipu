import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiUser, FiAward, FiEdit3, FiLogOut, FiMenu, FiX, FiShield } from 'react-icons/fi';
import HeroEditor from '../components/admin/HeroEditor';
import AboutEditor from '../components/admin/AboutEditor';
import AchievementEditor from '../components/admin/AchievementEditor';
import BlogEditor from '../components/admin/BlogEditor';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('hero');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await auth.signOut();
      navigate('/admin/login');
    } catch (err) {
      console.error("Logout failed", err);
      setLoggingOut(false);
    }
  };

  const menuItems = [
    { id: 'hero', label: 'Hero Section', icon: FiHome },
    { id: 'about', label: 'About Section', icon: FiUser },
    { id: 'achievements', label: 'Achievements', icon: FiAward },
    { id: 'blog', label: 'Blog Editor', icon: FiEdit3 },
  ];

  const handleNavClick = (id) => {
    setActiveSection(id);
    setSidebarOpen(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0F172A', color: '#F8FAFC', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 49, display: 'none',
          }}
          className="admin-overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}
        style={{
          width: '272px',
          backgroundColor: '#1E293B',
          padding: '1.75rem 1rem',
          borderRight: '1px solid #334155',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '0 0.75rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #D4AF37, #F5D060)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(212, 175, 55, 0.25)',
            }}>
              <FiShield size={18} color="#0F172A" strokeWidth={2.5} />
            </div>
            <div>
              <h2 style={{
                fontSize: '1.15rem', color: '#F8FAFC', margin: 0,
                fontWeight: '700', letterSpacing: '-0.01em',
              }}>
                Admin Panel
              </h2>
            </div>
          </div>
          <p style={{
            fontSize: '0.75rem', color: '#64748B', margin: 0, marginTop: '0.35rem',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {currentUser?.email}
          </p>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.7rem 0.9rem',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                      fontWeight: isActive ? '600' : '500',
                      backgroundColor: isActive ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                      color: isActive ? '#D4AF37' : '#94A3B8',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.7rem',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                    onMouseOver={e => { if (!isActive) e.currentTarget.style.backgroundColor = '#273548'; }}
                    onMouseOut={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                    {item.label}
                    {isActive && (
                      <div style={{
                        marginLeft: 'auto', width: '6px', height: '6px',
                        borderRadius: '50%', backgroundColor: '#D4AF37',
                      }} />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div style={{ borderTop: '1px solid #334155', paddingTop: '1.25rem' }}>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              width: '100%',
              padding: '0.7rem',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              backgroundColor: 'transparent',
              color: '#EF4444',
              cursor: loggingOut ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: loggingOut ? 0.6 : 1,
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
            onMouseOver={e => { if (!loggingOut) { e.currentTarget.style.backgroundColor = '#EF4444'; e.currentTarget.style.color = '#fff'; } }}
            onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#EF4444'; }}
          >
            <FiLogOut size={16} />
            {loggingOut ? 'Logging out…' : 'Log Out'}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, marginLeft: '272px', minHeight: '100vh' }} className="admin-main">
        {/* Mobile Header */}
        <div className="admin-mobile-header" style={{
          display: 'none', padding: '1rem 1.25rem',
          backgroundColor: '#1E293B', borderBottom: '1px solid #334155',
          alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 40,
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none', border: 'none', color: '#F8FAFC',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              padding: '0.25rem',
            }}
          >
            {sidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
          <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>
            Admin Panel
          </span>
          <div style={{ width: '22px' }} />
        </div>

        {/* Content */}
        <div style={{ padding: '2rem 2.5rem', maxWidth: '960px' }} className="admin-content">
          <div style={{
            backgroundColor: '#1E293B',
            padding: '2rem',
            borderRadius: '16px',
            border: '1px solid #334155',
            minHeight: 'calc(100vh - 4rem)',
          }}>
            {activeSection === 'hero' && <HeroEditor />}
            {activeSection === 'about' && <AboutEditor />}
            {activeSection === 'achievements' && <AchievementEditor />}
            {activeSection === 'blog' && <BlogEditor />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
