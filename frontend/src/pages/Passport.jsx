import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Passport() {
  const [form, setForm] = useState({
    name: '', age: '', bloodGroup: 'O+',
    allergies: '', diseases: '', medications: '',
    emergencyContact: { name: '', phone: '', relation: '' },
  });
  const [passport, setPassport] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/passport/my').then((res) => {
      const p = res.data.passport;
      setPassport(p);
      setForm({
        name: p.name, age: p.age, bloodGroup: p.bloodGroup,
        allergies: p.allergies, diseases: p.diseases, medications: p.medications,
        emergencyContact: p.emergencyContact || { name: '', phone: '', relation: '' },
      });
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/passport/create', { ...form, age: Number(form.age) });
      setPassport(res.data.passport);
    } catch {
      alert('Failed to save passport');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '800px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title">🪪 Medical Passport</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Your emergency medical profile, accessible via QR code by first responders.
        </p>

        {/* Form */}
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="grid-2">
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Full Name</label>
                <input className="input-field" placeholder="Arjun Sharma" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Age</label>
                <input className="input-field" type="number" placeholder="28" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Blood Group</label>
                <select className="input-field" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
                  {BLOOD_GROUPS.map((bg) => <option key={bg}>{bg}</option>)}
                </select>
              </div>
            </div>

            {[
              { key: 'allergies', label: 'Allergies', placeholder: 'e.g. Penicillin, Peanuts' },
              { key: 'diseases', label: 'Medical Conditions', placeholder: 'e.g. Type 2 Diabetes, Asthma' },
              { key: 'medications', label: 'Current Medications', placeholder: 'e.g. Metformin 500mg, Salbutamol inhaler' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>{label}</label>
                <textarea className="input-field" placeholder={placeholder} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} style={{ minHeight: '80px', resize: 'vertical' }} />
              </div>
            ))}

            <div>
              <h4 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: '0.75rem' }}>Emergency Contact</h4>
              <div className="grid-3">
                {[
                  { key: 'name', label: 'Name', placeholder: 'Priya Sharma' },
                  { key: 'phone', label: 'Phone', placeholder: '+91 98765 43210' },
                  { key: 'relation', label: 'Relation', placeholder: 'Spouse' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>{label}</label>
                    <input className="input-field" placeholder={placeholder} value={form.emergencyContact[key]} onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, [key]: e.target.value } })} />
                  </div>
                ))}
              </div>
            </div>

            <button className="btn-primary" type="submit" disabled={saving} style={{ width: '100%' }}>
              {saving ? 'Saving...' : passport ? 'Update Passport' : 'Create Passport & Generate QR →'}
            </button>
          </form>
        </div>

        {/* QR Code Display */}
        {passport?.qrCodeDataUrl && (
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ padding: '2rem', textAlign: 'center' }}
          >
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem' }}>Your Medical QR Code</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Show this to any first responder or doctor. Scanning opens your medical profile instantly.
            </p>
            <img
              src={passport.qrCodeDataUrl}
              alt="Medical Passport QR"
              style={{ width: '200px', height: '200px', borderRadius: '12px', background: 'white', padding: '8px' }}
            />
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Passport ID: <code style={{ color: 'var(--teal)', background: 'rgba(0,212,255,0.08)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{passport.passportId}</code>
            </div>
            <button
              className="btn-ghost"
              onClick={() => {
                const link = document.createElement('a');
                link.download = 'medical-passport-qr.png';
                link.href = passport.qrCodeDataUrl;
                link.click();
              }}
              style={{ marginTop: '1rem' }}
            >
              Download QR Code
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}