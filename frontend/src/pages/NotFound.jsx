import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <div style={{ fontSize: '6rem' }}>🔍</div>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '4rem', color: 'var(--teal)', marginTop: '1rem' }}>404</h1>
        <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.5rem', marginTop: '0.5rem' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', marginBottom: '2rem' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/dashboard">
          <button className="btn-primary">Go to Dashboard →</button>
        </Link>
      </motion.div>
    </div>
  );
}