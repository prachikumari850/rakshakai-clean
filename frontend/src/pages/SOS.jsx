import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { connectSocket, getSocket } from '../services/socketService';
import api from '../services/api';

export default function SOS() {
  const { user } = useAuth();
  const [location, setLocation] = useState(null);
  const [locError, setLocError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Connect socket and listen for SOS alerts (admin view)
    const socket = connectSocket(user?._id);
    socket.on('sos-alert', (alert) => {
      setAlerts((prev) => [alert, ...prev].slice(0, 10)); // Keep last 10
    });

    // Get user location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => setLocError('Location access denied. Please enable it for SOS.')
      );
    }

    return () => socket.off('sos-alert');
  }, [user]);

  const handleSOS = async () => {
    setSending(true);
    try {
      await api.post('/sos/send', {
        userId: user?._id,
        latitude: location?.latitude,
        longitude: location?.longitude,
        message: `🚨 EMERGENCY! ${user?.name} needs immediate help!`,
      });
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch {
      alert('Failed to send SOS. Check your connection.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '700px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title">🚨 Emergency SOS</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Press the SOS button to send an instant emergency alert with your live location.
        </p>

        {/* Location Status */}
        <div className="glass-card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '1.5rem' }}>{location ? '📍' : '❓'}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              {location ? 'Location Acquired' : locError || 'Getting location...'}
            </div>
            {location && (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
              </div>
            )}
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: location ? 'var(--green)' : 'var(--yellow)',
              boxShadow: location ? '0 0 8px var(--green)' : '0 0 8px var(--yellow)',
            }} />
          </div>
        </div>

        {/* SOS Button */}
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div key="sent" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.8rem', color: 'var(--green)' }}>SOS Sent!</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Your alert has been broadcast to all responders.</p>
              </motion.div>
            ) : (
              <motion.div key="button">
                <motion.button
                  onClick={handleSOS}
                  disabled={sending}
                  whileTap={{ scale: 0.92 }}
                  animate={sending ? { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 0.8 } } : {}}
                  style={{
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    background: sending ? 'linear-gradient(135deg, #cc0033, #880022)' : 'linear-gradient(135deg, #ff3860, #cc0033)',
                    border: '4px solid rgba(255,56,96,0.4)',
                    color: 'white',
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 800,
                    fontSize: '1.6rem',
                    cursor: 'pointer',
                    boxShadow: '0 0 60px rgba(255,56,96,0.4)',
                    transition: 'box-shadow 0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                    margin: '0 auto',
                  }}
                >
                  <span style={{ fontSize: '2.5rem' }}>🆘</span>
                  <span>{sending ? 'Sending...' : 'SOS'}</span>
                </motion.button>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '1.5rem' }}>
                  Press to broadcast emergency alert
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Incoming Alerts (admin/demo) */}
        {alerts.length > 0 && (
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: '1rem' }}>📡 Live Alerts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {alerts.map((alert, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{ padding: '0.75rem 1rem', background: 'rgba(255,56,96,0.08)', border: '1px solid rgba(255,56,96,0.2)', borderRadius: '8px', fontSize: '0.85rem' }}
                >
                  <div style={{ fontWeight: 600 }}>{alert.message}</div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    📍 {alert.latitude?.toFixed(4)}, {alert.longitude?.toFixed(4)} · {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}