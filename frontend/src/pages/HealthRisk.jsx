import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export default function HealthRisk() {
  const [form, setForm] = useState({
    age: '', weight: '', height: '', smoker: false,
    diabetic: false, highBP: false, steps: '', sleepHours: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/health/risk', {
        ...form,
        age: Number(form.age),
        weight: Number(form.weight),
        height: Number(form.height),
        steps: Number(form.steps),
        sleepHours: Number(form.sleepHours),
      });
      setResult(res.data);
    } catch (err) {
      alert('Failed to calculate risk');
    } finally {
      setLoading(false);
    }
  };

  const riskColors = { Low: 'var(--green)', Medium: 'var(--yellow)', High: 'var(--red)' };
  const riskBg = { Low: 'rgba(0,229,122,0.08)', Medium: 'rgba(255,215,0,0.08)', High: 'rgba(255,56,96,0.08)' };

  return (
    <div className="page-wrapper" style={{ maxWidth: '760px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title">🧠 Health Risk Assessment</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Fill in your health data to get a personalised risk score using smart rule-based analysis.
        </p>

        <div className="glass-card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="grid-2">
              {[
                { key: 'age', label: 'Age (years)', placeholder: '30' },
                { key: 'weight', label: 'Weight (kg)', placeholder: '70' },
                { key: 'height', label: 'Height (cm)', placeholder: '170' },
                { key: 'steps', label: 'Daily Steps', placeholder: '5000' },
                { key: 'sleepHours', label: 'Sleep (hours/night)', placeholder: '7' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>{label}</label>
                  <input
                    className="input-field"
                    type="number"
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    required
                  />
                </div>
              ))}
            </div>

            {/* Toggle switches */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {[
                { key: 'smoker', label: '🚬 Smoker' },
                { key: 'diabetic', label: '💉 Diabetic' },
                { key: 'highBP', label: '🩺 High BP' },
              ].map(({ key, label }) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', background: form[key] ? 'rgba(255,56,96,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${form[key] ? 'rgba(255,56,96,0.3)' : 'var(--border-glass)'}`, padding: '0.6rem 1rem', borderRadius: '8px', transition: 'all 0.2s' }}>
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                    style={{ accentColor: 'var(--red)', width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '0.9rem' }}>{label}</span>
                </label>
              ))}
            </div>

            <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
              {loading ? 'Calculating...' : 'Calculate Risk Score →'}
            </button>
          </form>
        </div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              className="glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ marginTop: '2rem', padding: '2rem', background: riskBg[result.level], borderColor: riskColors[result.level] }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.5rem' }}>Your Risk Score</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>BMI: {result.bmi} kg/m²</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '3.5rem', color: riskColors[result.level], lineHeight: 1 }}>{result.score}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>risk points</div>
                  <div className={`badge badge-${result.level.toLowerCase()}`} style={{ marginTop: '0.5rem' }}>
                    {result.level} Risk
                  </div>
                </div>
              </div>

              {result.reasons.length > 0 && (
                <>
                  <h4 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: '0.75rem' }}>Risk Factors Detected:</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {result.reasons.map((r, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                        <span style={{ color: riskColors[result.level] }}>▶</span> {r}
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                ⚕️ <strong style={{ color: 'var(--text-primary)' }}>Disclaimer:</strong> This is a rule-based estimation, not a medical diagnosis. Please consult a qualified doctor for professional health advice.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}