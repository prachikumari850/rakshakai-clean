import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/health-risk', label: 'Risk Check' },
  { path: '/sos', label: '🚨 SOS' },
  { path: '/passport', label: 'Passport' },
  { path: '/finder', label: 'Finder' },
  { path: '/recovery', label: 'Recovery' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'rgba(4, 13, 26, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 2rem',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🛡️</span>
          <span style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: '1.2rem',
            background: 'linear-gradient(135deg, #e8f4f8, #00d4ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Rakshak AI
          </span>
        </div>
      </Link>

      {/* Nav Links (only when logged in) */}
      {user && (
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                textDecoration: 'none',
                color: location.pathname === link.path ? 'var(--teal)' : 'var(--text-secondary)',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.88rem',
                fontWeight: 500,
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                background: location.pathname === link.path ? 'rgba(0,212,255,0.08)' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      {/* Auth Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {user ? (
          <>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              👋 {user.name?.split(' ')[0]}
            </span>
            <button className="btn-ghost" onClick={handleLogout} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login"><button className="btn-ghost" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Login</button></Link>
            <Link to="/signup"><button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Sign Up</button></Link>
          </>
        )}
      </div>
    </motion.nav>
  );
}