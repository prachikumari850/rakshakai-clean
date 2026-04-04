import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractAccessTokenFromHash } from '../services/fitService';
import { useFit } from '../context/FitContext';

export default function FitCallback() {
  const navigate = useNavigate();
  const { onTokenReceived } = useFit();

  // useRef prevents the effect from running twice in React StrictMode
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    // Step 1: Extract token from URL hash (#access_token=...)
    const token = extractAccessTokenFromHash();

    if (token) {
      // Step 2: Persist to sessionStorage (survives React re-renders, not page refresh)
      sessionStorage.setItem('rakshak_google_token', token);

      // Step 3: Notify FitContext — triggers live data fetch
      onTokenReceived(token);

      // Step 4: Navigate to dashboard (replace so Back button doesn't loop here)
      navigate('/dashboard', { replace: true });
    } else {
      // No token in hash — Google may have returned an error,
      // or the user landed here directly. Send them to dashboard anyway.
      console.warn('[FitCallback] No access_token found in URL hash.');

      // Check if there's a Google error param in the hash
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const error = params.get('error');

      if (error) {
        console.error('[FitCallback] Google OAuth error:', error);
        // Clean the URL before redirecting
        window.history.replaceState(null, '', '/fit-callback');
        navigate('/dashboard?fit_error=' + encodeURIComponent(error), { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Minimal loading screen — shown for the ~200ms before navigate fires
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
      }}
    >
      {/* Animated pulse ring */}
      <div
        style={{
          position: 'relative',
          width: '72px',
          height: '72px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '3px solid var(--teal)',
            opacity: 0.3,
            animation: 'fit-pulse 1.4s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '10px',
            borderRadius: '50%',
            border: '3px solid var(--teal)',
            animation: 'fit-pulse 1.4s ease-in-out infinite 0.4s',
            opacity: 0.6,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '20px',
            borderRadius: '50%',
            background: 'var(--teal)',
            opacity: 0.9,
          }}
        />
        <style>{`
          @keyframes fit-pulse {
            0%, 100% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.15); opacity: 0.15; }
          }
        `}</style>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            fontSize: '1.1rem',
            color: 'var(--text-primary)',
            marginBottom: '0.4rem',
          }}
        >
          Connecting Google Fit…
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Fetching your health data, redirecting to dashboard
        </p>
      </div>
    </div>
  );
}