import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../services/api';

export default function RecoveryTracker() {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ date: today, heartRate: '', systolic: '', diastolic: '', sugarLevel: '', steps: '', sleepHours: '', mood: 'good' });
  const [logs, setLogs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [activeChart, setActiveChart] = useState('heartRate');

  const fetchHistory = async () => {
    const res = await api.get('/health/history');
    setLogs(res.data.logs.reverse()); // oldest first for charts
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/health/log', {
        ...form,
        heartRate: Number(form.heartRate),
        systolic: Number(form.systolic),
        diastolic: Number(form.diastolic),
        sugarLevel: Number(form.sugarLevel),
        steps: Number(form.steps),
        sleepHours: Number(form.sleepHours),
      });
      await fetchHistory();
    } catch { alert('Failed to save log'); }
    finally { setSaving(false); }
  };

  const chartMetrics = [
    { key: 'heartRate', label: 'Heart Rate', color: '#ff3860', unit: 'bpm' },
    { key: 'systolic', label: 'Systolic BP', color: '#7c3aed', unit: 'mmHg' },
    { key: 'sugarLevel', label: 'Blood Sugar', color: '#ffd700', unit: 'mg/dL' },
    { key: 'steps', label: 'Steps', color: '#00e57a', unit: '' },
    { key: 'sleepHours', label: 'Sleep', color: '#00d4ff', unit: 'hrs' },
  ];

  const latest = logs[logs.length - 1];

  return (
    <div className="page-wrapper">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title">📈 Recovery Tracker</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Log your daily vitals and track recovery trends over time.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          {/* Log Form */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: '1.25rem' }}>📝 Today's Log</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Date</label>
                <input className="input-field" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              {[
                { key: 'heartRate', label: 'Heart Rate (bpm)', placeholder: '72' },
                { key: 'systolic', label: 'BP Systolic', placeholder: '120' },
                { key: 'diastolic', label: 'BP Diastolic', placeholder: '80' },
                { key: 'sugarLevel', label: 'Blood Sugar (mg/dL)', placeholder: '100' },
                { key: 'steps', label: 'Steps', placeholder: '8000' },
                { key: 'sleepHours', label: 'Sleep (hours)', placeholder: '7' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>{label}</label>
                  <input className="input-field" type="number" placeholder={placeholder} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} style={{ padding: '0.6rem 0.875rem' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Mood</label>
                <select className="input-field" value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })} style={{ padding: '0.6rem 0.875rem' }}>
                  {['great', 'good', 'okay', 'bad', 'terrible'].map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
              <button className="btn-primary" type="submit" disabled={saving} style={{ width: '100%', marginTop: '0.5rem' }}>
                {saving ? 'Saving...' : 'Save Log →'}
              </button>
            </form>
          </div>

          {/* Charts */}
          <div>
            {/* Metric Selector */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {chartMetrics.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setActiveChart(m.key)}
                  style={{ padding: '0.4rem 0.875rem', borderRadius: '999px', border: `1px solid ${activeChart === m.key ? m.color : 'var(--border-glass)'}`, background: activeChart === m.key ? `${m.color}20` : 'transparent', color: activeChart === m.key ? m.color : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s' }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Chart */}
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h4 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: '1rem' }}>
                {chartMetrics.find((m) => m.key === activeChart)?.label} Trend
              </h4>
              {logs.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={logs}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                    <Line
                      type="monotone"
                      dataKey={activeChart}
                      stroke={chartMetrics.find((m) => m.key === activeChart)?.color}
                      strokeWidth={2}
                      dot={{ r: 4, fill: chartMetrics.find((m) => m.key === activeChart)?.color }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  No data yet. Start logging your vitals!
                </div>
              )}
            </div>

            {/* Smart Insights */}
            {latest?.insights?.length > 0 && (
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h4 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: '1rem' }}>💡 Smart Insights</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {latest.insights.map((ins, i) => (
                    <div key={i} style={{ padding: '0.75rem', background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--yellow)' }}>
                      {ins}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}