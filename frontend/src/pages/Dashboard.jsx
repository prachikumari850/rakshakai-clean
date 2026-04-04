import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import HealthStats from '../components/HealthStats';

const QuickLink = ({ to, icon, label, desc, color }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <motion.div
      className="glass-card"
      whileHover={{ y: -4, borderColor: color }}
      style={{ padding: '1.5rem', cursor: 'pointer', height: '100%', transition: 'border-color 0.2s' }}
    >
      <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{icon}</div>
      <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{label}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>{desc}</p>
    </motion.div>
  </Link>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [recentLog, setRecentLog] = useState(null);

  useEffect(() => {
    api.get('/health/history').then((res) => {
      if (res.data.logs.length > 0) setRecentLog(res.data.logs[0]);
    }).catch(() => {});
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page-wrapper">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2.5rem' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{greeting} 👋</p>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2.2rem', marginTop: '0.25rem' }}>
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Your health dashboard — stay monitored, stay safe.
        </p>
      </motion.div>

      {/* SOS Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'linear-gradient(135deg, rgba(255,56,96,0.12), rgba(204,0,51,0.08))',
          border: '1px solid rgba(255,56,96,0.25)',
          borderRadius: 'var(--radius)',
          padding: '1.5rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.2rem' }}>🚨 Emergency SOS</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            In danger? Send instant alert with your location.
          </p>
        </div>
        <Link to="/sos">
          <button className="btn-danger" style={{ fontSize: '1rem', padding: '0.8rem 2rem' }}>
            Open SOS
          </button>
        </Link>
      </motion.div>

      <HealthStats />

      {/* Recent Log */}
      {recentLog && (
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ padding: '1.5rem', marginBottom: '2rem' }}
        >
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: '1rem' }}>📊 Latest Health Log — {recentLog.date}</h3>
          <div className="grid-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
            {[
              ['❤️', 'Heart Rate', recentLog.heartRate, 'bpm'],
              ['🩺', 'Blood Pressure', `${recentLog.systolic}/${recentLog.diastolic}`, 'mmHg'],
              ['🍬', 'Sugar', recentLog.sugarLevel, 'mg/dL'],
              ['🚶', 'Steps', recentLog.steps?.toLocaleString(), ''],
              ['😴', 'Sleep', recentLog.sleepHours, 'hrs'],
              ['😊', 'Mood', recentLog.mood, ''],
            ].map(([icon, label, val, unit]) => (
              <div key={label} style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                <div style={{ fontSize: '1.5rem' }}>{icon}</div>
                <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem', marginTop: '0.25rem' }}>
                  {val ?? '—'} <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{unit}</span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{label}</div>
              </div>
            ))}
          </div>
          {recentLog.insights?.length > 0 && (
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {recentLog.insights.map((ins, i) => (
                <div key={i} style={{ fontSize: '0.85rem', color: 'var(--yellow)', background: 'rgba(255,215,0,0.06)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                  {ins}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Quick Links Grid */}
      <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.3rem', marginBottom: '1.25rem' }}>Quick Access</h2>
      <div className="grid-3">
        <QuickLink to="/health-risk" icon="🧠" label="Check Health Risk" desc="Get your personal risk score based on vitals & lifestyle." color="rgba(0,212,255,0.3)" />
        <QuickLink to="/passport" icon="🪪" label="Medical Passport" desc="Create & manage your emergency QR medical profile." color="rgba(124,58,237,0.3)" />
        <QuickLink to="/finder" icon="🗺️" label="Hospital Finder" desc="Find nearby hospitals & pharmacies on live map." color="rgba(0,229,122,0.3)" />
        <QuickLink to="/recovery" icon="📈" label="Recovery Tracker" desc="Log vitals and view your health trends over time." color="rgba(255,215,0,0.3)" />
        <QuickLink to="/profile" icon="👤" label="My Profile" desc="Update your personal information and settings." color="rgba(255,56,96,0.2)" />
        <QuickLink to="/sos" icon="🚨" label="Emergency SOS" desc="Configure and test your emergency alert system." color="rgba(255,56,96,0.3)" />
      </div>
    </div>
  );
}