import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const features = [
  { icon: '🧠', title: 'AI Risk Prediction', desc: 'Smart rule-based health risk assessment using your vitals and lifestyle.' },
  { icon: '🚨', title: 'SOS Emergency', desc: 'One-click SOS with real-time location broadcast to responders.' },
  { icon: '🪪', title: 'Medical Passport', desc: 'QR-based emergency profile scannable by any first responder.' },
  { icon: '🗺️', title: 'Hospital Finder', desc: 'Live map of nearby hospitals and pharmacies via OpenStreetMap.' },
  { icon: '📈', title: 'Recovery Tracker', desc: 'Log daily vitals and get smart health insights over time.' },
  { icon: '🔒', title: 'Secure & Private', desc: 'JWT authentication with encrypted storage of all medical data.' },
];

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        minHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '4rem 2rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(0,212,255,0.08)',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: '999px',
            padding: '0.4rem 1rem',
            fontSize: '0.85rem',
            color: 'var(--teal)',
            marginBottom: '2rem',
            fontFamily: 'Syne, sans-serif',
          }}>
            🛡️ India's Healthcare Emergency Shield
          </div>

          <h1 style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #e8f4f8 30%, #00d4ff 70%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Rakshak AI
            <br />
            <span style={{ fontSize: '0.6em', fontWeight: 600, color: 'var(--text-secondary)', WebkitTextFillColor: 'var(--text-secondary)' }}>
              Your 360° Health Emergency Shield
            </span>
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            maxWidth: '540px',
            margin: '0 auto 3rem',
            lineHeight: 1.7,
          }}>
            Real-time emergency response, AI health risk prediction, QR-based medical passport, and smart recovery tracking — all in one platform.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup">
              <motion.button
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                style={{ fontSize: '1rem', padding: '0.9rem 2.5rem' }}
              >
                Get Started Free →
              </motion.button>
            </Link>
            <Link to="/login">
              <button className="btn-ghost" style={{ fontSize: '1rem', padding: '0.9rem 2rem' }}>
                Login
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Stat Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{ display: 'flex', gap: '3rem', marginTop: '5rem', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          {[['6', 'Core Modules'], ['Real-time', 'SOS Alerts'], ['Free', 'Always']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: 'var(--teal)' }}>{val}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '0.75rem' }}
          className="section-title"
        >
          Everything You Need in an Emergency
        </motion.h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
          Built for India. Designed for speed. Powered by real-time tech.
        </p>

        <div className="grid-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="glass-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, borderColor: 'rgba(0,212,255,0.2)' }}
              style={{ padding: '2rem' }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{ maxWidth: '600px', margin: '0 auto', padding: '4rem 2rem' }}
        >
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', marginBottom: '1rem' }}>
            Be Prepared. Be Protected.
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Join thousands using Rakshak AI to stay safe every day.
          </p>
          <Link to="/signup">
            <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.9rem 2.5rem' }}>
              Create Free Account
            </button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}