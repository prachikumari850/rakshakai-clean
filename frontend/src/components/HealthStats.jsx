// frontend/src/components/HealthStats.jsx
// NEW FILE — displays Google Fit stats + risk score on Dashboard

import { motion, AnimatePresence } from 'framer-motion';
import { useFit } from '../context/FitContext';

// ── Risk level → display config ────────────────────────────
const RISK_CONFIG = {
  Low:    { color: 'var(--green)',  bg: 'rgba(0,229,122,0.08)',  border: 'rgba(0,229,122,0.25)',  dot: '#00e57a', label: '🟢 Low Risk' },
  Medium: { color: 'var(--yellow)', bg: 'rgba(255,215,0,0.08)',  border: 'rgba(255,215,0,0.25)',  dot: '#ffd700', label: '🟡 Medium Risk' },
  High:   { color: 'var(--red)',    bg: 'rgba(255,56,96,0.08)',  border: 'rgba(255,56,96,0.25)',  dot: '#ff3860', label: '🔴 High Risk' },
};

// ── Derive human risk level from delta score ───────────────
const getRiskLevel = (delta) => {
  if (delta >= 40) return 'High';
  if (delta >= 20) return 'Medium';
  return 'Low';
};

// ── Single stat tile ───────────────────────────────────────
const StatTile = ({ icon, label, value, unit, sublabel, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    style={{
      padding: '1.25rem',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '12px',
      textAlign: 'center',
    }}
  >
    <div style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>{icon}</div>
    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.4rem', lineHeight: 1 }}>
      {value}
      {unit && <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginLeft: '2px' }}>{unit}</span>}
    </div>
    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.3rem' }}>{label}</div>
    {sublabel && (
      <div style={{ fontSize: '0.7rem', color: 'var(--teal)', marginTop: '0.25rem', fontWeight: 600 }}>{sublabel}</div>
    )}
  </motion.div>
);

// ── Skeleton loader tile ───────────────────────────────────
const SkeletonTile = () => (
  <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', animation: 'pulse 1.5s ease-in-out infinite' }}>
    <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%', margin: '0 auto 0.5rem' }} />
    <div style={{ width: '60%', height: '20px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', margin: '0 auto 0.4rem' }} />
    <div style={{ width: '40%', height: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', margin: '0 auto' }} />
  </div>
);

// ── Main component ─────────────────────────────────────────
export default function HealthStats() {
  const { fitData, fitRisk, fitLoading, fitError, isConnected, connectGoogleFit, syncFitData } = useFit();

  // ── Not connected yet ──────────────────────────────────────
  if (!isConnected && !fitData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, rgba(0,212,255,0.05), rgba(0,144,212,0.03))',
          border: '1px dashed rgba(0,212,255,0.2)',
          borderRadius: 'var(--radius)',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.4rem' }}>
            🏃 Connect Google Fit
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '420px', lineHeight: 1.6 }}>
            Sync your steps, heart rate, and sleep data to power your AI risk score and recovery tracker.
          </p>
        </div>
        <motion.button
          className="btn-primary"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={connectGoogleFit}
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', whiteSpace: 'nowrap' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Connect Google Fit
        </motion.button>
      </motion.div>
    );
  }

  // ── Loading skeleton ───────────────────────────────────────
  if (fitLoading) {
    return (
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonTile key={i} />)}
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      </div>
    );
  }

  // ── Derive risk display ────────────────────────────────────
  const riskLevel = getRiskLevel(fitRisk?.delta ?? 0);
  const riskConfig = RISK_CONFIG[riskLevel];

  // ── Activity status ────────────────────────────────────────
  const activityStatus = fitData?.steps >= 6000
    ? { label: 'Active 🏃', color: 'var(--green)' }
    : fitData?.steps >= 3000
    ? { label: 'Moderate 🚶', color: 'var(--yellow)' }
    : { label: 'Low Activity 🛋️', color: 'var(--red)' };

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem' }}>
          🏃 Google Fit — Live Stats
          {fitData?.source === 'mock' && (
            <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--yellow)', background: 'rgba(255,215,0,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              Demo Data
            </span>
          )}
        </h3>
        <button
          onClick={() => syncFitData()}
          style={{ background: 'none', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-secondary)', padding: '0.3rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s' }}
        >
          ↻ Sync
        </button>
      </div>

      {/* Stat tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <StatTile icon="👣" label="Steps" value={(fitData?.steps ?? 0).toLocaleString()} unit="" sublabel={activityStatus.label} delay={0} />
        <StatTile icon="❤️" label="Heart Rate" value={fitData?.heartRate ?? 0} unit="bpm" sublabel={fitData?.heartRate > 100 ? 'Elevated' : 'Normal'} delay={0.05} />
        <StatTile icon="😴" label="Sleep" value={fitData?.sleepHours ?? 0} unit="hrs" sublabel={fitData?.sleepHours < 6 ? 'Low' : 'Good'} delay={0.1} />
        <StatTile icon="🎯" label="Fit Score" value={`+${fitRisk?.delta ?? 0}`} unit="pts" sublabel={riskLevel + ' Risk'} delay={0.15} />
      </div>

      {/* Risk Banner */}
      <AnimatePresence>
        <motion.div
          key={riskLevel}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: riskConfig.bg,
            border: `1px solid ${riskConfig.border}`,
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: riskConfig.color, fontSize: '1rem' }}>
              {riskConfig.label} — Based on Fitness Data
            </div>
            {fitRisk?.reasons?.length > 0 && (
              <ul style={{ margin: '0.5rem 0 0', padding: '0 0 0 1.2rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {fitRisk.reasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            )}
          </div>

          {/* Smart SOS pre-check warning */}
          {fitRisk?.sosTrigger && (
            <div style={{ background: 'rgba(255,56,96,0.12)', border: '1px solid rgba(255,56,96,0.3)', borderRadius: '8px', padding: '0.6rem 1rem', fontSize: '0.8rem', color: 'var(--red)', fontWeight: 600, whiteSpace: 'nowrap' }}>
              ⚠️ Heart rate critically high
              <div style={{ fontWeight: 400, color: 'var(--text-secondary)', marginTop: '0.2rem' }}>SOS monitoring active</div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {fitError && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--yellow)' }}>⚠️ {fitError}</div>
      )}
    </div>
  );
}