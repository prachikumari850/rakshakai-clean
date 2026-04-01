import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

export default function PublicPassport() {
  const { passportId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/passport/public/${passportId}`)
      .then((res) => setData(res.data))
      .catch(() => setError('Medical passport not found.'));
  }, [passportId]);

  if (error) return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <div style={{ fontSize: '4rem' }}>⚠️</div>
      <h2 style={{ fontFamily: 'Syne', fontWeight: 700, marginTop: '1rem' }}>Passport Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{error}</p>
    </div>
  );

  if (!data) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--teal)' }}>Loading medical data...</div>
  );

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', background: 'linear-gradient(135deg, #040d1a, #071428)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: '500px', margin: '0 auto' }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '4rem' }}>🆘</div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.6rem', color: 'var(--red)', marginTop: '0.5rem' }}>
            MEDICAL EMERGENCY PASSPORT
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Rakshak AI — Emergency Medical Profile</p>
        </div>

        {/* Patient Info */}
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '1rem', borderColor: 'rgba(255,56,96,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.8rem' }}>{data.name}</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Age: {data.age} years</p>
            </div>
            <div style={{
              background: 'rgba(255,56,96,0.15)',
              border: '2px solid var(--red)',
              borderRadius: '12px',
              padding: '0.75rem 1.25rem',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.8rem', color: 'var(--red)' }}>{data.bloodGroup}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>BLOOD TYPE</div>
            </div>
          </div>

          {[
            { label: '⚠️ Allergies', value: data.allergies },
            { label: '🏥 Medical Conditions', value: data.diseases },
            { label: '💊 Current Medications', value: data.medications },
          ].map(({ label, value }) => value && (
            <div key={label} style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 600 }}>{label}</div>
              <div style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Emergency Contact */}
        {data.emergencyContact?.phone && (
          <div className="glass-card" style={{ padding: '1.5rem', borderColor: 'rgba(0,229,122,0.2)' }}>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--green)' }}>📞 Emergency Contact</h3>
            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{data.emergencyContact.name}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{data.emergencyContact.relation}</div>
            <a
              href={`tel:${data.emergencyContact.phone}`}
              style={{ display: 'inline-block', marginTop: '0.75rem', color: 'white', background: 'var(--green)', padding: '0.6rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem' }}
            >
              📞 Call {data.emergencyContact.phone}
            </a>
          </div>
        )}

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2rem' }}>
          Powered by Rakshak AI · Emergency Medical Passport
        </p>
      </motion.div>
    </div>
  );
}
